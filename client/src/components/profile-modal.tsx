import { User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, MessageSquare } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Omit<User, "password">;
  matchPercentage: number;
  onMessage: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, matchPercentage, onMessage }: ProfileModalProps) {
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

  // Get lifestyle tags
  const getLifestyleTags = (user: Omit<User, "password">) => {
    const tags: string[] = [];
    
    if (user.personality === "introvert") tags.push("Introvert");
    if (user.personality === "extrovert") tags.push("Extrovert");
    if (user.personality === "ambivert") tags.push("Ambivert");
    
    if (user.cleanliness === "very-clean") tags.push("Very clean");
    if (user.cleanliness === "clean") tags.push("Clean");
    if (user.cleanliness === "average") tags.push("Average cleanliness");
    if (user.cleanliness === "messy") tags.push("Messy");
    
    if (user.hasPets) tags.push("Has pets");
    
    return tags;
  };

  const matchStatusColor = getMatchStatusColor(matchPercentage);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Profile Details</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="sm:w-1/3 flex-shrink-0">
              <Avatar className="w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                <AvatarFallback className="text-2xl">
                  {getInitials(user.fullName || user.username)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 text-center sm:text-left">
              <h4 className="text-lg font-bold">
                {user.fullName || user.username}
                {user.age && `, ${user.age}`}
              </h4>
              <p className="text-gray-600">{user.bio ? user.bio.substring(0, 50) + '...' : ''}</p>
              {user.location && (
                <div className="mt-2 flex items-center justify-center sm:justify-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
              <div className="mt-2">
                <span className={`${matchStatusColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}>
                  {matchPercentage}% Match
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-500">Budget</h5>
                <p className="mt-1 text-sm text-gray-900">${user.budget}/month</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Move-in Date</h5>
                <p className="mt-1 text-sm text-gray-900">{user.moveInDate || 'Not specified'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Gender</h5>
                <p className="mt-1 text-sm text-gray-900">{user.gender || 'Not specified'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Smoking</h5>
                <p className="mt-1 text-sm text-gray-900">
                  {user.smoking === 'no' ? 'Non-smoker' : 
                   user.smoking === 'yes' ? 'Smoker' : 
                   user.smoking === 'occasionally' ? 'Occasional smoker' : 'Not specified'}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Pets</h5>
                <p className="mt-1 text-sm text-gray-900">{user.hasPets ? 'Has pets' : 'No pets'}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-500">Cleanliness</h5>
                <p className="mt-1 text-sm text-gray-900">
                  {user.cleanliness === 'very-clean' ? 'Very clean' : 
                   user.cleanliness === 'clean' ? 'Clean' : 
                   user.cleanliness === 'average' ? 'Average' : 
                   user.cleanliness === 'messy' ? 'Messy' : 'Not specified'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-500">Bio</h5>
              <p className="mt-1 text-sm text-gray-900">
                {user.bio || 'No bio provided.'}
              </p>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-500">Lifestyle Tags</h5>
              <div className="mt-1 flex flex-wrap gap-2">
                {getLifestyleTags(user).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {tag}
                  </Badge>
                ))}
                {getLifestyleTags(user).length === 0 && (
                  <p className="text-sm text-gray-500">No lifestyle tags specified.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-3 mt-6">
          <Button className="flex-1 gap-1" onClick={onMessage}>
            <MessageSquare className="h-4 w-4" /> Message
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
