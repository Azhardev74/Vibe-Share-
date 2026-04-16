import React, { useState } from 'react'

export default function FormBuilder({ fields, initialValues = {}, onSubmit, buttonText }) {
    const [formData, setFormData] = useState(initialValues)

    const handleChange = (e) => {
        const { name, type, value, files } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: type === "file" ? files[0] : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData)
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            {fields.map((field) => (
                <div key={field.name}>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        {field.label}
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
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition"
            >
                {buttonText}
            </button>

        </form>
    )
}
