import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FilterForm from "@/components/filter-form";
import RoommateCard from "@/components/roommate-card";
import { User, RoommateFilter } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ProfileModal from "@/components/profile-modal";
import MessageModal from "@/components/message-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HomePage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<RoommateFilter>({});
  const [selectedUser, setSelectedUser] = useState<Omit<User, "password"> | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>("compatibility");
  const itemsPerPage = 6;

  // Search for roommates
  const { data: roommates, isLoading } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/roommates/search", filters],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/roommates/search", filters);
      return await res.json();
    },
  });

  // Apply filters mutation
  const { mutate: searchMutation, isPending: isSearching } = useMutation({
    mutationFn: async (newFilters: RoommateFilter) => {
      setFilters(newFilters);
      return newFilters;
    },
  });

  // Filter and sort roommates
  const processedRoommates = roommates ? [...roommates] : [];
  
  // Apply sorting
  if (processedRoommates.length) {
    if (sortBy === "budgetLow") {
      processedRoommates.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    } else if (sortBy === "budgetHigh") {
      processedRoommates.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    }
    // Compatibility would require more logic. For now, we leave it as is.
  }
  
  // Paginate
  const totalPages = Math.ceil((processedRoommates?.length || 0) / itemsPerPage);
  const paginatedRoommates = processedRoommates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // View profile handler
  const handleViewProfile = (roommate: Omit<User, "password">) => {
    setSelectedUser(roommate);
    setShowProfileModal(true);
  };

  // Message roommate handler
  const handleMessageRoommate = (roommate: Omit<User, "password">) => {
    setSelectedUser(roommate);
    setShowMessageModal(true);
  };

  // Compute match percentage (simplified version)
  const calculateMatchPercentage = (roommate: Omit<User, "password">) => {
    if (!user) return 0;
    
    let points = 0;
    let total = 0;
    
    // Location match
    if (user.location && roommate.location && user.location === roommate.location) {
      points += 30;
    }
    total += 30;
    
    // Gender preference match
    if (user.preferredGender && roommate.gender && user.preferredGender === roommate.gender) {
      points += 15;
    }
    total += 15;
    
    // Smoking preference match
    if (user.smoking && roommate.smoking && user.smoking === roommate.smoking) {
      points += 15;
    }
    total += 15;
    
    // Budget compatibility (within 20% range)
    if (user.budget && roommate.budget) {
      const diff = Math.abs(user.budget - roommate.budget);
      const percentage = diff / user.budget;
      if (percentage <= 0.2) {
        points += 20;
      }
    }
    total += 20;
    
    // Personality match
    if (user.personality && roommate.personality && user.personality === roommate.personality) {
      points += 20;
    }
    total += 20;
    
    return Math.round((points / total) * 100);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-80 lg:w-96 bg-white rounded-lg shadow-sm p-5 h-max">
          <h2 className="font-bold text-xl mb-4">Find Roommates</h2>
          <FilterForm 
            onApplyFilters={(newFilters) => searchMutation(newFilters)} 
            isLoading={isSearching}
          />
        </div>
        
        {/* Search Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl">Roommate Matches</h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Compatibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compatibility">Compatibility</SelectItem>
                  <SelectItem value="budgetLow">Budget: Low to High</SelectItem>
                  <SelectItem value="budgetHigh">Budget: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !paginatedRoommates.length ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <p className="text-lg font-semibold">No roommates found</p>
              <p className="mt-2">Try adjusting your filters to see more results</p>
            </div>
          ) : (
            <>
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedRoommates.map((roommate) => (
                  <RoommateCard
                    key={roommate.id}
                    roommate={roommate}
                    matchPercentage={calculateMatchPercentage(roommate)}
                    onViewProfile={() => handleViewProfile(roommate)}
                    onMessage={() => handleMessageRoommate(roommate)}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(i + 1)}
                        className="mx-1"
                      >
                        {i + 1}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Profile Modal */}
      {selectedUser && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={selectedUser}
          matchPercentage={calculateMatchPercentage(selectedUser)}
          onMessage={() => {
            setShowProfileModal(false);
            setShowMessageModal(true);
          }}
        />
      )}
      
      {/* Message Modal */}
      {selectedUser && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          recipient={selectedUser}
        />
      )}
    </div>
  );
}
