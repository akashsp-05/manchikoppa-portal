import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import myPhoto from './myphoto.jpg';

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login successful! You can now view and manage details.");
            navigate("/");
        } catch (error) {
            console.error("Error signing in:", error);
            alert("Failed to log in. Please check your email and password.");
        }
    };

    // inside the AdminLogin() function
return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            {/* My Photo - positioned at the top right with a rounded shape */}
            <div className="flex justify-end">
                <img
                    src={myPhoto}
                    alt="Admin Profile"
                    className="w-24 h-24 rounded-full mb-8"
                />
            </div>
            {/* Admin Login title with added top margin for space */}
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-800 mt-4">
                Admin Login
            </h2>
            <form onSubmit={handleLogin}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                >
                    Login
                </button>
                <p className="mt-4 text-center text-gray-500 text-sm">
                    <a href="#" className="underline hover:text-blue-500">Forgot your password?</a>
                </p>
            </form>
        </div>
    </div>
);

export default AdminLogin;