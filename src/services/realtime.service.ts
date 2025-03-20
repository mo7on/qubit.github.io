import { supabase } from '@/lib/supabase';

// Initialize realtime subscriptions for a user
export function initializeRealtimeSubscriptions(userId: string, callbacks: {
  onNewMessage?: (payload: any) => void;
  onConversationUpdate?: (payload: any) => void;
}) {
  // Subscribe to new messages
  const messagesSubscription = supabase
    .channel('messages-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (callbacks.onNewMessage) {
          callbacks.onNewMessage(payload);
        }
      }
    )
    .subscribe();

  // Subscribe to conversation updates
  const conversationsSubscription = supabase
    .channel('conversations-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (callbacks.onConversationUpdate) {
          callbacks.onConversationUpdate(payload);
        }
      }
    )
    .subscribe();

  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(messagesSubscription);
    supabase.removeChannel(conversationsSubscription);
  };
}