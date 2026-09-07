import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "./components/ui/sonner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import Prepare from "./pages/Prepare";
import Profile from "./pages/Profile";
import Assistant from "./pages/Assistant";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import SkillAnalysis from "./pages/SkillAnalysis";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/prepare" element={<Prepare />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/skills" element={<SkillAnalysis />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
