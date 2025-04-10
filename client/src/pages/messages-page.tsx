import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Message, User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, UserCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Conversation = {
  user: Omit<User, "password">;
  lastMessage: Message;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const params = useParams();
  const [, navigate] = useLocation();
  const [messageText, setMessageText] = useState("");
  const selectedUserId = params.id ? parseInt(params.id) : null;

  // Get all conversations
  const { data: conversations, isLoading: isLoadingConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 10000, // Poll every 10 seconds
  });

  // Get messages for the selected conversation
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages", selectedUserId],
    enabled: !!selectedUserId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Get selected user's profile
  const { data: selectedUser, isLoading: isLoadingUser } = useQuery<Omit<User, "password">>(
    {
      queryKey: ["/api/profile", selectedUserId],
      enabled: !!selectedUserId,
    }
  );

  // Send message mutation
  const { mutate: sendMessage, isPending: isSending } = useMutation({
    mutationFn: async ({
      receiverId,
      content,
    }: {
      receiverId: number;
      content: string;
    }) => {
      const res = await apiRequest("POST", "/api/messages", {
        receiverId,
        content,
      });
      return await res.json();
    },
    onSuccess: () => {
      setMessageText("");
      // Invalidate queries to refetch conversations and messages
      if (selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;
    
    sendMessage({
      receiverId: selectedUserId,
      content: messageText,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !conversations?.length ? (
              <div className="text-center py-8 text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start chatting with roommates!</p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="divide-y">
                  {conversations.map((convo) => (
                    <button
                      key={convo.user.id}
                      className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors ${
                        selectedUserId === convo.user.id ? "bg-gray-100" : ""
                      }`}
                      onClick={() => navigate(`/messages/${convo.user.id}`)}
                    >
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>
                          {getInitials(convo.user.fullName || convo.user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{convo.user.fullName || convo.user.username}</div>
                        <p className="text-sm text-gray-600 truncate">
                          {convo.lastMessage.senderId === user.id ? "You: " : ""}
                          {convo.lastMessage.content}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {convo.lastMessage.createdAt &&
                          formatDistanceToNow(new Date(convo.lastMessage.createdAt), {
                            addSuffix: true,
                          })}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        
        {/* Message Thread */}
        <Card className="md:col-span-2">
          {!selectedUserId ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-gray-500">
              <UserCircle className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">Choose a roommate from the list to start chatting</p>
            </div>
          ) : isLoadingUser ? (
            <div className="flex justify-center items-center h-[calc(100vh-250px)]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarFallback>
                      {selectedUser && getInitials(selectedUser.fullName || selectedUser.username)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">
                    {selectedUser?.fullName || selectedUser?.username}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[calc(100vh-300px)]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !messages?.length ? (
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
                            message.senderId === user.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.senderId !== user.id && (
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarFallback>
                                {selectedUser && getInitials(selectedUser.fullName || selectedUser.username)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderId === user.id
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.senderId === user.id
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
                
                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex items-center">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 mr-2"
                      disabled={isSending}
                    />
                    <Button type="submit" disabled={isSending || !messageText.trim()}>
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
