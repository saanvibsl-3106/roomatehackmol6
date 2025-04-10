import { createContext, ReactNode, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Message, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type Conversation = {
  user: Omit<User, "password">;
  lastMessage: Message;
};

type MessageContextType = {
  sendMessage: (receiverId: number, content: string) => void;
  isSending: boolean;
  conversations: Conversation[] | undefined;
  isLoadingConversations: boolean;
  getMessages: (userId: number) => Message[] | undefined;
  isLoadingMessages: boolean;
};

const MessageContext = createContext<MessageContextType | null>(null);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Get all conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    staleTime: 10000, // 10 seconds
  });

  // Function to get messages for a specific user
  const getMessages = (userId: number) => {
    const { data } = useQuery<Message[]>({
      queryKey: ["/api/messages", userId],
      staleTime: 5000, // 5 seconds
    });
    return data;
  };

  // Check if messages are loading
  const { isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: false, // Don't actually run this query
  });

  // Send message mutation
  const { mutate, isPending: isSending } = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId,
        content,
      });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refetch conversations and messages
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages", variables.receiverId] });
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = (receiverId: number, content: string) => {
    mutate({ receiverId, content });
  };

  return (
    <MessageContext.Provider
      value={{
        sendMessage,
        isSending,
        conversations,
        isLoadingConversations,
        getMessages,
        isLoadingMessages,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
}
