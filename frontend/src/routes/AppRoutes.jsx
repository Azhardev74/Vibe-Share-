// import { BrowserRouter, Routes, Route } from "react-router-dom"
// import Profile from "../pages/Profile"
// import ProtectedRoute from "./ProtectedRoute"
// import Login from "../pages/auth/login"
// import Signup from "../pages/auth/SignUp"

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* Protected */}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/profile"
//           element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   )
// }