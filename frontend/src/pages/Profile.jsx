import { useEffect, useState } from "react"
import API from "../lib/api"
import UpdateProfile from "../components/ux/UpdateProfile"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)

  // 🔥 Load user + posts
  const loadData = async () => {
    try {
      setLoading(true)

      // ✅ get user from localStorage
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }

      // ✅ fetch posts
      const res = await API.get("/posts")
      setPosts(res.data.posts)

    } catch (error) {
      console.error("Error loading profile:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>
  }

  if (!user) {
    return <p className="text-center mt-10">User not found</p>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* 🔥 EDIT MODAL */}
      {editMode && (
        <UpdateProfile
          user={user}
          setUser={setUser}
          onClose={() => setEditMode(false)}
        />
      )}

      {/* 🔥 PROFILE HEADER */}
      <div className="flex flex-col md:flex-row items-center gap-6">

        {/* PROFILE IMAGE */}
        <img
          src={user.profilePic || "https://via.placeholder.com/150"}
          className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border"
        />

        {/* USER INFO */}
        <div className="flex-1 text-center md:text-left">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {user.userName}
            </h2>

            <button
              onClick={() => setEditMode(true)}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Edit Profile
            </button>
          </div>

          {/* STATS */}
          <div className="flex justify-center md:justify-start gap-6 mt-4 text-sm">
            <span><b>{posts.length}</b> posts</span>
            <span><b>0</b> followers</span>
            <span><b>0</b> following</span>
          </div>

          {/* BIO */}
          <div className="mt-3">
            <p className="font-semibold">{user.userName}</p>
            <p className="text-gray-600 text-sm">
              {user.bio || "No bio added"}
            </p>
          </div>

        </div>
      </div>

      {/* DIVIDER */}
      <div className="border-t my-6"></div>

      {/* 🔥 POSTS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

        {posts.map((post) => (
          <div key={post._id} className="group relative">

            <img
              src={post.image}
              className="w-full aspect-square object-cover rounded-md"
            />

            {/* HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-semibold">
              <span>❤️ {post.likes.length}</span>
              <span>💬 {post.comments.length}</span>
            </div>

          </div>
        ))}

        {posts.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No posts yet
          </p>
        )}

      </div>

    </div>
  )
}