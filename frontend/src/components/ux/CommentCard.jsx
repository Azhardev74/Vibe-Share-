import { useState } from "react";
import API from "../../lib/api";

export default function CommentCard({ postId, comments = [], onClose, user, onOptimisticAdd, onRollback }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || posting || trimmed.length > 300) return;

    const tempId = `temp-${Date.now()}`;
    const newComment = {
      _id: tempId,
      user, // The current logged-in user object
      text: trimmed,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    // 1. Tell parent to add it immediately
    onOptimisticAdd(postId, newComment);
    setText("");
    setPosting(true);

    try {
       await API.post(`/posts/${postId}/comment`, {
        text: trimmed,
        clientId: tempId,
      });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // 2. Rollback if server fails
      onRollback(postId, tempId);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-end z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md rounded-t-2xl p-4 h-[80vh] flex flex-col shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
        
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="font-bold text-lg">Comments</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">✕</button>
        </div>

        {/* SCROLLABLE COMMENTS AREA */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          {comments.map((c) => (
            <div key={c._id} className={`flex gap-3 items-start ${c.pending ? 'opacity-50' : ''}`}>
              <img src={c.user?.profilePic} className="w-9 h-9 rounded-full object-cover border" alt="" />
              {console.log(c)}
              <div>
                <p className="text-sm">
                  <span className="font-bold mr-2">{c.user?.userName}</span>
                  {c.text}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {c.pending && " • Sending..."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT SECTION */}
        <div className="border-t pt-3 mt-2 flex gap-3 items-center">
          <img src={user?.profilePic} className="w-9 h-9 rounded-full hidden sm:block" alt="" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button 
            onClick={handleSubmit} 
            disabled={!text.trim() || posting}
            className="text-blue-500 font-bold text-sm disabled:opacity-30"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}