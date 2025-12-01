import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Party (Listening Room) events
  joinParty(partyId: string) {
    if (this.socket) {
      this.socket.emit('join-party', { partyId });
    }
  }

  leaveParty(partyId: string) {
    if (this.socket) {
      this.socket.emit('leave-party', { partyId });
    }
  }

  updatePartyState(partyId: string, state: { currentTrackId?: string; currentPosition?: number; isPlaying?: boolean }) {
    if (this.socket) {
      this.socket.emit('update-party-state', { partyId, ...state });
    }
  }

  sendPartyMessage(partyId: string, content: string) {
    if (this.socket) {
      this.socket.emit('send-party-message', { partyId, content });
    }
  }

  addPartyReaction(partyId: string, reaction: string) {
    if (this.socket) {
      this.socket.emit('add-party-reaction', { partyId, reaction });
    }
  }

  // Playback sync events
  syncPlayback(state: { trackId: string; position: number; isPlaying: boolean }) {
    if (this.socket) {
      this.socket.emit('sync-playback', state);
    }
  }

  // Notification events
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Party events
  onPartyUpdate(callback: (party: any) => void) {
    if (this.socket) {
      this.socket.on('party-update', callback);
    }
  }

  onPartyMemberJoined(callback: (member: any) => void) {
    if (this.socket) {
      this.socket.on('party-member-joined', callback);
    }
  }

  onPartyMemberLeft(callback: (memberId: string) => void) {
    if (this.socket) {
      this.socket.on('party-member-left', callback);
    }
  }

  onPartyMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('party-message', callback);
    }
  }

  onPartyReaction(callback: (reaction: any) => void) {
    if (this.socket) {
      this.socket.on('party-reaction', callback);
    }
  }

  onPartyStateUpdate(callback: (state: any) => void) {
    if (this.socket) {
      this.socket.on('party-state-update', callback);
    }
  }

  // Playback sync events
  onPlaybackSync(callback: (state: any) => void) {
    if (this.socket) {
      this.socket.on('playback-sync', callback);
    }
  }

  // Remove event listeners
  off(event: string, callback?: Function) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Utility methods
  isConnected() {
    return this.socket?.connected || false;
  }

  getSocketId() {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
export default socketService;