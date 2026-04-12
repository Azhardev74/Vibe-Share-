// import { createContext, useContext, useState } from "react"
// import { getToken, setToken, removeToken } from "../lib/auth"

// const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [token, setAuthToken] = useState(getToken())

//   const login = (token) => {
//     setToken(token)
//     setAuthToken(token)
//   }

//   const logout = () => {
//     removeToken()
//     setAuthToken(null)
//   }

//   return (
//     <AuthContext.Provider value={{ token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)