import React from "react"
import FormBuilder from "../common/FormBuilder.jsx"
import API from "../../lib/api.js"

export default function CreatePost({ onClose }) {

  const fields = [
    { name: "title", label: "Title", placeholder: "What's on your mind?" },
    { name: "image", label: "Image", type: "file" },
    { name: "caption", label: "Caption", type: "textarea", placeholder: "Add a caption..." },
  ]

  const handleSubmit = async (data) => {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("caption", data.caption)

    if (data.image) {
      formData.append("image", data.image)
    }

    try {
      const res = await API.post("/post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      console.log("Post created:", res.data)
      onClose() // ✅ close modal after submit
    } catch (err) {
      console.error("Error creating post:", err)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* 🔥 BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 🔥 MODAL */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-6 z-50">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {/* FORM */}
        <FormBuilder
          fields={fields}
          onSubmit={handleSubmit}
          buttonText="Post"
        />

      </div>
    </div>
  )
}