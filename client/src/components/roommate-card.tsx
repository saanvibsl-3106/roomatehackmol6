import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RoommateCardProps {
  roommate: Omit<User, "password">;
  matchPercentage: number;
  onViewProfile: () => void;
  onMessage: () => void;
}

export default function RoommateCard({ roommate, matchPercentage, onViewProfile, onMessage }: RoommateCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Determine match status color
  const getMatchStatusColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"; // High match
    if (percentage >= 70) return "bg-yellow-500"; // Medium match
    return "bg-red-500"; // Low match
  };

  const matchStatusColor = getMatchStatusColor(matchPercentage);

  // Get lifestyle tags
  const getLifestyleTags = (roommate: Omit<User, "password">) => {
    const tags: string[] = [];
    
    if (roommate.smoking === "no") tags.push("Non-smoker");
    if (roommate.smoking === "yes") tags.push("Smoker");
    if (roommate.personality === "introvert") tags.push("Introvert");
    if (roommate.personality === "extrovert") tags.push("Extrovert");
    if (roommate.cleanliness === "very-clean") tags.push("Very clean");
    if (roommate.cleanliness === "clean") tags.push("Clean");
    if (roommate.hasPets) tags.push("Pet-friendly");
    
    return tags;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">
              {getInitials(roommate.fullName || roommate.username)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className={`absolute top-3 right-3 ${matchStatusColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
          {matchPercentage}% Match
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg">
            {roommate.fullName || roommate.username}
            {roommate.age && `, ${roommate.age}`}
          </h3>
          <span className="text-gray-600">${roommate.budget}/mo</span>
        </div>
        
        {roommate.location && (
          <div className="mt-2 flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{roommate.location}</span>
          </div>
        )}
        
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {getLifestyleTags(roommate).map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100">
                {tag}
              </Badge>
            ))}
          </div>
          {roommate.bio && (
            <p className="text-gray-600 line-clamp-2 mt-2">
              {roommate.bio}
            </p>
          )}
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button 
            className="flex-1 gap-1" 
            onClick={onMessage}
          >
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 gap-1" 
            onClick={onViewProfile}
          >
            <Eye className="h-4 w-4" /> View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
