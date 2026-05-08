import { useParams } from "react-router-dom";
import API from "../lib/api";
import UpdateProfile from "../components/ux/UpdateProfile";
import { useEffect, useState, useRef } from "react";
import socket from "../lib/socket";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartHandshake } from "lucide-react";

export default function Profile() {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const isFetching = useRef(false);

  const loggedUser = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async () => {

    if (isFetching.current) return;

    try {

      isFetching.current = true;
      setLoading(true);

      const idToFetch = userId || loggedUser?._id;

      const res = await API.get(
        `/user/users/${idToFetch}/profile`
      );

      setProfile(res.data.user);
      setPosts(res.data.posts || []);

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load profile"
      );

    } finally {

      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  // =========================
  // SOCKET FOLLOW UPDATE
  // =========================
  useEffect(() => {

    const handleFollowUpdated = (data) => {

      if (data.targetUserId !== profile?._id) return;

      setProfile((prev) => {

        if (!prev) return prev;

        const alreadyFollower =
          prev.followers?.includes(data.followerId);

        return {
          ...prev,
          followers: data.isFollowing
            ? alreadyFollower
              ? prev.followers
              : [...prev.followers, data.followerId]
            : prev.followers.filter(
              (id) => id !== data.followerId
            )
        };
      });
    };

    socket.on("followUpdated", handleFollowUpdated);

    return () => {
      socket.off("followUpdated", handleFollowUpdated);
    };

}, [profile?._id]);
  // =========================
  // FOLLOW HANDLER
  // =========================
  const followHandler = async () => {

    if (!profile) return;

    const currentlyFollowing =
      profile.followers?.includes(loggedUser._id);

    // optimistic update
    setProfile((prev) => ({
      ...prev,
      followers: currentlyFollowing
        ? prev.followers.filter(
          (id) => id !== loggedUser._id
        )
        : [...(prev.followers || []), loggedUser._id]
    }));

    try {

      await API.post(`/follow/${profile._id}`);

    } catch (error) {

      // rollback
      setProfile((prev) => ({
        ...prev,
        followers: currentlyFollowing
          ? [...(prev.followers || []), loggedUser._id]
          : prev.followers.filter(
            (id) => id !== loggedUser._id
          )
      }));

      toast.error(
        error.response?.data?.message ||
        "Failed to update follow status"
      );
    }
  };

  // =========================
  // DERIVED STATES
  // =========================
  const isOwnProfile =
    loggedUser?._id === profile?._id;

  const isFollowing =
    profile?.followers?.includes(loggedUser?._id);

  // =========================
  // LOADING
  // =========================
  if (loading) {

    return (
      <div className="max-w-5xl mx-auto px-4 py-6">

        <div className="flex items-center gap-6">
          <Skeleton className="w-28 h-28 rounded-full" />

          <div className="space-y-3">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-60 h-4" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>

      </div>
    );
  }

  // =========================
  // NO USER
  // =========================
  if (!profile) {
    return (
      <p className="text-center mt-10">
        User not found
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* EDIT MODAL */}
      {editMode && isOwnProfile && (
        <UpdateProfile
          user={profile}
          setUser={setProfile}
          onClose={() => setEditMode(false)}
        />
      )}

      {/* =========================
          PROFILE HEADER
      ========================== */}
      <div className="flex flex-col md:flex-row items-center gap-8">

        {/* PROFILE IMAGE */}
        <img
          src={
            profile.profilePic ||
            "https://via.placeholder.com/150"
          }
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border shadow"
          alt={profile.userName}
        />

        {/* USER INFO */}
        <div className="flex-1 text-center md:text-left">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <h2 className="text-2xl font-bold">
              {profile.userName}
            </h2>

            {/* ACTION BUTTON */}
            {isOwnProfile ? (

              <Button
                onClick={() => setEditMode(true)}
                className="bg-black text-white"
              >
                Edit Profile
              </Button>

            ) : (

              <Button
                onClick={followHandler}
                className={`text-white ${isFollowing
                  ? "bg-gray-600"
                  : "bg-blue-500"
                  }`}
              >
                {isFollowing
                  ? <HeartHandshake />
                  : "Follow"}
              </Button>
            )}
          </div>

          {/* STATS */}
          <div className="flex justify-center md:justify-start gap-8 mt-5 text-sm">

            <span>
              <b>{posts.length}</b> posts
            </span>

            <span>
              <b>{profile.followers?.length || 0}</b> followers
            </span>

            <span>
              <b>{profile.following?.length || 0}</b> following
            </span>
          </div>

          {/* BIO */}
          <div className="mt-4">

            <p className="font-semibold">
              {profile.userName}
            </p>

            <p className="text-gray-600 text-sm whitespace-pre-wrap">
              {profile.bio || "No bio added"}
            </p>
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t my-8"></div>

      {/* =========================
          POSTS GRID
      ========================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

        {posts.map((post) => (

          <div
            key={post._id}
            className="group relative overflow-hidden rounded-lg"
          >

            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              className="w-full aspect-square object-cover transition duration-300 group-hover:scale-105"
            />

            {/* HOVER */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-semibold">

              <span>
                ❤️ {post.likes?.length || 0}
              </span>

              <span>
                💬 {post.comments?.length || 0}
              </span>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
}