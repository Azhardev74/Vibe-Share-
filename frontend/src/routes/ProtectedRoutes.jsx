import {
  Navigate,
  Outlet,
} from "react-router-dom";

export default function ProtectedRoutes() {

  const token =
    localStorage.getItem("token");

  // user authenticated
  if (token) {
    return <Outlet />;
  }

  // not authenticated
  return (
    <Navigate
      to="/login"
      replace
    />
  );
}