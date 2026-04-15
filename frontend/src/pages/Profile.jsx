/* eslint-disable react-hooks/set-state-in-effect */
import { Avatar, AvatarImage } from '../components/ui/avatar'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card } from "@/components/ui/card"
import API from '../lib/api'

export default function Profile() {
  const [postData, setPostData] = useState([]);
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    profilePic: "",
    bio: ""
  });

  // 🔥 Fetch posts
  const posts = async () => {
    try {
      const res = await API.get("/posts");
      setPostData(res.data.posts)
      console.log(res.data.posts[0].user)
    } catch (error) {
      console.error("Error fetching posts:", error.response?.data || error.message);
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);

        setFormData({
          userName: parsed.userName || "",
          email: parsed.email || "",
          profilePic: parsed.profilePic || "",
          bio: parsed.bio || "",
          password: ""
        });

      } catch (error) {
        console.log(error)
        localStorage.removeItem("user");
      }
    }
    posts();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditMode(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* 🔥 PROFILE HEADER */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <Avatar className="w-24 h-24 md:w-32 md:h-32 border">
          <AvatarImage src={user?.profilePic} />
        </Avatar>

        <div className="w-full">
          <div className="flex flex-col md:flex-row md:justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold">
              {user?.userName?.toUpperCase()}
            </h2>

            <Button
              onClick={() => setEditMode(true)}
              className="w-full md:w-auto bg-blue-500 text-white"
            >
              Edit Profile
            </Button>
          </div>

          <div className="flex justify-center md:justify-start gap-6 mt-4 text-sm">
            <span><b>{postData.length}</b> posts</span>
            <span><b>250</b> followers</span>
            <span><b>180</b> following</span>
          </div>

          <div className="mt-4">
            <p className="font-semibold">{user?.userName}</p>
            <p className="text-gray-600">{user?.bio || "No bio"}</p>
          </div>
        </div>
      </div>

      {/* 🔥 EDIT PROFILE */}
      {editMode && (
        <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Username</Label>
              <Input name="userName" value={formData.userName} onChange={handleChange} />
            </div>

            <div>
              <Label>Email</Label>
              <Input name="email" value={formData.email} onChange={handleChange} />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" name="password" value={formData.password} onChange={handleChange} />
            </div>

            <div>
              <Label>Profile Image URL</Label>
              <Input name="profilePic" value={formData.profilePic} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <Label>Bio</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setEditMode(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-green-500 text-white">Save</Button>
          </div>
        </div>
      )}

      <div className="border-t my-6"></div>

      {/* 🔥 POSTS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {postData.map((item) => (
          <div key={item._id}>

            {/* 📱 MOBILE CARD */}
            <div className="block md:hidden">
              <Card className="mb-4 overflow-hidden rounded-xl shadow">

                <div className="flex items-center gap-3 p-3">
                  <img src={item.user?.profilePic} className="w-8 h-8 rounded-full" />
                  <p className="text-sm font-semibold">{item.user?.userName}</p>
                </div>

                <img src={item.image} className="w-full h-60 object-cover" />

                <div className="p-3">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.caption}</p>
                </div>

                <div className="flex justify-between px-3 pb-3 text-sm">
                  <span>❤️ {item.likes.length}</span>
                  <span>💬 {item.comments.length}</span>
                </div>

              </Card>
            </div>

            {/* 💻 DESKTOP GRID */}
            <div
              className="hidden md:block cursor-pointer"
              onClick={() => setSelectedPost(item)}
            >
              <div className="relative group">
                <img
                  src={item.image}
                  className="w-full aspect-square object-cover rounded-md"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-6 text-white font-semibold">
                  <span>❤️ {item.likes.length}</span>
                  <span>💬 {item.comments.length}</span>
                </div>
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* 🔥 MODAL */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Image */}
            <div className="md:w-1/2">
              <img src={selectedPost.image} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="md:w-1/2 p-4 flex flex-col">

              <div className="flex items-center gap-3 mb-4">
                <img src={selectedPost.user?.profilePic} className="w-10 h-10 rounded-full" />
                <p className="font-semibold">{selectedPost.user?.userName}</p>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto">
                <h2 className="text-lg font-semibold">{selectedPost.title}</h2>
                <p className="text-gray-600 text-sm">{selectedPost.caption}</p>
              </div>

              <div className="flex justify-between mt-4 text-sm">
                <span>❤️ {selectedPost.likes.length}</span>
                <span>💬 {selectedPost.comments.length}</span>
              </div>

              <button
                onClick={() => setSelectedPost(null)}
                className="mt-4 bg-black text-white py-2 rounded-md"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  )
}