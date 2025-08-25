// src/ComplaintSection.jsx

import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // Ensure you have your firebase config file with 'db' exported
import { Link, useNavigate } from 'react-router-dom';

function ComplaintSection() {
    const [name, setName] = useState('');
    const [complaintText, setComplaintText] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim() === '' || complaintText.trim() === '') {
            alert("Please provide both your name and complaint.");
            return;
        }

        try {
            await addDoc(collection(db, "feedback"), {
                name: name,
                complaint: complaintText,
                timestamp: serverTimestamp(),
            });
            alert("Complaint submitted successfully!");
            setName('');
            setComplaintText('');
        } catch (error) {
            console.error("Error submitting complaint:", error);
            alert("Failed to submit complaint. Please try again.");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-auto mt-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Submit a Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-semibold">Your Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold">Your Complaint</label>
                    <textarea
                        value={complaintText}
                        onChange={(e) => setComplaintText(e.target.value)}
                        rows="4"
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    ></textarea>
                </div>
                <button
                    type="submit"
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-300"
                >
                    Submit Complaint
                </button>
            </form>
            <div className="mt-6 text-center">
                <Link to="/admin-feedback" className="text-blue-500 hover:underline font-medium">
                    Click here to see all complaints
                </Link>
            </div>
        </div>
    );
}

export default ComplaintSection;