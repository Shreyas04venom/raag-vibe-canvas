import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music2, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (user) return <Navigate to="/home" replace />;

  const submit = async (mode: 'signin' | 'signup') => {
    setBusy(true); setErr(null);
    const r = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, name || email.split('@')[0]);
    setBusy(false);
    if (r.error) setErr(r.error); else nav('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/20 to-accent/20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 w-full max-w-md border border-white/10">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 glow-primary">
            <Music2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">RaagWeather</h1>
          <p className="text-sm text-muted-foreground">Music tuned to your sky</p>
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="w-full mb-6"><TabsTrigger value="signin" className="flex-1">Sign in</TabsTrigger><TabsTrigger value="signup" className="flex-1">Sign up</TabsTrigger></TabsList>

          <TabsContent value="signin" className="space-y-4">
            <Field icon={<Mail />} label="Email" type="email" value={email} onChange={setEmail} />
            <Field icon={<Lock />} label="Password" type="password" value={password} onChange={setPassword} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button className="w-full" disabled={busy} onClick={() => submit('signin')}>{busy ? '...' : 'Sign in'}</Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Field icon={<UserIcon />} label="Name" value={name} onChange={setName} />
            <Field icon={<Mail />} label="Email" type="email" value={email} onChange={setEmail} />
            <Field icon={<Lock />} label="Password (min 6)" type="password" value={password} onChange={setPassword} />
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button className="w-full" disabled={busy} onClick={() => submit('signup')}>{busy ? '...' : 'Create account'}</Button>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
function Field({ icon, label, value, onChange, type = 'text' }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="pl-9" />
      </div>
    </div>
  );
}
