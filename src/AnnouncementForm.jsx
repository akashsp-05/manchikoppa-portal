import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

function AnnouncementForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (title.trim() === "" || content.trim() === "") {
      alert("Please provide both a title and content for the announcement.");
      return;
    }

    try {
      await addDoc(collection(db, "announcements"), {
        title: title,
        content: content,
        createdAt: serverTimestamp(),
      });
      alert("Announcement added successfully!");
      setTitle("");
      setContent("");
      navigate("/announcements"); // Navigate to the page that lists all announcements
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert("Failed to add announcement. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Add New Announcement</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Announcement Title</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Announcement Content</label>
            <textarea
              name="content"
              rows="6"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Publish Announcement
          </button>
        </form>
      </div>
    </div>
  );
}

export default AnnouncementForm;