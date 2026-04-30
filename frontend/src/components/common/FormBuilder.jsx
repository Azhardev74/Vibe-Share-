import React, { useState } from 'react'
import { toast } from "sonner"

export default function FormBuilder({ fields, initialValues = {}, onSubmit, buttonText }) {
  const [formData, setFormData] = useState(initialValues)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, type, value, files } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }))
  }

  // 🔥 VALIDATION FUNCTION
  const validate = () => {
    for (let field of fields) {
      if (field.required) {
        const value = formData[field.name]

        if (!value || value.toString().trim() === "") {
          toast.error(`${field.label} is required`)
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    // 🔥 Run validation
    if (!validate()) return

    setLoading(true)

    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {fields.map((field) => (
        <div key={field.name}>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            {field.label} {field.required && "*"}
          </label>

          {field.type === "textarea" ? (
            <textarea
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black outline-none"
            />
          ) : field.type === "file" ? (
            <input
              type="file"
              name={field.name}
              onChange={handleChange}
              className="w-full text-sm"
            />
          ) : (
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={handleChange}
              placeholder={field.placeholder}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black outline-none"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
          }`}
      >
        {loading ? "Posting..." : buttonText}
      </button>

    </form>
  )
}