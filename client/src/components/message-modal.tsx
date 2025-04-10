import { useState } from "react";
import { User, Message } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Loader2, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: Omit<User, "password">;
}

export default function MessageModal({ isOpen, onClose, recipient }: MessageModalProps) {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");

  // Get messages between users
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", recipient.id],
    enabled: isOpen && !!recipient.id,
    refetchInterval: isOpen ? 5000 : false, // Poll every 5 seconds while modal is open
  });

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId: recipient.id,
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setMessageText("");
      // Invalidate queries to refetch messages
      queryClient.invalidateQueries({ queryKey: ["/api/messages", recipient.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center border-b border-gray-200 pb-3">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {getInitials(recipient.fullName || recipient.username)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <DialogTitle>{recipient.fullName || recipient.username}</DialogTitle>
              <p className="text-sm text-gray-500">{recipient.location || ''}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <ScrollArea className="py-4 h-64">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p>No messages yet</p>
              <p className="text-sm mt-1">Send a message to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.senderId !== user?.id && (
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {getInitials(recipient.fullName || recipient.username)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === user?.id
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === user?.id
                          ? "text-primary-foreground/70"
                          : "text-gray-500"
                      }`}
                    >
                      {message.createdAt &&
                        formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <form onSubmit={handleSendMessage} className="flex items-center border-t border-gray-200 pt-4">
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 mr-2"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !messageText.trim()}>
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
