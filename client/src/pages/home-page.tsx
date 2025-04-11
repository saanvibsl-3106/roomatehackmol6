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
import { Link } from "wouter";
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
    <>
  <div className="bg-container">
      <div className="overlay">
        <h1 className="typing-text">Welcome to the Roommate Finder..</h1>
      </div>
    </div>
    
     {/* <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex flex-col mt-10" >
   
      <section className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-5xl font-bold mb-4">Find Your Perfect Roommate</h1>
        <p className="text-lg max-w-2xl mb-6">
          Our platform connects you with like-minded roommates based on interests, lifestyle, and preferences. Say goodbye to random matches and hello to better living!
        </p>
        <Link href="/auth">
          <button className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-100 transition">
            Get Started
          </button>
        </Link>
      </section> */}

<div className=" flex items-center justify-center px-4 mt-20">
      <div className="max-w-6xl w-full flex bg-white  shadow-2xl overflow-hidden">
        
        {/* Left Side with Content */}
        <div className="w-2/3 p-10 flex flex-col justify-center text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Find Your Perfect Roommate</h1>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Our platform connects you with like-minded roommates based on interests, lifestyle, and preferences.
            Say goodbye to random matches and hello to better living!
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition">
            Get Started
          </button>
        </div>

        {/* Right Side - Blue Visual */}
        <div className="w-1/3 bg-gradient-to-t from-blue-600 to-indigo-500 flex justify-center items-center">
          {/* Optional graphic/icon/illustration can go here */}
          <span className="text-white text-2xl font-semibold">RoomieMatch</span>
        </div>
      </div>
    </div>

      {/* Image and Info Section */}
      {/* <section className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white text-slate-800 px-6 py-16">
        <div className="md:w-1/2">
          <img
            src=".././public/flat3.jpg"
            alt="Roommate Finder Illustration"
            className="w-full h-auto rounded-2xl shadow-lg"
          />
        </div>
        <div className="md:w-1/2 text-left">
          <h2 className="text-3xl font-bold mb-4 text-violet-600">How It Works</h2>
          <ul className="space-y-3 text-lg">
            <li>🔍 Answer a few questions to help us understand your preferences.</li>
            <li>🤝 We match you with compatible roommates in your preferred location.</li>
            <li>💬 Chat with your matches to get to know them better.</li>
            <li>🏠 Finalize the move and enjoy stress-free shared living!</li>
          </ul>
        </div>
      </section> */}
    {/* </div> */}

    <div className="section-container">
      <div className="section-image">
        <img src="public/flat3.jpg" alt="Modern apartment interior" />
      </div>
      <div className="section-text">
        <h2>How It Works</h2>
        <ul>
          <li>🔍 Answer a few questions to help us understand your preferences.</li>
          <li>🤝 We match you with compatible roommates in your preferred location.</li>
          <li>💬 Chat with your matches to get to know them better.</li>
          <li>🏠 Finalize the move and enjoy stress-free shared living!</li>
        </ul>
      </div>
    </div>

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
    </>
  );
}
