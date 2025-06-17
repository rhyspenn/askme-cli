// Ask Me tool parameter interface
export interface AskMeArgs {
  what_we_did?: string;
}

// Image attachment interface
export interface ImageAttachment {
  id: string;
  data: string;
  mimeType: string;
  size: number;
  placeholder: string;
}

// Socket message interface
export interface SocketMessage {
  ask_me: string;
  timestamp: number;
  images?: ImageAttachment[];
}
