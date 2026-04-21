/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export default function Navigation({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const navigate = useNavigate()

  const loadAuth = () => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }

  useEffect(() => {
    loadAuth()
    window.addEventListener("storage", loadAuth)
    return () => window.removeEventListener("storage", loadAuth)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    navigate("/login")
  }

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 
        bg-black border-b border-white/10 
        text-white px-4 py-3 flex justify-around items-center">

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
                <Link to="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isLoggedIn && (
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/profile">Profile</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}

            {!isLoggedIn ? (
              <>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/login">Login</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/signup">Signup</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </>
            ) : (
              <NavigationMenuItem>
                <button onClick={handleLogout} className="text-red-400">
                  Logout
                </button>
              </NavigationMenuItem>
            )}

          </NavigationMenuList>
        </NavigationMenu>
      </div>

      
      {/* MAIN */}
      <main className="pt-20 bg-gray-50 min-h-screen">
        <Toaster
        // position="top-center"
        // offset="120px"
        // expand={false}
        // closeButton
        // visibleToasts={1}
        className="z-[9999]"
      />
        {children}
        
      </main>
    </>
  )
}