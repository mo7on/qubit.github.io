export type Ticket = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
};

export type TicketInsert = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;
export type TicketUpdate = Partial<Omit<Ticket, 'id' | 'created_at' | 'updated_at'>>;

export type Article = {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'>;

// Add these types to your existing database.types.ts file

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  status: 'active' | 'closed';
  message_count: number;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  is_user: boolean;
  created_at: string;
};

export type ConversationInsert = Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
export type MessageInsert = Omit<Message, 'id' | 'created_at'>;
export type Device = {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  created_at: string;
  updated_at: string;
};

export type DeviceInsert = Omit<Device, 'id' | 'created_at' | 'updated_at'>;
export type DeviceUpdate = Partial<Omit<Device, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;