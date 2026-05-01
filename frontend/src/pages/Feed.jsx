import { useState, useEffect, useRef, useCallback } from "react";
import API from "../lib/api.js";
import CreatePost from "../components/ux/CreatePost";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import socket from "../lib/socket.js";
import CommentCard from "../components/ux/CommentCard.jsx";

export default function Feed() {
  const [form, setForm] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const isFetching = useRef(false);

  // Derived state: Always gets the fresh post data from the feed array
  const selectedPost = feed.find((p) => p._id === selectedPostId);

  // --- FETCH FEED ---
  const fetchFeed = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    try {
      const res = await API.get("/feed");
      setFeed(res?.data?.feed || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load feed");
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // --- OPTIMISTIC HELPERS (useCallback for performance) ---
  const handleOptimisticComment = useCallback((postId, newComment) => {
    setFeed((prev) =>
      prev.map((p) =>
        p._id === postId 
          ? { ...p, comments: [...(p.comments || []), newComment] } 
          : p
      )
    );
  }, []);

  const handleRollbackComment = useCallback((postId, tempId) => {
    setFeed((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: (p.comments || []).filter((c) => c._id !== tempId) }
          : p
      )
    );
    toast.error("Comment failed to send");
  }, []);

  // --- SOCKETS ---
  useEffect(() => {
    const handlePostUpdated = (data) => {
      setFeed((prev) =>
        prev.map((post) =>
          post._id === data.postId
            ? { ...post, likesCount: data.likesCount, isLiked: data.isLiked }
            : post
        )
      );
    };

    const handleNewPost = (newPost) => {
      setFeed((prev) => [newPost, ...prev]);
    };

    const handleCommentAdded = (data) => {
      setFeed((prev) =>
        prev.map((post) => {
          if (post._id !== data.postId) return post;

          // Replace optimistic temp comment with real one using clientId
          const isOwnComment = post.comments?.some((c) => c._id === data.clientId);
          if (isOwnComment) {
            return {
              ...post,
              comments: post.comments.map((c) =>
                c._id === data.clientId ? data.comment : c
              ),
            };
          }

          // Avoid duplicate comments from other users via socket
          if (post.comments?.some((c) => c._id === data.comment._id)) return post;
          
          return {
            ...post,
            comments: [...(post.comments || []), data.comment],
          };
        })
      );
    };

    socket.on("postUpdated", handlePostUpdated);
    socket.on("newPost", handleNewPost);
    socket.on("commentAdded", handleCommentAdded);

    return () => {
      socket.off("postUpdated", handlePostUpdated);
      socket.off("newPost", handleNewPost);
      socket.off("commentAdded", handleCommentAdded);
    };
  }, []);

  // --- LIKE HANDLER ---
  const likeHandler = async (postId) => {
    setFeed((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );

    try {
      await API.post(`/posts/${postId}/like`);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      // Rollback
      setFeed((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
              }
            : post
        )
      );
      toast.error("Failed to update like");
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {form && <CreatePost onClose={() => setForm(false)} />}

      <Button
        onClick={() => setForm(true)}
        className="fixed bottom-6 right-6 z-40 bg-black text-white rounded-full shadow-lg h-14 w-14 text-xl hover:scale-105 transition-transform"
      >
        +
      </Button>

      <div className="max-w-xl mx-auto py-4 px-3 space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-full h-80 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          feed.map((post) => (
            <article key={post._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden transition-all">
              {/* HEADER */}
              <div className="flex items-center gap-3 p-4">
                <img
                  src={post.user?.profilePic || "/default-avatar.png"}
                  className="w-10 h-10 rounded-full object-cover border"
                  alt={post.user?.userName}
                />
                <div>
                  <p className="font-bold text-sm">{post.user?.userName}</p>
                  <p className="text-[11px] text-gray-400">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              {/* CONTENT */}
              <div className="px-4 pb-2">
                <h3 className="font-bold text-md">{post.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{post.caption}</p>
              </div>

              {post.image && (
                <div className="bg-gray-100 flex items-center justify-center border-y">
                  <img src={post.image} className="w-full max-h-[600px] object-contain" alt="post content" loading="lazy" />
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-5 px-4 py-3">
                <button 
                   onClick={() => likeHandler(post._id)} 
                   className="flex items-center gap-1.5 transition-transform active:scale-125"
                >
                  <span className={`text-2xl ${post.isLiked ? 'text-red-500' : 'text-gray-700'}`}>
                    {post.isLiked ? "❤️" : "🤍"}
                  </span>
                  <span className="text-sm font-semibold">{post.likesCount}</span>
                </button>
                <button onClick={() => setSelectedPostId(post._id)} className="text-2xl text-gray-700 hover:opacity-70 transition-opacity">
                  💬
                </button>
              </div>

              {/* PREVIEW COMMENTS */}
              <div className="px-4 pb-4 space-y-1 border-t pt-3">
                {post.comments?.length > 2 && (
                  <button
                    onClick={() => setSelectedPostId(post._id)}
                    className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                  >
                    View all {post.comments.length} comments
                  </button>
                )}
                {post.comments?.slice(-2).map((c) => (
                  <p key={c._id} className="text-sm">
                    <span className="font-bold mr-2">{c.user?.userName}</span>
                    <span className="text-gray-700">{c.text}</span>
                  </p>
                ))}
              </div>
            </article>
          ))
        )}
      </div>

      {selectedPostId && selectedPost && (
        <CommentCard
          postId={selectedPostId}
          comments={selectedPost.comments || []}
          user={selectedPost.user} 
          onClose={() => setSelectedPostId(null)}
          onOptimisticAdd={handleOptimisticComment} // CORRECTED NAME
          onRollback={handleRollbackComment}
        />
      )}
    </div>
  );
}