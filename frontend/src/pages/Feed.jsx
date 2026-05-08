import {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { Link } from "react-router-dom";

import {
  Heart,
  MessageCircle,
  HeartHandshake,
  Loader2,
} from "lucide-react";

import API from "../lib/api";
import socket from "../lib/socket";

import CreatePost from "../components/ux/CreatePost";
import CommentCard from "../components/ux/CommentCard";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Feed() {

  // =========================
  // STATES
  // =========================
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);

  const [selectedPostId, setSelectedPostId] =
    useState(null);

  const [actionLoading, setActionLoading] =
    useState({});

  const isFetching = useRef(false);

  const loggedUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user")
      );
    } catch {
      return null;
    }
  }, []);

  // =========================
  // SELECTED POST
  // =========================
  const selectedPost = useMemo(() => {
    return feed.find(
      (post) => post._id === selectedPostId
    );
  }, [feed, selectedPostId]);

  // =========================
  // FETCH FEED
  // =========================
  const fetchFeed = useCallback(async () => {

    if (isFetching.current) return;

    try {

      isFetching.current = true;

      setLoading(true);

      const res = await API.get("/feed");

      setFeed(res.data.feed || []);

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to load feed"
      );

    } finally {

      setLoading(false);

      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // =========================
  // SOCKETS
  // =========================
  useEffect(() => {

    const handlePostUpdated = (data) => {

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
    };

    const handleNewPost = (newPost) => {

      const isNearTop =
        window.scrollY < 300;

      setFeed((prev) => [
        newPost,
        ...prev,
      ]);

      // only scroll if near top
      if (isNearTop) {

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    const handleCommentAdded = (data) => {

      setFeed((prev) =>
        prev.map((post) => {

          if (post._id !== data.postId)
            return post;

          // =========================
          // REPLACE TEMP COMMENT
          // =========================
          const tempExists =
            post.comments?.some(
              (c) =>
                c._id === data.clientId
            );

          if (tempExists) {

            return {
              ...post,
              comments:
                post.comments.map((c) =>
                  c._id === data.clientId
                    ? data.comment
                    : c
                ),
            };
          }

          // =========================
          // PREVENT DUPLICATES
          // =========================
          const alreadyExists =
            post.comments?.some(
              (c) =>
                c._id === data.comment._id
            );

          if (alreadyExists)
            return post;

          // =========================
          // ADD NEW COMMENT
          // =========================
          return {
            ...post,
            comments: [
              ...(post.comments || []),
              data.comment,
            ],
          };
        })
      );
    };

    const handleFollowUpdated = (data) => {

      setFeed((prev) =>
        prev.map((post) =>
          post.user._id ===
            data.targetUserId
            ? {
              ...post,
              isFollowing:
                data.isFollowing,
            }
            : post
        )
      );
    };

    socket.on(
      "postUpdated",
      handlePostUpdated
    );

    socket.on(
      "newPost",
      handleNewPost
    );

    socket.on(
      "commentAdded",
      handleCommentAdded
    );

    socket.on(
      "followUpdated",
      handleFollowUpdated
    );

    return () => {

      socket.off(
        "postUpdated",
        handlePostUpdated
      );

      socket.off(
        "newPost",
        handleNewPost
      );

      socket.off(
        "commentAdded",
        handleCommentAdded
      );

      socket.off(
        "followUpdated",
        handleFollowUpdated
      );
    };

  }, []);

  // =========================
  // OPTIMISTIC COMMENT
  // =========================
  const handleOptimisticComment =
    useCallback((postId, comment) => {

      setFeed((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments: [
                ...(post.comments || []),
                comment,
              ],
            }
            : post
        )
      );
    }, []);

  // =========================
  // COMMENT ROLLBACK
  // =========================
  const handleRollbackComment =
    useCallback((postId, tempId) => {

      setFeed((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              comments:
                post.comments.filter(
                  (c) =>
                    c._id !== tempId
                ),
            }
            : post
        )
      );
    }, []);

  // =========================
  // LIKE HANDLER
  // =========================
  const likeHandler = async (
    postId
  ) => {

    setFeed((prev) =>
      prev.map((post) =>
        post._id === postId
          ? {
            ...post,
            isLiked: !post.isLiked,
            likesCount:
              post.isLiked
                ? post.likesCount - 1
                : post.likesCount + 1,
          }
          : post
      )
    );

    try {

      await API.post(
        `/posts/${postId}/like`
      );

    } catch (error) {

      console.error(error);

      // rollback
      setFeed((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
              ...post,
              isLiked:
                !post.isLiked,
              likesCount:
                post.isLiked
                  ? post.likesCount - 1
                  : post.likesCount + 1,
            }
            : post
        )
      );

      toast.error(
        "Failed to update like"
      );
    }
  };

  // =========================
  // FOLLOW HANDLER
  // =========================
  const followHandler = async (
    targetUserId
  ) => {

    if (
      actionLoading[targetUserId]
    ) return;

    setActionLoading((prev) => ({
      ...prev,
      [targetUserId]: true,
    }));

    // optimistic
    setFeed((prev) =>
      prev.map((post) =>
        post.user._id ===
          targetUserId
          ? {
            ...post,
            isFollowing:
              !post.isFollowing,
          }
          : post
      )
    );

    try {

      await API.post(
        `/follow/${targetUserId}`
      );

    } catch (error) {

      console.error(error);

      // rollback
      setFeed((prev) =>
        prev.map((post) =>
          post.user._id ===
            targetUserId
            ? {
              ...post,
              isFollowing:
                !post.isFollowing,
            }
            : post
        )
      );

      toast.error(
        error.response?.data
          ?.message ||
        "Follow failed"
      );

    } finally {

      setActionLoading((prev) => ({
        ...prev,
        [targetUserId]: false,
      }));
    }
  };

  // =========================
  // TIME FORMATTER
  // =========================
  const formatTimeAgo = (
    date
  ) => {

    const seconds = Math.floor(
      (new Date() -
        new Date(date)) /
      1000
    );

    if (seconds < 60)
      return "Just now";

    const minutes =
      Math.floor(seconds / 60);

    if (minutes < 60)
      return `${minutes}m`;

    const hours =
      Math.floor(minutes / 60);

    if (hours < 24)
      return `${hours}h`;

    return new Date(
      date
    ).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <div className="
      min-h-screen
      bg-zinc-50
      pb-24
    ">

      {/* CREATE POST */}
      {formOpen && (
        <CreatePost
          onClose={() =>
            setFormOpen(false)
          }
        />
      )}

      {/* FLOATING BUTTON */}
      <Button
        onClick={() =>
          setFormOpen(true)
        }
        className="
          fixed bottom-6 right-6 z-40
          h-14 w-14
          rounded-full
          bg-black
          text-white
          shadow-xl
          hover:scale-105
          transition-transform
        "
      >
        +
      </Button>

      {/* FEED */}
      <div className="
        max-w-xl mx-auto
        px-3 py-5
        space-y-6
      ">

        {/* LOADING */}
        {loading ? (

          <div className="space-y-6">

            {[1, 2, 3].map((i) => (

              <div
                key={i}
                className="
                  bg-white
                  rounded-2xl
                  p-4
                  space-y-4
                  shadow-sm
                "
              >

                <div className="
                  flex items-center gap-3
                ">

                  <Skeleton className="
                    w-10 h-10 rounded-full
                  " />

                  <Skeleton className="
                    w-32 h-4
                  " />
                </div>

                <Skeleton className="
                  w-full h-96 rounded-xl
                " />
              </div>
            ))}
          </div>

        ) : (

          feed.map((post) => (

            <article
              key={post._id}
              className="
                bg-white
                rounded-3xl
                overflow-hidden
                shadow-sm
                border
                hover:shadow-md
                transition
              "
            >

              {/* HEADER */}
              <div className="
                flex justify-between items-center
                p-4
              ">

                <Link
                  to={`/profile/${post.user._id}`}
                  className="
                    flex items-center gap-3
                  "
                >

                  <img
                    src={
                      post.user
                        ?.profilePic ||
                      "/default-avatar.png"
                    }
                    alt={
                      post.user
                        ?.userName
                    }
                    loading="lazy"
                    className="
                      w-11 h-11
                      rounded-full
                      object-cover
                      border
                    "
                  />

                  <div>

                    <p className="
                      font-semibold text-sm
                    ">
                      {
                        post.user
                          ?.userName
                      }
                    </p>

                    <p className="
                      text-xs text-zinc-400
                    ">
                      {formatTimeAgo(
                        post.createdAt
                      )}
                    </p>
                  </div>
                </Link>

                {/* FOLLOW */}
                {loggedUser?._id !==
                  post.user?._id && (

                    <Button
                      disabled={
                        actionLoading[
                        post.user._id
                        ]
                      }
                      onClick={() =>
                        followHandler(
                          post.user._id
                        )
                      }
                      className={`
                      rounded-full
                      px-4
                      ${post.isFollowing
                          ? "bg-black hover:bg-zinc-800"
                          : "bg-black text-white hover:bg-black"
                        }
                    `}
                    >

                      {actionLoading[
                        post.user._id
                      ] ? (

                        <Loader2 className="
                        w-4 h-4 animate-spin
                      " />

                      ) : post.isFollowing ? (
                        <HeartHandshake className="
                        w-4 h-4 
                      " color="#ff0000" />

                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
              </div>

              {/* CONTENT */}
              <div className="px-4 pb-3">

                <h3 className="
                  font-bold text-lg
                ">
                  {post.title}
                </h3>

                <p className="
                  text-sm text-zinc-600 mt-1
                  leading-relaxed
                ">
                  {post.caption}
                </p>
              </div>

              {/* IMAGE */}
              {post.image && (

                <div className="
                  bg-zinc-100 border-y
                ">

                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="
                      w-full
                      max-h-[650px]
                      object-contain
                    "
                  />
                </div>
              )}

              {/* ACTIONS */}
              <div className="
                flex items-center gap-6
                px-4 py-3
              ">

                {/* LIKE */}
                <button
                  onClick={() =>
                    likeHandler(
                      post._id
                    )
                  }
                  className="
                    flex items-center gap-2
                    active:scale-110
                    transition-transform
                  "
                >

                  <Heart
                    className={`
                      w-6 h-6
                      ${post.isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-zinc-700"
                      }
                    `}
                  />

                  <span className="
                    text-sm font-semibold
                  ">
                    {post.likesCount}
                  </span>
                </button>

                {/* COMMENT */}
                <button
                  onClick={() =>
                    setSelectedPostId(
                      post._id
                    )
                  }
                  className="
                    flex items-center gap-2
                    hover:opacity-70
                    transition
                  "
                >

                  <MessageCircle className="
                    w-6 h-6
                    text-zinc-700
                  " />

                  <span className="
                    text-sm font-semibold
                  ">
                    {
                      post.comments
                        ?.length
                    }
                  </span>
                </button>
              </div>

              {/* COMMENTS */}
              <div className="
                px-4 pb-4
                border-t pt-3
              ">

                {post.comments
                  ?.length > 2 && (

                    <button
                      onClick={() =>
                        setSelectedPostId(
                          post._id
                        )
                      }
                      className="
                      text-sm text-zinc-400
                      hover:text-zinc-600
                      transition
                    "
                    >
                      View all{" "}
                      {
                        post.comments
                          .length
                      }{" "}
                      comments
                    </button>
                  )}

                <div className="
                  mt-2 space-y-1
                ">

                  {post.comments
                    ?.slice(-2)
                    .map((comment) => (

                      <p
                        key={
                          comment._id
                        }
                        className="
                          text-sm
                        "
                      >

                        <span className="
                          font-semibold mr-2
                        ">
                          {
                            comment
                              .user
                              ?.userName
                          }
                        </span>

                        <span className="
                          text-zinc-700
                        ">
                          {
                            comment.text
                          }
                        </span>
                      </p>
                    ))}
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* COMMENT MODAL */}
      {selectedPost &&
        selectedPostId && (

          <CommentCard
            postId={selectedPostId}
            comments={
              selectedPost.comments ||
              []
            }
            user={loggedUser}
            onClose={() =>
              setSelectedPostId(
                null
              )
            }
            onOptimisticAdd={
              handleOptimisticComment
            }
            onRollback={
              handleRollbackComment
            }
          />
        )}
    </div>
  );
}