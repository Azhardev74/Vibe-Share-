import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import API from "../lib/api";

import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Loader2,
  Search,
  Home,
  User,
  LogOut,
} from "lucide-react";

export default function Navigation() {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const debounceRef = useRef(null);

  const inputRef = useRef(null);

  const navigate = useNavigate();

  const location = useLocation();

  const loggedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  })();

  useEffect(() => {

    const checkAuth = () => {
      setToken(localStorage.getItem("token"));
    };

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener(
        "storage",
        checkAuth
      );
    };

  }, []);

  useEffect(() => {

    if (!open) return;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

  }, [open]);

  useEffect(() => {

    if (!open) {
      setQuery("");
      setResults([]);
      setSearchLoading(false);
    }

  }, [open]);

  const searchUsers = async (value) => {

    try {

      if (!value.trim()) {
        setResults([]);
        return;
      }

      setSearchLoading(true);

      const res = await API.get(
        `/search?query=${encodeURIComponent(value)}`
      );

      setResults(res.data.users || []);

    } catch (error) {

      console.error(error);

    } finally {

      setSearchLoading(false);
    }
  };

  useEffect(() => {

    clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchUsers(query);
    }, 400);

    return () => {
      clearTimeout(debounceRef.current);
    };

  }, [query]);

  const handleLogout = () => {

    try {

      setLogoutLoading(true);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);

      toast.success("Logged out");

      navigate("/login");

    } catch (error) {

      console.error(error);

      toast.error("Logout failed");

    } finally {

      setLogoutLoading(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="
        fixed top-0 left-0 z-50
        w-full
        bg-black/90 backdrop-blur-md
        border-b border-white/10
        text-white
      ">

        <div className="
          max-w-7xl mx-auto
          px-3 sm:px-4 py-3
          flex flex-wrap items-center justify-between
          gap-2
        ">

          <Link
            to="/"
            className="flex items-center gap-1 text-lg sm:text-2xl font-extrabold tracking-tight"
          >
            <span>Vibe</span>

            <span className="text-red-500">
              Share
            </span>
          </Link>

          <NavigationMenu>

            <NavigationMenuList className="flex flex-wrap items-center justify-end gap-1 sm:gap-2 min-w-0">

              <NavigationMenuItem>

                <Dialog
                  open={open}
                  onOpenChange={setOpen}
                >

                  <DialogTrigger asChild>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="
                        rounded-full
                        hover:bg-zinc-800
                        text-white
                        p-2
                      "
                    >
                      <Search className="w-5 h-5" />
                    </Button>

                  </DialogTrigger>

                  <DialogContent
                    className="
                      bg-black text-white
                      border border-zinc-800
                      rounded-2xl
                      sm:max-w-lg
                      p-0
                      overflow-hidden
                    "
                  >

                    {/* HEADER */}
                    <DialogHeader className="px-5 py-4 border-b border-zinc-800">

                      <DialogTitle className="text-xl font-bold">
                        Search Users
                      </DialogTitle>

                    </DialogHeader>

                    {/* SEARCH INPUT */}
                    <div className="p-5 border-b border-zinc-800">

                      <div className="relative">

                        <Search
                          className="
                            absolute
                            left-3 top-1/2
                            -translate-y-1/2
                            w-4 h-4
                            text-zinc-400
                          "
                        />

                        <Input
                          ref={inputRef}
                          value={query}
                          onChange={(e) =>
                            setQuery(e.target.value)
                          }
                          placeholder="Search profiles..."
                          className="
                            pl-10
                            bg-zinc-900
                            border-zinc-700
                            focus-visible:ring-1
                          "
                        />
                      </div>
                    </div>

                    {/* RESULTS */}
                    <div className="
                      max-h-[450px]
                      overflow-y-auto
                      p-3
                      space-y-2
                    ">

                      {/* LOADING */}
                      {searchLoading && (

                        <div className="
                          flex items-center justify-center
                          py-10 text-zinc-400
                        ">

                          <Loader2 className="
                            w-5 h-5
                            animate-spin mr-2
                          " />

                          Searching...
                        </div>
                      )}

                      {/* EMPTY */}
                      {!searchLoading &&
                        query &&
                        results.length === 0 && (

                          <div className="
                            flex flex-col items-center
                            justify-center
                            py-12 text-zinc-500
                          ">

                            <Search className="
                              w-10 h-10 mb-3 opacity-40
                            " />

                            <p>No users found</p>
                          </div>
                        )}

                      {/* INITIAL */}
                      {!searchLoading &&
                        !query && (

                          <div className="
                            flex flex-col items-center
                            justify-center
                            py-12 text-zinc-500
                          ">

                            <Search className="
                              w-10 h-10 mb-3 opacity-40
                            " />

                            <p>
                              Search profiles instantly
                            </p>
                          </div>
                        )}

                      {/* USERS */}
                      {!searchLoading &&
                        results.map((user) => (

                          <Link
                            key={user._id}
                            to={`/profile/${user._id}`}
                            onClick={() =>
                              setOpen(false)
                            }
                            className="
                              flex items-center gap-3
                              p-3 rounded-xl
                              hover:bg-zinc-900
                              transition
                            "
                          >

                            {/* IMAGE */}
                            <img
                              src={
                                user.profilePic ||
                                "/default-avatar.png"
                              }
                              alt={user.userName}
                              loading="lazy"
                              className="
                                w-12 h-12
                                rounded-full
                                object-cover
                                border border-zinc-700
                              "
                            />

                            {/* USER INFO */}
                            <div className="flex-1 min-w-0">

                              <p className="
                                font-semibold truncate
                              ">
                                {user.userName}
                              </p>

                              <div className="
                                flex gap-3 mt-1
                                text-xs text-zinc-400
                              ">

                                <span>
                                  {user.followersCount} followers
                                </span>

                                <span>
                                  {user.followingCount} following
                                </span>
                              </div>
                            </div>

                            {/* FOLLOW BADGE */}
                            {user.isFollowing && (

                              <span className="
                                text-xs
                                bg-zinc-800
                                px-2 py-1
                                rounded-full
                              ">
                                Following
                              </span>
                            )}
                          </Link>
                        ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </NavigationMenuItem>

              <NavigationMenuItem>

                <NavigationMenuLink asChild>

                  <Link
                    to="/"
                    className={`
                      flex items-center gap-1 sm:gap-2
                      px-2 py-2 sm:px-3 sm:py-2
                      text-xs sm:text-sm
                      rounded-full
                      transition
                      ${isActive("/")
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-900 text-zinc-300"
                      }
                    `}
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden md:block">
                      Home
                    </span>
                  </Link>

                </NavigationMenuLink>
              </NavigationMenuItem>

              {token && (

                <NavigationMenuItem>

                  <NavigationMenuLink asChild>

                    <Link
                      to="/profile"
                      className={`
                        flex items-center gap-1 sm:gap-2
                        px-2 py-2 sm:px-3 sm:py-2
                        text-xs sm:text-sm
                        rounded-full
                        transition
                        ${isActive("/profile")
                          ? "bg-zinc-800 text-white"
                          : "hover:bg-zinc-900 text-zinc-300"
                        }
                      `}
                    >

                      {loggedUser?.profilePic ? (

                        <img
                          src={loggedUser.profilePic}
                          className="
                            w-6 h-6
                            rounded-full
                            object-cover
                          "
                        />

                      ) : (

                        <User className="w-4 h-4" />
                      )}

                      <span className="hidden md:block">
                        Profile
                      </span>
                    </Link>

                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              <NavigationMenuItem>

                {token ? (

                  <Button
                    onClick={handleLogout}
                    disabled={logoutLoading}
                    className="
                      bg-red-600 hover:bg-red-700
                      rounded-full
                      px-2 py-2 sm:px-3 sm:py-2
                      text-xs sm:text-sm
                      text-white
                      min-w-[2.5rem]
                    "
                  >

                    {logoutLoading ? (

                      <Loader2 className="
                        w-4 h-4 animate-spin
                      " />

                    ) : (

                      <>
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">
                          Logout
                        </span>
                      </>
                    )}
                  </Button>

                ) : (

                  <Link to="/login">

                    <Button
                      className="
                        rounded-full
                        bg-white text-black
                        hover:bg-zinc-200
                        px-2 py-2 sm:px-3 sm:py-2
                        text-xs sm:text-sm
                        min-w-[2.5rem]
                      "
                    >
                      <span className="hidden sm:inline">
                        Login
                      </span>
                      <span className="sm:hidden">
                        <User className="w-4 h-4" />
                      </span>
                    </Button>

                  </Link>
                )}
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>

      <main
        className="
          pt-20
          min-h-screen
          bg-zinc-50
        "
      >

        <Toaster
          closeButton
          position="top-center"
        />

        <Outlet />

      </main>
    </>
  );
}