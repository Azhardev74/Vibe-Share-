/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"

export default function Navigation({ children }) {
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

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to="/profile">Profile</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>


          </NavigationMenuList>
        </NavigationMenu>
      </div>


      {/* MAIN */}
      <main className="pt-20 bg-gray-50 min-h-screen">
        <Toaster
          closeButton
          className="z-[9999]"
        />
        {children}

      </main>
    </>
  )
}