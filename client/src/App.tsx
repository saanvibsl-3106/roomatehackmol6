import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import MessagesPage from "@/pages/messages-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import QuestionnairePage from "./pages/questionnaire-page"; // Added import
import PropertySearch from "./pages/Propertyfinder-page";


function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/messages" component={MessagesPage} />
          <ProtectedRoute path="/messages/:id" component={MessagesPage} />
          <ProtectedRoute path="/questionnaire" component={QuestionnairePage} />
          <Route path="/propertyfinder" component={PropertySearch} />
           {/* Added route */}
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;