import { useState, useEffect } from "react"
import API from "../lib/api.js"
import CreatePost from "../components/ux/CreatePost"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/Button"
import { useNavigate } from "react-router-dom"

export default function Feed() {
  const navigate = useNavigate()
  const [form, setForm] = useState(false)
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem("token");

  const feedHandler = async () => {
    setLoading(true)

    // 🔥 loading toast (correct way)
    const toastId = toast.loading("Fetching feed...", {
      position: "bottom-center",
    })

    try {
      const res = await API.get("/feed")

      setFeed(res?.data?.feed || [])

      // ✅ success update (replace same toast)
      toast.success("Feed loaded", { id: toastId })

    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load feed"

      // ❌ error update (same toast)
      toast.error(message, { id: toastId })

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    feedHandler()
  }, [])

  return (
    <div className="min-h-screen relative">

      {form && <CreatePost onClose={() => setForm(false)} />}

      {/* POST BUTTON */}
      <Button
        onClick={() => {
          token ? setForm(true) : navigate("/login");
        }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 
        bg-red-600 text-white py-3 px-6 w-24 rounded-xl text-lg shadow-lg"
      >
        Post
      </Button>

      <div className="max-w-xl mx-auto py-6 px-3 space-y-6">

        <h1 className="text-lg font-semibold">Home</h1>

        {/* 🔥 SKELETON LOADING */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow space-y-4">

                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="w-24 h-3" />
                    <Skeleton className="w-16 h-2" />
                  </div>
                </div>

                <Skeleton className="w-full h-64 rounded-lg" />

                <div className="flex gap-4">
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="w-6 h-6" />
                  <Skeleton className="w-6 h-6" />
                </div>

                <Skeleton className="w-32 h-3" />
                <Skeleton className="w-full h-3" />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && feed.length === 0 && (
          <p className="text-center text-gray-400">No posts yet</p>
        )}

        {/* POSTS */}
        {!loading && feed.map((post) => (
          <div key={post._id} className="bg-white rounded-xl shadow-sm border">

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
                <p className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {post.image && (
              <img
                src={post.image}
                className="w-full max-h-[500px] object-cover"
                alt="post"
              />
            )}

            <div className="flex gap-5 px-4 py-3 text-xl">
              <button>❤️</button>
              <button>💬</button>
              <button>📤</button>
            </div>

            <div className="px-4 text-sm font-semibold">
              {post.likes.length} likes
            </div>

            <div className="px-4 py-2 text-sm">
              <span className="font-semibold mr-2">
                {post.user?.userName}
              </span>
              {post.caption}
            </div>

          </div>
        ))}

      </div>
    </div>
  )
}