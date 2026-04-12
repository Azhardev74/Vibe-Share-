import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import { Login } from "./pages/auth/login"
import SignUp from "./pages/auth/SignUp"
import Navigation from "./pages/Navigation"
import Profile from "./pages/Profile"
import Feed from "./pages/Feed"

import { SidebarProvider } from "./components/ui/sidebar"
import ProtectedRoutes from "./routes/ProtectedRoutes"
import Home from "./pages/Home"

export default function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Navigation>
          <Routes>

            {/* 🔐 Protected Routes Group */}
            <Route element={<ProtectedRoutes />}>
            <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/feed" element={<Feed />} />
            </Route>

            {/* 🌐 Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

          </Routes>
        </Navigation>
      </SidebarProvider>
    </BrowserRouter>
  )
}