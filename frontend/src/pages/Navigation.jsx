/* eslint-disable react-hooks/set-state-in-effect */
import { Link, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";

export default function Navigation({ children }) {
  const [loading, setLoading] = useState(false);
  // 🔥 Store token in state to make the UI reactive
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();

  // 🔥 Sync token state whenever localStorage changes (Live track)
  useEffect(() => {
    const checkAuth = () => {
      const currentToken = localStorage.getItem("token");
      setToken(currentToken);
    };

    // Listen for storage events (other tabs)
    window.addEventListener("storage", checkAuth);
    
    // Custom interval to check local changes if not using a State Management library (Redux/Zustand)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    setLoading(true);
    // Remove token
    localStorage.removeItem("token");
    setToken(null); // Update state immediately for live UI change

    setTimeout(() => {
      setLoading(false);
      navigate("/login"); // Use navigate instead of window.location for speed
    }, 800);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black border-b border-white/10 text-white px-4 py-3 flex justify-around items-center">
        <h1 className="text-xl font-extrabold">
          <Link to="/">
            <span>Vibe</span>
            <span className="text-red-500 ml-1">Share</span>
          </Link>
        </h1>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-5">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* 🔥 Only show Profile if logged in */}
            {token && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/profile" className="hover:text-red-500 transition-colors">Profile</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {/* 🔥 Live Tracking Logout/Login Buttons */}
            {token ? (
              <NavigationMenuItem>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-sm font-bold bg-red-600 px-4 py-1.5 rounded-full hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link 
                    to="/login" 
                    className="text-sm font-bold bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Login
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* MAIN CONTENT */}
      <main className="pt-20 bg-gray-50 min-h-screen">
        <Toaster closeButton position="top-center" />
        {children}
      </main>
    </>
  );
}