import { useState, useEffect } from "react";
import API from "../../lib/api";

export default function CommentCard({
  postId,
  comments = [],
  onClose,
  socket,
  user,
}) {
  const [text, setText] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  const [posting, setPosting] = useState(false);

  // 🔥 SYNC COMMENTS FROM PARENT
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // 🔥 SOCKET LISTENER (SAFE CLEANUP)
  useEffect(() => {
    if (!socket) return;

    const handleCommentAdded = (data) => {
      if (data.postId !== postId) return;

      setLocalComments((prev) => {
        // 🔥 Replace temp comment if clientId matches
        if (data.clientId) {
          const updated = prev.map((c) =>
            c._id === data.clientId ? data.comment : c
          );

          const exists = updated.some((c) => c._id === data.comment._id);
          if (!exists) updated.push(data.comment);

          return updated;
        }

        // 🔥 Avoid duplicates
      const exists = prev.some((c) => c._id === data.comment._id);
if (exists) return prev;

        return [...prev, data.comment];
      });
    };

    socket.on("commentAdded", handleCommentAdded);

    return () => {
      socket.off("commentAdded", handleCommentAdded);
    };
  }, [socket, postId]);

  // 🔥 SUBMIT COMMENT
  const handleSubmit = async () => {
    const trimmed = text.trim();

    if (!trimmed || posting) return;
    if (trimmed.length > 300) return; // limit

    const tempId = "temp-" + Date.now();

    const newComment = {
      _id: tempId,
      user,
      text: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // ✅ Optimistic UI
    setLocalComments((prev) => [...prev, newComment]);
    setText("");
    setPosting(true);

    try {
      await API.post(`/posts/${postId}/comment`, {
        text: trimmed,
        clientId: tempId,
      });
    } catch (err) {
      // 🔴 Rollback on failure
      setLocalComments((prev) =>
        prev.filter((c) => c._id !== tempId)
      );
      console.error("Comment failed:", err);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-end z-50">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-4 h-[70vh] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Comments</h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* COMMENTS */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {localComments.map((c) => (
            <div key={c._id} className="flex gap-2 items-start">
              <img
                src={c.user?.profilePic || "Unknown User"}
                alt="user"
                className="w-8 h-8 rounded-full object-cover"
              />

              <div>
                <p className="text-sm">
                  <span className="font-semibold mr-1">
                    {c.user?.userName  || "Unknown"}
                  </span>
                  {c.text}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleString()}
                  {c.pending && " • sending..."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex gap-2 mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={300}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={handleSubmit}
            disabled={posting}
            className="bg-black text-white px-4 rounded-lg disabled:opacity-50"
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}