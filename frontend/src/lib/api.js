
// // const API = axios.create({
// //     baseURL: "http://localhost:3000/api",
// //     // baseURL: "https://vibe-share-ylt8.onrender.com/api",
// // });
import axios from "axios";

import { toast } from "sonner";

// =========================
// AXIOS INSTANCE
// =========================
const API = axios.create({

  baseURL:
    import.meta.env.VITE_API_URL ||
    // "http://localhost:3000/api",
    "https://vibe-share-ylt8.onrender.com/api",

  withCredentials: true,

  timeout: 10000,
});

// =========================
// REQUEST INTERCEPTOR
// =========================
API.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem("token");

    // =========================
    // AUTH ROUTES
    // =========================
    const authRoutes = [
      "/login",
      "/signup",
    ];

    const isAuthRoute =
      authRoutes.some((route) =>
        config.url.includes(route)
      );

    // =========================
    // ATTACH TOKEN
    // =========================
    if (
      token &&
      !isAuthRoute
    ) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// =========================
// RESPONSE INTERCEPTOR
// =========================
API.interceptors.response.use(

  // SUCCESS
  (response) => response,

  // ERROR
  (error) => {

    const status =
      error?.response?.status;

    const message =
      error?.response?.data?.message;

    // =========================
    // REQUEST URL
    // =========================
    const requestURL =
      error?.config?.url || "";

    // =========================
    // AUTH ROUTES
    // =========================
    const authRoutes = [
      "/login",
      "/signup",
    ];

    const isAuthRoute =
      authRoutes.some((route) =>
        requestURL.includes(route)
      );

    // =========================
    // TOKEN ERRORS
    // =========================
    const isTokenError =
      status === 401 ||
      message === "jwt expired" ||
      message === "Invalid token" ||
      message ===
        "Token invalid or expired";

    // =========================
    // AUTO LOGOUT
    // =========================
    if (
      isTokenError &&
      !isAuthRoute
    ) {

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      toast.error(
        "Session expired. Login again."
      );

      window.location.replace(
        "/login"
      );
    }

    return Promise.reject(error);
  }
);

export default API;