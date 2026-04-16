import React from "react"
import FormBuilder from "../common/FormBuilder.jsx"
import API from "../../lib/api.js"

export default function UpdateProfile({ onClose, user, setUser }) {

  const fields = [
    { name: "userName", label: "Username" },
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "profilePic", label: "Profile Picture", type: "file" },
    { name: "bio", label: "Bio", type: "textarea" },
  ]

  const handleSubmit = async (data) => {
    const formData = new FormData()

    formData.append("userName", data.userName)
    formData.append("email", data.email)
    formData.append("password", data.password || "")
    formData.append("bio", data.bio || "")

    if (data.profilePic) {
      formData.append("profilePic", data.profilePic)
    }

    try {
      const res = await API.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      const updatedUser = res.data.user

      // ✅ update UI instantly
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)

      onClose()
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 z-50">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Profile</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <FormBuilder
          fields={fields}
          initialValues={user}   // 🔥 important
          onSubmit={handleSubmit}
          buttonText="Update Profile"
        />

      </div>
    </div>
  )
}