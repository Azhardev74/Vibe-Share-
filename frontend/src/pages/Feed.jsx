import { useState, useEffect, useRef } from "react";
import API from "../lib/api.js";
import CreatePost from "../components/ux/CreatePost";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import socket from "../lib/socket.js";
import { Link } from "react-router-dom";
import CommentCard from "../components/ux/CommentCard.jsx";

export default function Feed() {
  const [form, setForm] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const isFetching = useRef(false); // prevent duplicate calls
  // 🔥 FETCH FEED
  const fetchFeed = async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    const toastId = toast.loading("Fetching feed...");

    try {
      const res = await API.get("/feed");
      setFeed(res?.data?.feed || []);

      toast.success("Feed loaded", { id: toastId });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load feed";
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // 🔥 LIKE HANDLER (Optimistic UI)
  const likeHandler = async (postId) => {
    // 🔥 Optimistic update first
    setFeed((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likesCount: post.isLiked
              ? post.likesCount - 1
              : post.likesCount + 1,
          }
          : post
      )
    );

    try {
      await API.post(`/posts/${postId}/like`);
    } catch (error) {
      // 🔴 rollback if failed
      setFeed((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
            }
            : post
        )
      );

      toast.error("Failed to update like", error);
    }
  };

  // 🔥 INITIAL LOAD
  useEffect(() => {
    fetchFeed();
  }, []);

  // 🔥 SOCKET (ALL EVENTS IN ONE PLACE)
  useEffect(() => {
    // LIKE UPDATE
    socket.on("postUpdated", (data) => {
      setFeed((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? {
              ...post,
              likesCount: data.likesCount,
              isLiked: data.isLiked,
            }
            : post
        )
      );
    });

    // NEW POST
    socket.on("newPost", (newPost) => {
      setFeed((prev) => [newPost, ...prev]);
    });

    // ✅ COMMENT UPDATE (FIXED)
    socket.on("commentAdded", (data) => {
      setFeed((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? {
              ...post,
              comments: [...(post.comments || []), data.comment],
            }
            : post
        )
      );

      setSelectedPost((prev) =>
        prev?._id === data.postId
          ? {
            ...prev,
            comments: [...(prev.comments || []), data.comment],
          }
          : prev
      );
    });

    return () => {
      socket.off("postUpdated");
      socket.off("newPost");
      socket.off("commentAdded");
    };
  }, []);
  const formatTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    // older than 7 days → show date
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  return (
    <div className="min-h-screen relative">
      {form && <CreatePost onClose={() => setForm(false)} />}

      {/* POST BUTTON */}
      <Button onClick={() => setForm(true)}
        className="fixed bottom-6 right-0 -translate-x-1/2 z-40 bg-black text-white p-6 w-20 rounded-xl"
      >
        Post +
      </Button>

      <div className="max-w-xl mx-auto py-2 px-3 space-y-6">
        {/* LOADING */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow space-y-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-full h-64 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* POSTS */}
        {!loading &&
          feed.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl shadow-sm border mb-6 overflow-hidden"
            >
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4">
                <img
                  src={post.user?.profilePic}
                  className="w-10 h-10 rounded-full object-cover"
                  alt="user"
                />
                <div>
                  <p className="font-semibold text-sm">
                    {post.user?.userName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              {/* TITLE + CAPTION */}
              <div className="px-4 pb-2">
                <p className="font-semibold text-base">{post.title}</p>
                <p className="text-sm text-gray-600">{post.caption}</p>
              </div>

              {/* IMAGE */}
              {post.image && (
                <img
                  src={post.image}
                  className="w-full max-h-[500px] object-cover"
                  alt="post"
                />
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-6 px-4 py-3 text-xl">
                <button
                  onClick={() => likeHandler(post._id)}
                  className="flex items-center gap-1"
                >
                  <span>{post.isLiked ? "❤️" : "🤍"}</span>
                  <span className="text-sm font-medium">
                    {post.likesCount}
                  </span>
                </button>

                <button onClick={() => setSelectedPost(post)}>💬</button>
              </div>

              {/* COMMENTS */}
              <div className="px-4 pb-4 space-y-1">
                {/* Show "view all" if more than 2 */}
                {post.comments?.length > 2 && (
                  <p
                    onClick={() => setSelectedPost(post)}
                    className="text-sm text-gray-400 cursor-pointer"
                  >
                    View all {post.comments.length} comments
                  </p>
                )}

                {/* Last 2 comments */}
                {post.comments?.slice(-2).map((c) => (
                  <p key={c._id} className="text-sm">
                    <span className="font-semibold mr-1">
                      {c.user?.userName}
                    </span>
                    {c.text}
                  </p>
                ))}
              </div>
            </div>
          ))}
        {selectedPost && (
          <CommentCard
            postId={selectedPost._id}
            comments={selectedPost.comments || []}
            socket={socket}
            user={selectedPost.user} // make sure defined
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
    </div>
  );
}