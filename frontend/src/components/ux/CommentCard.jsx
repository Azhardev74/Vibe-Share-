import {
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  Loader2,
  SendHorizontal,
} from "lucide-react";

import API from "../../lib/api";

import { toast } from "sonner";

export default function CommentCard({
  postId,
  comments = [],
  onClose,
  user,
  onOptimisticAdd,
  onRollback,
}) {

  // =========================
  // STATES
  // =========================
  const [text, setText] =
    useState("");

  const [posting, setPosting] =
    useState(false);

  // =========================
  // SORT COMMENTS
  // =========================
  const sortedComments =
    useMemo(() => {

      return [...comments].sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );

    }, [comments]);

  // =========================
  // SUBMIT COMMENT
  // =========================
  const handleSubmit =
    useCallback(async () => {

      const trimmed =
        text.trim();

      if (
        !trimmed ||
        posting ||
        trimmed.length > 300
      ) {
        return;
      }

      // =========================
      // TEMP COMMENT
      // =========================
      const tempId =
        `temp-${Date.now()}`;

      const optimisticComment = {
        _id: tempId,
        text: trimmed,
        createdAt:
          new Date().toISOString(),
        pending: true,
        user: {
          _id: user?._id,
          userName:
            user?.userName,
          profilePic:
            user?.profilePic,
        },
      };

      // optimistic update
      onOptimisticAdd(
        postId,
        optimisticComment
      );

      setText("");

      setPosting(true);

      try {

        await API.post(
          `/posts/${postId}/comment`,
          {
            text: trimmed,
            clientId: tempId,
          }
        );

      } catch (error) {

        console.error(error);

        onRollback(
          postId,
          tempId
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Comment failed"
        );

      } finally {

        setPosting(false);
      }

    }, [
      text,
      posting,
      postId,
      user,
      onOptimisticAdd,
      onRollback,
    ]);

  // =========================
  // TIME FORMAT
  // =========================
  const formatTime = (
    date
  ) => {

    return new Date(
      date
    ).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div
      onClick={onClose}
      className="
        fixed inset-0 z-50
        bg-black/60
        backdrop-blur-sm
        flex justify-center items-end
      "
    >

      {/* MODAL */}
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          bg-white
          w-full max-w-md
          h-[82vh]
          rounded-t-3xl
          shadow-2xl
          flex flex-col
          animate-in slide-in-from-bottom
        "
      >

        {/* HANDLE */}
        <div className="
          w-12 h-1.5
          bg-zinc-300
          rounded-full
          mx-auto mt-3
        " />

        {/* HEADER */}
        <div className="
          flex items-center justify-between
          px-5 py-4
          border-b
        ">

          <h2 className="
            text-lg font-bold
          ">
            Comments
          </h2>

          <button
            onClick={onClose}
            className="
              w-9 h-9
              rounded-full
              hover:bg-zinc-100
              flex items-center justify-center
              transition
            "
          >
            ✕
          </button>
        </div>

        {/* COMMENTS */}
        <div className="
          flex-1
          overflow-y-auto
          px-4 py-3
          space-y-5
        ">

          {sortedComments.length ===
            0 && (

            <div className="
              h-full
              flex items-center justify-center
              text-zinc-400
              text-sm
            ">
              No comments yet
            </div>
          )}

          {sortedComments.map(
            (comment) => (

              <div
                key={comment._id}
                className="
                  flex gap-3
                  items-start
                "
              >

                {/* PROFILE */}
                <img
                  src={
                    comment.user
                      ?.profilePic ||
                    "/default-avatar.png"
                  }
                  alt={
                    comment.user
                      ?.userName
                  }
                  loading="lazy"
                  className="
                    w-10 h-10
                    rounded-full
                    object-cover
                    border
                    flex-shrink-0
                  "
                />

                {/* CONTENT */}
                <div className="
                  flex-1
                ">

                  <div className="
                    bg-zinc-100
                    rounded-2xl
                    px-4 py-2.5
                  ">

                    <p className="
                      font-semibold
                      text-sm
                    ">
                      {
                        comment.user
                          ?.userName
                      }
                    </p>

                    <p className="
                      text-sm
                      text-zinc-700
                      break-words
                    ">
                      {
                        comment.text
                      }
                    </p>
                  </div>

                  <div className="
                    flex items-center gap-2
                    mt-1 px-2
                  ">

                    <p className="
                      text-[11px]
                      text-zinc-400
                    ">
                      {formatTime(
                        comment.createdAt
                      )}
                    </p>

                    {comment.pending && (

                      <Loader2 className="
                        w-3 h-3
                        animate-spin
                        text-zinc-400
                      " />
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* INPUT */}
        <div className="
          border-t
          p-4
          bg-white
        ">

          <div className="
            flex items-center gap-3
          ">

            <img
              src={
                user?.profilePic ||
                "/default-avatar.png"
              }
              alt=""
              className="
                w-10 h-10
                rounded-full
                object-cover
                border
              "
            />

            <div className="
              flex-1
              flex items-center
              bg-zinc-100
              rounded-full
              px-4
            ">

              <input
                value={text}
                maxLength={300}
                onChange={(e) =>
                  setText(
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleSubmit()
                }
                placeholder="Add a comment..."
                className="
                  flex-1
                  bg-transparent
                  py-3
                  text-sm
                  outline-none
                "
              />

              <button
                disabled={
                  !text.trim() ||
                  posting
                }
                onClick={
                  handleSubmit
                }
                className="
                  disabled:opacity-40
                  transition
                "
              >

                {posting ? (

                  <Loader2 className="
                    w-5 h-5
                    animate-spin
                    text-zinc-500
                  " />

                ) : (

                  <SendHorizontal className="
                    w-5 h-5
                    text-blue-500
                  " />
                )}
              </button>
            </div>
          </div>

          {/* CHARACTER COUNT */}
          <div className="
            text-right
            text-[11px]
            text-zinc-400
            mt-1 mr-2
          ">
            {text.length}/300
          </div>
        </div>
      </div>
    </div>
  );
}