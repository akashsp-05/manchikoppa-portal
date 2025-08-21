import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { FaSchool, FaStore, FaWineBottle, FaIndustry, FaLandmark, FaWrench, FaStethoscope, FaTools, FaChalkboardTeacher, FaTrash, FaComments } from "react-icons/fa";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import myPhoto from './myphoto.jpg';
import SearchPage from './SearchPage';

// All components are combined into this single file for simplicity.

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <img
                    src={myPhoto}
                    alt="Admin Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Admin Login</h2>
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
}

function VillagerForm() {
    const [formData, setFormData] = useState({
        name: "", phone: "", work: "", address: "", age: "", dob: "", locationLink: ""
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const villagerData = {
                ...formData,
                lowercaseName: formData.name.toLowerCase(),
            };
            await addDoc(collection(db, "villagers"), villagerData);
            alert("Details saved successfully!");
            setFormData({ name: "", phone: "", work: "", address: "", age: "", dob: "", locationLink: "" });
            navigate("/");
        } catch (error) {
            console.error("Error adding document:", error);
            alert("Failed to save details. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Add Villager Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Work</label>
                        <input type="text" name="work" value={formData.work} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Google Maps Live Location Link</label>
                        <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" placeholder="e.g., https://goo.gl/maps/..." />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Save Details
                    </button>
                </form>
            </div>
        </div>
    );
}

function BusinessPage({ user }) {
    const { businessType } = useParams();
    const [businesses, setBusinesses] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchBusinesses = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "businesses"), where("type", "==", businessType));
                const querySnapshot = await getDocs(q);
                const businessList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBusinesses(businessList);
            } catch (error) {
                console.error("Error fetching business details: ", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusinesses();
    }, [businessType]);

    const handleDeleteBusiness = async (id) => {
        if (window.confirm("Are you sure you want to delete this business?")) {
            try {
                await deleteDoc(doc(db, "businesses", id));
                alert("Business deleted successfully!");
                setBusinesses(businesses.filter(biz => biz.id !== id));
            } catch (error) {
                console.error("Error deleting business: ", error);
                alert("Failed to delete business. Please try again.");
            }
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">{businessType} Details</h2>
            {user && (
                <Link to={`/add-business-details/${businessType}`} className="px-4 py-2 bg-green-500 text-white rounded-lg mb-4 inline-block">Add New {businessType}</Link>
            )}

            {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses.map((biz) => (
                        <div key={biz.id} className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4">
                            <div className="flex-1">
                                <h3 className="font-bold text-xl text-blue-700 mb-2">{biz.name}</h3>
                                {biz.ownerName && <p className="text-gray-700 text-sm">Owner/Principal: <span className="font-semibold">{biz.ownerName}</span></p>}
                                {biz.phone && <p className="text-gray-700 text-sm">Phone: <span className="font-semibold">{biz.phone}</span></p>}
                                {biz.address && <p className="text-gray-700 text-sm">Address: <span className="font-semibold">{biz.address}</span></p>}
                                {biz.specification && <p className="text-gray-700 text-sm">Specification: <span className="font-semibold">{biz.specification}</span></p>}
                                {biz.locationLink && <p className="text-gray-700 text-sm">Location: <a href={biz.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View on Map</a></p>}
                                {biz.members && biz.members.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-lg text-blue-600">Staff/Members:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {biz.members.map((member, idx) => (
                                                <li key={idx}>
                                                    <span className="font-medium">{member.name}</span> - {member.work} ({member.phone})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {user && (
                                <button onClick={() => handleDeleteBusiness(biz.id)} className="flex items-center space-x-2 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200 text-sm">
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No {businessType} details found.</p>
            )}
        </div>
    );
}

function BusinessForm() {
    const { businessType } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", phone: "", address: "", locationLink: "", specification: "", ownerName: "",
        members: [{ name: "", work: "", phone: "" }],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const newMembers = [...formData.members];
        newMembers[index][name] = value;
        setFormData({ ...formData, members: newMembers });
    };

    const handleAddMember = () => {
        setFormData({ ...formData, members: [...formData.members, { name: "", work: "", phone: "" }] });
    };

    const handleRemoveMember = (index) => {
        const newMembers = [...formData.members];
        newMembers.splice(index, 1);
        setFormData({ ...formData, members: newMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let dataToSave;
            const commonData = {
                type: businessType,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                locationLink: formData.locationLink
            };

            const hasMembers = ["Shops", "Schools", "Wine Shop", "Rice Mill", "Interlock Factory", "Milk Dairy"].includes(businessType);
            const hasOwner = ["Shops", "Schools", "Wine Shop", "Rice Mill", "Interlock Factory", "Milk Dairy"].includes(businessType);
            const hasSpecification = ["Electrician", "Doctors", "Engineers", "Teachers"].includes(businessType);
            const isTemple = businessType === "Temple";
            const isGramaPanchayat = businessType === "Grama Panchayat";


            if (isTemple) {
                dataToSave = {
                    type: businessType,
                    name: formData.name,
                    address: formData.address,
                    locationLink: formData.locationLink,
                };
            } else if (hasSpecification) {
                dataToSave = {
                    ...commonData,
                    specification: formData.specification,
                    members: [],
                };
            } else {
                dataToSave = {
                    ...commonData,
                    ownerName: formData.ownerName,
                    members: formData.members,
                };
            }

            if (isGramaPanchayat) {
                delete dataToSave.ownerName;
            }

            await addDoc(collection(db, "businesses"), dataToSave);
            alert("Details added successfully!");
            navigate(`/business/${businessType}`);
        } catch (error) {
            console.error("Error adding document:", error);
            alert("Failed to add details. Please try again.");
        }
    };

    const hasMembers = ["Grama Panchayat", "Shops", "Schools", "Wine Shop", "Rice Mill", "Interlock Factory", "Milk Dairy"].includes(businessType);
    const hasOwner = ["Shops", "Schools", "Wine Shop", "Rice Mill", "Interlock Factory", "Milk Dairy"].includes(businessType);
    const hasSpecification = ["Electrician", "Doctors", "Engineers", "Teachers"].includes(businessType);
    const isTemple = businessType === "Temple";
    const isGramaPanchayat = businessType === "Grama Panchayat";
    const individualProfessions = ["Electrician", "Doctors", "Engineers", "Teachers"];


    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Add {businessType} Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">
                            {isTemple ? "Temple Name" : (individualProfessions.includes(businessType) ? "Name" : `${businessType} Name`)}
                        </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    {hasOwner && !isGramaPanchayat && (
                        <div>
                            <label className="block text-gray-700">
                                {businessType === "Schools" ? "Principal Name" : "Owner Name"}
                            </label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                    )}
                    {(hasOwner || hasSpecification) && (
                        <div>
                            <label className="block text-gray-700">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                    )}
                    {hasSpecification && (
                        <div>
                            <label className="block text-gray-700">Specification</label>
                            <input type="text" name="specification" value={formData.specification} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700">Location Link</label>
                        <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    {hasMembers && (
                        <div>
                            {formData.members.map((member, index) => (
                                <div key={index} className="border p-4 rounded-md relative mt-4">
                                    <h4 className="font-semibold">Staff/Member {index + 1}</h4>
                                    <div className="space-y-2 mt-2">
                                        <input type="text" name="name" placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" />
                                        <input type="text" name="work" placeholder="Work" value={member.work} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" />
                                        <input type="tel" name="phone" placeholder="Phone" value={member.phone} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" />
                                    </div>
                                    {formData.members.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveMember(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">Remove</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddMember} className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 mt-4">Add Another Staff/Member</button>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 mt-4">Save Details</button>
                </form>
            </div>
        </div>
    );
}

// **Updated FeedbackForm Component with Name Input**
function FeedbackForm() {
    const [name, setName] = useState("");
    const [feedbackText, setFeedbackText] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (feedbackText.trim() === "" || name.trim() === "") {
            alert("Please provide both your name and feedback before submitting.");
            return;
        }

        try {
            await addDoc(collection(db, "feedback"), {
                name: name,
                feedback: feedbackText,
                timestamp: new Date(),
            });
            alert("Thank you for your feedback! It has been submitted.");
            setName("");
            setFeedbackText("");
            navigate("/");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Failed to submit feedback. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-center mb-2">Send Feedback or Complain</h2>
                <p className="text-sm text-center text-gray-500 mb-6">ಪ್ರತಿಕ್ರಿಯೆ ಅಥವಾ ದೂರು ಕಳುಹಿಸಿ</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Your Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Your Feedback or Complain</label>
                        <textarea
                            name="feedback"
                            rows="6"
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
                    >
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
}

// **Updated FeedbackPage Component for Admin to show Name**
function FeedbackPage({ user }) {
    const [feedbackList, setFeedbackList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const querySnapshot = await getDocs(collection(db, "feedback"));
                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp.toDate()
                }));
                setFeedbackList(list);
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, [user]);

    const handleDeleteFeedback = async (id) => {
        if (window.confirm("Are you sure you want to delete this feedback?")) {
            try {
                await deleteDoc(doc(db, "feedback", id));
                alert("Feedback deleted successfully!");
                setFeedbackList(feedbackList.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting feedback:", error);
                alert("Failed to delete feedback. Please try again.");
            }
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-500">Access Denied. Please log in as an admin.</p></div>;
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-500">Loading feedback...</p></div>;
    }

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Admin Feedback Dashboard</h2>
            {feedbackList.length > 0 ? (
                <div className="space-y-4">
                    {feedbackList.map((feedbackItem) => (
                        <div key={feedbackItem.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h3 className="font-semibold text-lg text-blue-700 mb-2">From: {feedbackItem.name}</h3>
                            <p className="text-gray-800 mb-4">{feedbackItem.feedback}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                                <span>{feedbackItem.timestamp.toLocaleString()}</span>
                                <button
                                    onClick={() => handleDeleteFeedback(feedbackItem.id)}
                                    className="flex items-center space-x-2 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200"
                                >
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-lg">No feedback has been submitted yet.</p>
            )}
        </div>
    );
}

const services = [
    { id: 1, name: "Grama Panchayat", kannada: "ಗ್ರಾಮ ಪಂಚಾಯತ್", icon: <FaLandmark />, color: "bg-yellow-400" },
    { id: 2, name: "Shops", kannada: "ಅಂಗಡಿಗಳು", icon: <FaStore />, color: "bg-green-400" },
    { id: 3, name: "Schools", kannada: "ಶಾಲೆಗಳು", icon: <FaSchool />, color: "bg-blue-400" },
    { id: 4, name: "Wine Shop", kannada: "ವೈನ್ ಶಾಪ್", icon: <FaWineBottle />, color: "bg-purple-400" },
    { id: 5, name: "Rice Mill", kannada: "ಅಕ್ಕಿ ಗಿರಣಿ", icon: <FaIndustry />, color: "bg-red-400" },
    { id: 6, name: "Interlock Factory", kannada: "ಇಂಟರ್ಲಾಕ್ ಕಾರ್ಖಾನೆ", icon: <FaIndustry />, color: "bg-gray-600" },
    { id: 7, name: "Electrician", kannada: "ವಿದ್ಯುತ್ ತಂತ್ರಜ್ಞ", icon: <FaWrench />, color: "bg-orange-500" },
    { id: 8, name: "Doctors", kannada: "ವೈದ್ಯರು", icon: <FaStethoscope />, color: "bg-red-500" },
    { id: 9, name: "Engineers", kannada: "ಎಂಜಿನಿಯರ್‌ಗಳು", icon: <FaTools />, color: "bg-purple-700" },
    { id: 10, name: "Teachers", kannada: "ಶಿಕ್ಷಕರು", icon: <FaChalkboardTeacher />, color: "bg-indigo-500" },
    { id: 11, name: "Temple", kannada: "ದೇವಸ್ಥಾನ", icon: <FaLandmark />, color: "bg-orange-600" },
    { id: 12, name: "Milk Dairy", kannada: "ಹಾಲಿನ ಡೈರಿ", icon: <FaIndustry />, color: "bg-gray-400" },
];

function HomePage({ user }) {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim() !== "") {
            navigate(`/search?q=${searchQuery}`);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Logged out successfully!");
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 to-blue-700 text-white flex flex-col items-center p-6 shadow-2xl">
                <div className="flex items-center space-x-6 w-full justify-between mb-4">
                    <div className="flex items-center space-x-4">
                        <Link to="/add-villager-details" className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-blue-900 px-6 py-2 rounded-full shadow-lg font-bold hover:scale-105 transition-transform duration-300">
                            Add Details
                        </Link>
                    </div>
                    <form onSubmit={handleSearch} className="relative z-50 flex items-center">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-3 rounded-full w-48 border-2 border-transparent focus:border-blue-300 text-black focus:outline-none transition-all duration-300 shadow-inner"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-300 ml-2">
                            Search
                        </button>
                    </form>
                    <div className="flex items-center space-x-2">
                        {user ? (
                            <>
                                <Link to="/admin-feedback" className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300 flex items-center space-x-2">
                                    <FaComments />
                                    <span>Feedback or Complain</span>
                                </Link>
                                <button onClick={handleLogout} className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/feedback" className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300 flex items-center space-x-2">
                                    <FaComments />
                                    <span>Feedback or Complain</span>
                                </Link>
                                <img
                                    src={myPhoto}
                                    alt="Admin Profile"
                                    className="w-8 h-8 rounded-full"
                                />
                                <Link to="/admin-login" className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300">
                                    Admin Login
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-center mt-4">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center text-yellow-300 tracking-wide transform -skew-x-6 hover:skew-x-0 transition-transform duration-300">
                        Welcome to Manchikoppa Village
                    </h1>
                    <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mt-2 text-center text-white tracking-wide transform -skew-x-6 hover:skew-x-0 transition-transform duration-300">
                        ಮಂಚಿಕೊಪ್ಪ ಗ್ರಾಮಕ್ಕೆ ಸುಸ್ವಾಗತ
                    </p>
                    <p className="text-lg sm:text-xl text-white mt-2 text-center">
                        Manchikoppa (post&village), Shikaripura (Taluk), Shimoga (District), Karnataka, 577428
                    </p>
                    <p className="text-lg sm:text-xl text-white text-center">
                        ಮಂಚಿಕೊಪ್ಪ (ಪೋಸ್ಟ್ ಮತ್ತು ಗ್ರಾಮ), ಶಿಕಾರಿಪುರ (ತಾಲ್ಲೂಕು), ಶಿವಮೊಗ್ಗ (ಜಿಲ್ಲೆ), ಕರ್ನಾಟಕ, 577428
                    </p>
                </div>
            </header>
            <div className="mt-8 flex justify-center px-4">
                <img src="/village.png" alt="Village Banner" className="w-1/2 max-w-lg rounded-full shadow-2xl object-cover border-4 border-blue-500" />
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
                {services.map((service) => (
                    <Link
                        key={service.id}
                        to={`/business/${service.name}`}
                        className="group bg-white rounded-3xl p-8 text-center shadow-lg hover:shadow-2xl hover:scale-105 transform transition duration-300"
                    >
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${service.color} text-3xl text-white group-hover:bg-opacity-80 transition duration-300`}>
                            {service.icon}
                        </div>
                        <h2 className="text-2xl font-bold text-blue-800 mt-4 group-hover:text-blue-600 transition duration-300">{service.name} <br /><span className="text-lg text-green-700 font-normal">{service.kannada}</span></h2>
                        <p className="text-sm text-gray-500 mt-2">Click to view details</p>
                    </Link>
                ))}
            </div>
            <div className="max-w-5xl mx-auto px-4 mt-12 mb-20">
                <h3 className="text-3xl font-semibold text-center text-gray-800 mb-6">Submitted Villager Details</h3>
                <p className="text-gray-500 text-center text-lg mt-8">Click on the Search button above to search villager details.</p>
            </div>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage user={user} />} />
                <Route path="/add-villager-details" element={<VillagerForm />} />
                <Route path="/business/:businessType" element={<BusinessPage user={user} />} />
                <Route path="/add-business-details/:businessType" element={<BusinessForm />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/search" element={<SearchPage user={user} />} />
                <Route path="/feedback" element={<FeedbackForm />} />
                <Route path="/admin-feedback" element={<FeedbackPage user={user} />} />
            </Routes>
        </Router>
    );
}

export default App;