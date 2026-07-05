import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/app-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Send, Copy, Plus, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function Party() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [parties, setParties] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [party, setParty] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  // list
  useEffect(() => {
    if (id) return;
    supabase.from('parties').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => setParties(data ?? []));
  }, [id]);

  // room
  useEffect(() => {
    if (!id) return;
    let sub: any;
    (async () => {
      const { data } = await supabase.from('parties').select('*').eq('id', id).maybeSingle();
      setParty(data);
      if (user) {
        await supabase.from('party_members').upsert({ party_id: id, user_id: user.id }, { onConflict: 'party_id,user_id' });
      }
      const { data: msgs } = await supabase.from('party_messages').select('*').eq('party_id', id).order('created_at').limit(100);
      setMessages(msgs ?? []);
      const { data: mem } = await supabase.from('party_members').select('*').eq('party_id', id);
      setMembers(mem ?? []);
      sub = supabase.channel(`party:${id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'party_messages', filter: `party_id=eq.${id}` }, (p) => setMessages((m) => [...m, p.new]))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${id}` }, async () => {
          const { data: mem } = await supabase.from('party_members').select('*').eq('party_id', id);
          setMembers(mem ?? []);
        })
        .subscribe();
    })();
    return () => { if (sub) supabase.removeChannel(sub); };
  }, [id, user]);

  const createParty = async () => {
    if (!user || !name.trim()) return;
    const { data, error } = await supabase.from('parties').insert({ host_id: user.id, name }).select().single();
    if (error) return toast.error(error.message);
    nav(`/party/${data.id}`);
  };
  const joinByCode = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    const { data, error } = await supabase.from('parties').select('id').eq('invite_code', code).maybeSingle();
    if (error || !data) return toast.error('Invalid code');
    nav(`/party/${data.id}`);
  };
  const sendMsg = async () => {
    if (!user || !msg.trim() || !id) return;
    await supabase.from('party_messages').insert({ party_id: id, user_id: user.id, content: msg });
    setMsg('');
  };
  const leave = async () => {
    if (user && id) await supabase.from('party_members').delete().eq('party_id', id).eq('user_id', user.id);
    nav('/party');
  };
  const copyCode = () => { if (party) { navigator.clipboard.writeText(party.invite_code); toast.success('Code copied!'); } };

  if (id && party) {
    return (
      <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
        <Navigation />
        <main className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">{party.name}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-muted-foreground">Invite code:</span>
                  <code className="glass px-3 py-1 rounded-lg font-mono">{party.invite_code}</code>
                  <Button size="icon" variant="ghost" onClick={copyCode}><Copy className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Users className="w-3 h-3" />{members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
              <Button variant="outline" size="sm" onClick={leave} className="gap-2"><LogOut className="w-4 h-4" />Leave</Button>
            </div>
          </div>

          <div className="glass rounded-3xl p-4 flex flex-col h-[60vh]">
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Say hi! 👋</p>}
              {messages.map((m) => (
                <div key={m.id} className={`p-2 rounded-lg max-w-[80%] ${m.user_id === user?.id ? 'ml-auto bg-primary/30' : 'bg-white/5'}`}>
                  <p className="text-sm">{m.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Message the party..." />
              <Button onClick={sendMsg} size="icon"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 md:pb-32 md:pl-64">
      <Navigation />
      <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold gradient-text">🎉 Listening Parties</h1>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" />Host a party</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Party name" />
            <Button onClick={createParty} className="w-full">Create party</Button>
          </div>
          <div className="glass rounded-2xl p-6 space-y-3">
            <h2 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" />Join with code</h2>
            <Input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" className="font-mono uppercase" />
            <Button onClick={joinByCode} className="w-full">Join party</Button>
          </div>
        </div>
        {parties.length > 0 && (
          <section>
            <h2 className="font-semibold mb-3">Public rooms</h2>
            <div className="space-y-2">
              {parties.map((p) => (
                <button key={p.id} onClick={() => nav(`/party/${p.id}`)} className="glass rounded-xl p-4 w-full text-left hover:bg-white/5 transition flex items-center justify-between">
                  <span className="font-medium">{p.name}</span>
                  <code className="text-xs text-muted-foreground font-mono">{p.invite_code}</code>
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
