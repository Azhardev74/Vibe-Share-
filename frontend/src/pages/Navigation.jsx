/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export default function Navigation({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  const navigate = useNavigate()

  const loadAuth = () => {
    const token = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    setIsLoggedIn(!!token)
    setUser(storedUser ? JSON.parse(storedUser) : null)
  }

  useEffect(() => {
    loadAuth()
    window.addEventListener("storage", loadAuth)
    return () => window.removeEventListener("storage", loadAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setIsLoggedIn(false)
    setUser(null)

    navigate("/login")
  }

  return (
    <>
      {/* 🔥 TOP NAVBAR */}
      <div className="fixed top-0 left-0 w-full z-50 
        bg-black backdrop-blur-md 
        border-b border-white/10 
        text-white px-4 md:px-6 py-2 md:py-3 
        flex justify-around items-center">

        {/* 🔥 LOGO */}
        <h1 className="text-xl md:text-2xl font-extrabold tracking-wide font-logo">
          <Link to="/" className="flex items-center">
            <span className="text-white">Vibe</span>
            <span className="text-red-500 ml-1">Share</span>
          </Link>
        </h1>

        {/* 🔥 NAV MENU */}
        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-3 md:gap-5 text-sm md:text-base">

            <NavigationMenuItem>
              <Link to="/">
                <NavigationMenuLink className="text-white hover:text-gray-300">
                  Home
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {isLoggedIn && (
              <NavigationMenuItem>
                <Link to="/profile">
                  <NavigationMenuLink className="text-white hover:text-gray-300">
                    Profile
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}

            {!isLoggedIn && (
              <>
                <NavigationMenuItem>
                  <Link to="/login">
                    <NavigationMenuLink className="text-white hover:text-gray-300">
                      Login
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/signup">
                    <NavigationMenuLink className="text-white hover:text-gray-300">
                      Signup
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </>
            )}

            {isLoggedIn && (
              <NavigationMenuItem>
                <button onClick={handleLogout}>
                  <NavigationMenuLink className="text-red-400 hover:text-red-300">
                    Logout
                  </NavigationMenuLink>
                </button>
              </NavigationMenuItem>
            )}

          </NavigationMenuList>
        </NavigationMenu>

      </div>

      {/* PAGE CONTENT */}
      <main className="pt-20 p-6 bg-gray-50 min-h-screen">
        {children}
      </main>
    </>
  )
}