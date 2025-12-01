import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Track } from './MusicContext';
import { partyAPI } from '../services/api.service';
import socketService from '../services/socket.service';

export interface Party {
  id: string;
  name: string;
  description?: string;
  password?: string; // Optional password for private parties
  isPublic: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  participants: string[];
  participantCount: number;
  currentTrack?: Track;
  playbackState: 'playing' | 'paused';
  playbackPosition: number;
  shareLink: string;
}

interface PartyMessage {
  id: string;
  partyId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

interface PartyContextType {
  party: Party | null;
  messages: PartyMessage[];
  allParties: Party[];
  currentUserName: string;
  setCurrentUserName: (name: string) => void;
  createParty: (name: string, description?: string, isPublic?: boolean, password?: string) => Promise<void>;
  joinParty: (partyId: string, password?: string) => Promise<boolean>;
  leaveParty: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  getAllParties: () => Party[];
}

const PartyContext = createContext<PartyContextType | undefined>(undefined);

// Simulated parties storage (in production, this would be from backend)
const partiesStorage: Map<string, Party> = new Map();

export const PartyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [party, setParty] = useState<Party | null>(null);
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [allParties, setAllParties] = useState<Party[]>([]);
  const [currentUserName, setCurrentUserName] = useState('Guest');

  // Load parties on mount
  useEffect(() => {
    const storedParties = localStorage.getItem('parties');
    if (storedParties) {
      try {
        const parties = JSON.parse(storedParties);
        parties.forEach((p: Party) => partiesStorage.set(p.id, p));
        setAllParties(parties);
      } catch (error) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save parties to localStorage whenever they change
  useEffect(() => {
    const parties = Array.from(partiesStorage.values());
    localStorage.setItem('parties', JSON.stringify(parties));
    setAllParties(parties);
  }, []);

  useEffect(() => {
    if (party) {
      // Skip socket connection if backend is not available
      try {
        socketService.connect();
        socketService.joinParty(party.id);

        socketService.onPartyUpdate((updatedParty: Party) => {
          setParty(updatedParty);
        });

        socketService.onMessageReceived((message: PartyMessage) => {
          setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => {
          try {
            socketService.leaveParty(party.id);
            socketService.disconnect();
          } catch (error) {
            // Socket not available, ignore
          }
        };
      } catch (error) {
        // Socket service not available, continue without it
      }
    }
  }, [party]);

  const generatePartyId = () => {
    return Math.random().toString(36).substr(2, 12);
  };

  const createParty = async (name: string, description?: string, isPublic?: boolean, password?: string) => {
    try {
      const newPartyId = generatePartyId();
      const newParty: Party = {
        id: newPartyId,
        name,
        description,
        password: password || undefined,
        isPublic: isPublic ?? true,
        createdBy: 'user',
        createdByName: currentUserName,
        createdAt: Date.now(),
        participants: [currentUserName],
        participantCount: 1,
        playbackState: 'paused',
        playbackPosition: 0,
        shareLink: `${window.location.origin}/party/${newPartyId}`,
      };

      try {
        await partyAPI.createParty({ name, description, isPublic, password });
      } catch (error) {
        // API not available, use local fallback
      }

      partiesStorage.set(newPartyId, newParty);
      setAllParties(Array.from(partiesStorage.values()));
      setParty(newParty);
      setMessages([]);
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  };

  const joinParty = async (partyId: string, password?: string): Promise<boolean> => {
    try {
      const existingParty = partiesStorage.get(partyId);

      if (existingParty) {
        // Check password if required
        if (existingParty.password && existingParty.password !== password) {
          return false; // Wrong password
        }

        // Add user to participants if not already there
        if (!existingParty.participants.includes(currentUserName)) {
          existingParty.participants.push(currentUserName);
          existingParty.participantCount = existingParty.participants.length;
          partiesStorage.set(partyId, existingParty);
          setAllParties(Array.from(partiesStorage.values()));
        }

        setParty(existingParty);
        setMessages([]);
        return true;
      }

      // Try to fetch from API
      try {
        const partyToJoin = await partyAPI.getPartyById(partyId);
        if (partyToJoin.password && partyToJoin.password !== password) {
          return false;
        }
        setParty(partyToJoin);
        setMessages([]);
        return true;
      } catch (error) {
        // Create fallback party with provided ID
        const fallbackParty: Party = {
          id: partyId,
          name: `Party ${partyId.substring(0, 8)}`,
          description: 'Live party listening room',
          isPublic: true,
          createdBy: 'host',
          createdByName: 'Host',
          createdAt: Date.now(),
          participants: [currentUserName, 'host', 'user2'],
          participantCount: 3,
          playbackState: 'playing',
          playbackPosition: 0,
          shareLink: `${window.location.origin}/party/${partyId}`,
        };
        partiesStorage.set(partyId, fallbackParty);
        setAllParties(Array.from(partiesStorage.values()));
        setParty(fallbackParty);
        setMessages([]);
        return true;
      }
    } catch (error) {
      console.error('Error joining party:', error);
      return false;
    }
  };

  const leaveParty = async () => {
    if (party) {
      try {
        // Remove user from participants
        if (party.participants.includes(currentUserName)) {
          party.participants = party.participants.filter(p => p !== currentUserName);
          party.participantCount = party.participants.length;
          partiesStorage.set(party.id, party);
          setAllParties(Array.from(partiesStorage.values()));
        }

        await partyAPI.leaveParty(party.id);
      } catch (error) {
        // API not available, ignore
      }
      setParty(null);
      setMessages([]);
    }
  };

  const sendMessage = async (message: string) => {
    if (party) {
      try {
        socketService.sendMessage(party.id, message);
      } catch (error) {
        // Add message locally if socket is not available
        const newMessage: PartyMessage = {
          id: Math.random().toString(36).substr(2, 9),
          partyId: party.id,
          userId: 'you',
          userName: currentUserName,
          message,
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    }
  };

  const getAllParties = (): Party[] => {
    return Array.from(partiesStorage.values());
  };

  return (
    <PartyContext.Provider
      value={{
        party,
        messages,
        allParties,
        currentUserName,
        setCurrentUserName,
        createParty,
        joinParty,
        leaveParty,
        sendMessage,
        getAllParties,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
};

export const useParty = () => {
  const context = useContext(PartyContext);
  if (!context) {
    throw new Error('useParty must be used within a PartyProvider');
  }
  return context;
};
