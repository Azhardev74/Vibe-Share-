/* eslint-disable react-hooks/set-state-in-effect */
import { Avatar, AvatarImage } from '../components/ui/avatar'
import { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export default function Profile() {

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    profilePic: "",
    bio: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setFormData({
        userName: parsed.userName || "",
        email: parsed.email || "",
        profilePic: parsed.profilePic || "",
        bio: parsed.bio || "",
        password: ""
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...formData
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setEditMode(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Profile View */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

        <Avatar className="w-24 h-24 md:w-32 md:h-32 border">
          <AvatarImage
            src={user?.profilePic || "https://github.com/pranathip.png"}
            alt="User"
          />
        </Avatar>

        <div className="w-full">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-lg md:text-xl font-semibold">
              {user?.userName?.toUpperCase()}
            </h2>

            <Button
              onClick={() => setEditMode(true)}
              className="bg-blue-500 text-white"
            >
              Edit Profile
            </Button>
          </div>

          <div className="flex gap-6 text-sm mt-4">
            <span><b>10</b> posts</span>
            <span><b>250</b> followers</span>
            <span><b>180</b> following</span>
          </div>

          <div className="mt-4">
            <p className="font-semibold">{user?.userName}</p>
            <p className="text-gray-600">{user?.bio || "No bio"}</p>
          </div>

        </div>
      </div>

      {/* 🔥 Update Profile UI (ONLY when editMode = true) */}
      {editMode && (
        <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border">

          <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>

          <div className="grid md:grid-cols-2 gap-4">

            <div>
              <Label>Username</Label>
              <Input
                name="userName"
                value={formData.userName}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label>Profile Image URL</Label>
              <Input
                name="profilePic"
                value={formData.profilePic}
                onChange={handleChange}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Bio</Label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
                rows={3}
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              className="bg-green-500 text-white"
            >
              Save Changes
            </Button>
          </div>

        </div>
      )}

      {/* Divider */}
      <div className="border-t my-6"></div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {[1,2,3,4,5,6].map((item) => (
          <div key={item} className="bg-gray-200 aspect-square"></div>
        ))}
      </div>

    </div>
  )
}