import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '../store/authStore'

export default function ProtectedRoutes() {
    const token = localStorage.getItem("token") // replace with useAuth() if using context
    return token ? <Outlet /> : <Navigate to="/login" />

}

