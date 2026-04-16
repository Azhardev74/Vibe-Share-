import { useState, useEffect } from "react"
import API from "../lib/api.js"
import CreatePost from "../components/ux/CreatePost"

export default function Feed() {
  const [form, setForm] = useState(false)
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(false)

  const feedHandler = async () => {
    try {
      setLoading(true)
      const res = await API.get("/feed")
      setFeed(res.data.feed)
    } catch (error) {
      console.error("Error fetching feed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    feedHandler()
  }, [])

  return (
    <div className="bg-gray-100 min-h-screen relative">

      {/* 🔥 CREATE POST MODAL (GLOBAL) */}
      {form && <CreatePost onClose={() => setForm(false)} />}

      {/* 🔥 FLOATING POST BUTTON */}
    <button
  onClick={() => setForm(true)}
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 
  bg-red-800 text-white py-3 px-6
  w-24 rounded-xl
  text-2xl shadow-lg 
  hover:scale-105 transition"
>
  Post
</button>

      {/* 🔥 FEED CONTAINER */}
      <div className="max-w-xl mx-auto py-6 px-3 space-y-6">

        {/* HEADER */}
        <h1 className="text-xl font-bold">Home Feed</h1>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {/* Empty */}
        {!loading && feed.length === 0 && (
          <p className="text-center text-gray-500">No posts yet</p>
        )}

        {/* 📱 POSTS */}
        {feed.map((post) => (
          <div
            key={post._id}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >

            {/* 👤 HEADER */}
            <div className="flex items-center justify-between p-4">

              <div className="flex items-center gap-3">
                <img
                  src={post.user?.profilePic}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />

                <div>
                  <p className="font-semibold text-sm">
                    {post.user?.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button className="text-gray-500 text-lg">•••</button>
            </div>

            {/* 🖼 IMAGE */}
            {post.image && (
              <img
                src={post.image}
                className="w-full max-h-[500px] object-cover"
              />
            )}

            {/* ❤️ ACTIONS */}
            <div className="flex items-center gap-5 px-4 py-3 text-xl">
              <button className="hover:scale-110 transition">❤️</button>
              <button className="hover:scale-110 transition">💬</button>
              <button className="hover:scale-110 transition">📤</button>
            </div>

            {/* 👍 LIKES */}
            <div className="px-4 text-sm font-semibold">
              {post.likes.length} likes
            </div>

            {/* 📝 CAPTION */}
            <div className="px-4 py-2 text-sm leading-relaxed">
              <span className="font-semibold mr-2">
                {post.user?.userName}
              </span>
              {post.caption}
            </div>

            {/* 💬 COMMENTS */}
            {post.comments.length > 0 && (
              <div className="px-4 pb-3 text-sm text-gray-500">
                View all {post.comments.length} comments
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  )
}