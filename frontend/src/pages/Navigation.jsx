/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, User, LogIn, LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";

export default function Navigation({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const { open, setOpen } = useSidebar();

  // ✅ Load auth
  const loadAuth = () => {
    try {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      setIsLoggedIn(!!token);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      setUser(null);
    }
  };

  // ✅ Initial setup
  useEffect(() => {
    loadAuth();

    // ✅ ONLY close sidebar on mobile (fix blur bug)
    if (window.innerWidth < 768) {
      setOpen(false);
    }

    window.addEventListener("storage", loadAuth);
    return () => window.removeEventListener("storage", loadAuth);
  }, [setOpen]);

  // ✅ Close sidebar helper
  const closeSidebar = () => setOpen(false);

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setUser(null);

    closeSidebar();
    navigate("/login");
  };

  return (
    <>
      <div className="w-full absloute">
        {/* ✅ BACKDROP (only when open) */}
        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={closeSidebar}
          />
        )}

        {/* SIDEBAR */}
        <Sidebar
          collapsible="offcanvas"
          className="border-r z-50"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <SidebarHeader className="bg-black border-b border-gray-800">
            <div className="px-4 py-3 text-xl font-bold text-white">
              ABD
            </div>
          </SidebarHeader>

          {/* USER */}
          {isLoggedIn && user && (
            <div className="bg-black px-4 py-4 border-b border-gray-800 flex items-center gap-3">
              <img
                src={
                  user.profilePic ||
                  `https://ui-avatars.com/api/?name=${user.userName}`
                }
                alt="User"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm text-white">{user.userName}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}

          {/* NAV */}
          <SidebarContent className="bg-black">
            <SidebarGroup>
              <SidebarGroupLabel className="text-gray-400 text-xs px-3">
                Navigation
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {isLoggedIn && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-white hover:bg-gray-800 rounded-md">
                          <Link to="/" onClick={closeSidebar}>
                            <Home size={20} />
                            <span>Home</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-white hover:bg-gray-800 rounded-md">
                          <Link to="/profile">
                            <User size={20} />
                            <span>Profile</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {!isLoggedIn && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-white hover:bg-gray-800 rounded-md">
                          <Link to="/login" onClick={closeSidebar}>
                            <LogIn size={20} />
                            <span>Login</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-white hover:bg-gray-800 rounded-md">
                          <Link to="/signup" onClick={closeSidebar}>
                            <User size={20} />
                            <span>Signup</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {isLoggedIn && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={handleLogout}
                        className="text-red-400 hover:bg-gray-800 rounded-md"
                      >
                        <LogOut size={20} />
                        <span>Logout</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* FOOTER */}
          <SidebarFooter className="bg-black border-t border-gray-800">
            <div className="text-xs px-4 py-2 text-gray-500">
              Abu Azhar © 2026
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN */}
        <SidebarInset >
          <header className="flex h-12  fixed w-full z-30 mb-20 items-center justify-between bg-black text-white px-4">
            {/* ✅ Toggle works on BOTH mobile + desktop */}
            <SidebarTrigger onClick={() => setOpen(!open)} />

            {!open && user && (
              <Link to="/profile">
                <img
                  src={
                    user.profilePic ||
                    `https://ui-avatars.com/api/?name=${user.userName}`
                  }
                  alt="Profile"
                  className="w-10 h-10 p-1 rounded-full object-cover"
                />
              </Link>
            )}
          </header>

          <main className="p-10 bg-gray-50 min-h-screen">
            {children}
          </main>
        </SidebarInset>
      </div>
    </>
  );
}