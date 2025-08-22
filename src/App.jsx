import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { FaSchool, FaStore, FaWineBottle, FaIndustry, FaLandmark, FaWrench, FaStethoscope, FaTools, FaChalkboardTeacher, FaTrash, FaComments, FaBullhorn, FaMapMarkerAlt, FaPhone, FaUser, FaBriefcase, FaCalendarAlt, FaIdBadge } from "react-icons/fa";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import myPhoto from './myphoto.jpg';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';

// All components are combined into this single file for simplicity.
const storage = getStorage();

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
                <img
                    src={myPhoto}
                    alt="Admin Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-gray-300 shadow-md"
                />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Admin Login
                </h2>
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label className="sr-only" htmlFor="email">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-t-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label className="sr-only" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-b-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm transition-all"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300 shadow-lg transform hover:scale-105"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function VillagerForm() {
    const [formData, setFormData] = useState({
        name: "", phone: "", work: "", address: "", age: "", dob: "", locationLink: ""
    });
    const [photoFile, setPhotoFile] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let photoURL = "";
            if (photoFile) {
                const photoRef = ref(storage, `villager_photos/${uuidv4()}-${photoFile.name}`);
                await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(photoRef);
            }
            const villagerData = {
                ...formData,
                lowercaseName: formData.name.toLowerCase(),
                photoURL: photoURL,
            };
            await addDoc(collection(db, "villagers"), villagerData);
            alert("Details saved successfully!");
            setFormData({ name: "", phone: "", work: "", address: "", age: "", dob: "", locationLink: "" });
            setPhotoFile(null);
            navigate("/");
        } catch (error) {
            console.error("Error adding document:", error);
            alert("Failed to save details. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Add Villager Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Work</label>
                            <input type="text" name="work" value={formData.work} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Google Maps Live Location Link</label>
                        <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" placeholder="e.g., https://goo.gl/maps/..." />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Profile Photo</label>
                        <input type="file" onChange={handlePhotoChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" accept="image/*" />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 shadow-lg mt-6"
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
        <div className="p-8 max-w-7xl mx-auto bg-gray-100 min-h-screen">
            <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900 capitalize">{businessType} Details</h2>
            {user && (
                <Link to={`/add-business-details/${businessType}`} className="px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 mb-6 inline-block">
                    Add New {businessType}
                </Link>
            )}
            {isLoading ? (
                <p className="text-center text-gray-500 text-xl font-semibold mt-12">Loading...</p>
            ) : businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {businesses.map((biz) => (
                        <div key={biz.id} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
                            {biz.photoURL && (
                                <img
                                    src={biz.photoURL}
                                    alt={`${biz.name} photo`}
                                    className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md"
                                />
                            )}
                            <h3 className="font-bold text-2xl text-gray-800 mb-2">{biz.name}</h3>
                            <div className="space-y-3 text-gray-600 w-full text-left mt-4">
                                {biz.ownerName && <p><FaUser className="inline-block mr-3 text-green-500" />Owner/Principal: <span className="font-semibold text-gray-800">{biz.ownerName}</span></p>}
                                {biz.phone && <p><FaPhone className="inline-block mr-3 text-green-500" />Phone: <span className="font-semibold text-gray-800">{biz.phone}</span></p>}
                                {biz.address && <p><FaMapMarkerAlt className="inline-block mr-3 text-green-500" />Address: <span className="font-semibold text-gray-800">{biz.address}</span></p>}
                                {biz.specification && <p><FaIdBadge className="inline-block mr-3 text-green-500" />Specification: <span className="font-semibold text-gray-800">{biz.specification}</span></p>}
                                {biz.locationLink && <p className="text-center mt-6"><a href={biz.locationLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">View on Map</a></p>}
                                {biz.members && biz.members.length > 0 && (
                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                        <h4 className="font-semibold text-lg text-gray-700 mb-2">Staff/Members:</h4>
                                        <ul className="list-none space-y-2">
                                            {biz.members.map((member, idx) => (
                                                <li key={idx}>
                                                    <span className="font-medium text-gray-800">{member.name}</span> - {member.work} ({member.phone})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {user && (
                                <button onClick={() => handleDeleteBusiness(biz.id)} className="mt-6 flex items-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-full shadow-md hover:bg-red-700 transition duration-200 transform hover:scale-105">
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-xl font-semibold mt-12">No {businessType} details found.</p>
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
    const [photoFile, setPhotoFile] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
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
            let photoURL = "";
            if (photoFile) {
                const photoRef = ref(storage, `business_photos/${uuidv4()}-${photoFile.name}`);
                await uploadBytes(photoRef, photoFile);
                photoURL = await getDownloadURL(photoRef);
            }

            let dataToSave;
            const commonData = {
                type: businessType,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                locationLink: formData.locationLink,
                photoURL: photoURL,
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
                    photoURL: photoURL,
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-3xl">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Add {businessType} Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            {isTemple ? "Temple Name" : (individualProfessions.includes(businessType) ? "Name" : `${businessType} Name`)}
                        </label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                    </div>
                    {hasOwner && !isGramaPanchayat && (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">
                                {businessType === "Schools" ? "Principal Name" : "Owner Name"}
                            </label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                    )}
                    {(hasOwner || hasSpecification) && (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                    )}
                    {hasSpecification && (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Specification</label>
                            <input type="text" name="specification" value={formData.specification} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Location Link</label>
                        <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Business/Service Photo</label>
                        <input type="file" onChange={handlePhotoChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" accept="image/*" />
                    </div>
                    {hasMembers && (
                        <div className="space-y-6 mt-6">
                            {formData.members.map((member, index) => (
                                <div key={index} className="border border-gray-200 p-6 rounded-xl relative bg-gray-50 shadow-inner">
                                    <h4 className="font-bold text-lg text-gray-800 mb-4">Staff/Member {index + 1}</h4>
                                    <div className="space-y-4">
                                        <input type="text" name="name" placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(index, e)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                        <input type="text" name="work" placeholder="Work" value={member.work} onChange={(e) => handleMemberChange(index, e)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                        <input type="tel" name="phone" placeholder="Phone" value={member.phone} onChange={(e) => handleMemberChange(index, e)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    {formData.members.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveMember(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition duration-200 text-sm font-semibold">
                                            <FaTrash className="inline-block mr-1" /> Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={handleAddMember} className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md transform hover:scale-105">
                                Add Another Staff/Member
                            </button>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 transform hover:scale-105 shadow-lg mt-6">
                        Save Details
                    </button>
                </form>
            </div>
        </div>
    );
}

function SearchPage({ user }) {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const { q } = useParams();

    useEffect(() => {
        if (q) {
            setSearchQuery(q);
            handleSearch(q);
        }
    }, [q]);

    const handleSearch = async (queryText) => {
        setIsLoading(true);
        setSearchResults([]);
        if (!queryText.trim()) {
            setIsLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, "villagers"),
                where("lowercaseName", ">=", queryText.toLowerCase()),
                where("lowercaseName", "<=", queryText.toLowerCase() + "\uf8ff")
            );
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSearchResults(results);
        } catch (error) {
            console.error("Error searching villagers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            navigate(`/search/${searchQuery}`);
        }
    };

    const handleDeleteVillager = async (id) => {
        if (window.confirm("Are you sure you want to delete this villager's details?")) {
            try {
                await deleteDoc(doc(db, "villagers", id));
                alert("Villager details deleted successfully!");
                setSearchResults(searchResults.filter(villager => villager.id !== id));
            } catch (error) {
                console.error("Error deleting villager:", error);
                alert("Failed to delete villager details. Please try again.");
            }
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto bg-gray-100 min-h-screen">
            <div className="flex justify-center mb-8">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search villagers by name..."
                    className="w-full max-w-xl px-5 py-3 border border-gray-300 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
                <button
                    onClick={() => navigate(`/search/${searchQuery}`)}
                    className="ml-4 px-6 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                >
                    Search
                </button>
            </div>
            {isLoading ? (
                <p className="text-center text-gray-500 text-xl font-semibold mt-12">Loading...</p>
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {searchResults.map((villager) => (
                        <div key={villager.id} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center">
                            {villager.photoURL && (
                                <img
                                    src={villager.photoURL}
                                    alt={`${villager.name} photo`}
                                    className="w-full h-48 object-cover rounded-2xl mb-6 shadow-md"
                                />
                            )}
                            <h3 className="font-bold text-2xl text-gray-800 mb-2">{villager.name}</h3>
                            <div className="space-y-3 text-gray-600 w-full text-left mt-4">
                                {villager.phone && <p><FaPhone className="inline-block mr-3 text-green-500" />Phone: <span className="font-semibold text-gray-800">{villager.phone}</span></p>}
                                {villager.work && <p><FaBriefcase className="inline-block mr-3 text-green-500" />Work: <span className="font-semibold text-gray-800">{villager.work}</span></p>}
                                {villager.address && <p><FaMapMarkerAlt className="inline-block mr-3 text-green-500" />Address: <span className="font-semibold text-gray-800">{villager.address}</span></p>}
                                {villager.age && <p><FaUser className="inline-block mr-3 text-green-500" />Age: <span className="font-semibold text-gray-800">{villager.age}</span></p>}
                                {villager.dob && <p><FaCalendarAlt className="inline-block mr-3 text-green-500" />DOB: <span className="font-semibold text-gray-800">{villager.dob}</span></p>}
                                {villager.locationLink && <p className="text-center mt-6"><a href={villager.locationLink} target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">View on Map</a></p>}
                            </div>
                            {user && (
                                <button onClick={() => handleDeleteVillager(villager.id)} className="mt-6 flex items-center space-x-2 bg-red-600 text-white py-3 px-6 rounded-full shadow-md hover:bg-red-700 transition duration-200 transform hover:scale-105">
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 text-xl font-semibold mt-12">No villagers found matching your search.</p>
            )}
        </div>
    );
}

function HomePage({ user }) {
    const serviceLinks = [
        { to: "/business/Shops", icon: FaStore, label: "Shops" },
        { to: "/business/Schools", icon: FaSchool, label: "Schools" },
        { to: "/business/Wine Shop", icon: FaWineBottle, label: "Wine Shop" },
        { to: "/business/Rice Mill", icon: FaIndustry, label: "Rice Mill" },
        { to: "/business/Temple", icon: FaLandmark, label: "Temple" },
        { to: "/business/Electrician", icon: FaWrench, label: "Electrician" },
        { to: "/business/Doctors", icon: FaStethoscope, label: "Doctors" },
        { to: "/business/Engineers", icon: FaTools, label: "Engineers" },
        { to: "/business/Teachers", icon: FaChalkboardTeacher, label: "Teachers" },
        { to: "/business/Grama Panchayat", icon: FaComments, label: "Grama Panchayat" },
        { to: "/announcements", icon: FaBullhorn, label: "Announcements" },
    ];
    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">Manchikoppa Village Services</h1>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Discover local services, villager information, and community announcements in one place.
            </p>
            {user && (
                <div className="flex justify-center mb-10 space-x-4">
                    <Link to="/villagers/add" className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                        Add Villager Details
                    </Link>
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {serviceLinks.map((link, index) => {
                    const IconComponent = link.icon;
                    return (
                        <Link key={index} to={link.to} className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 text-center flex flex-col items-center transform hover:-translate-y-2 border border-gray-200">
                            <IconComponent className="text-5xl text-green-500 mb-4 transition-transform duration-300 transform group-hover:scale-110" />
                            <span className="font-bold text-lg text-gray-800">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function Layout({ children, user, isAdmin }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/admin-login");
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };
    const showSearch = !window.location.pathname.startsWith('/search');

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-white text-gray-900 p-6 shadow-md sticky top-0 z-50 border-b border-gray-200">
                <div className="container mx-auto flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold tracking-tight hover:text-gray-700 transition-colors">
                        Manchikoppa
                    </Link>
                    <div className="flex items-center space-x-6">
                        {showSearch && (
                            <Link to="/search" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Search Villagers
                            </Link>
                        )}
                        {isAdmin ? (
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-gray-500">Admin</span>
                                <button onClick={handleLogout} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full shadow hover:bg-gray-300 transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : user ? (
                            <button onClick={handleLogout} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-full shadow hover:bg-gray-300 transition-colors">
                                Logout
                            </button>
                        ) : (
                            <Link to="/admin-login" className="bg-green-600 text-white font-bold py-2 px-4 rounded-full shadow hover:bg-green-700 transition-colors">
                                Admin Login
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="bg-gray-800 text-white p-6 text-center shadow-inner">
                <div className="container mx-auto">
                    <p className="text-sm text-gray-400">&copy; 2024 Manchikoppa Village Services. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser && currentUser.email === "admin@gmail.com") {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <Layout user={user} isAdmin={isAdmin}>
                <Routes>
                    <Route path="/" element={<HomePage user={user} />} />
                    <Route path="/admin-login" element={<AdminLogin />} />
                    <Route path="/villagers/add" element={<VillagerForm />} />
                    <Route path="/business/:businessType" element={<BusinessPage user={user} />} />
                    <Route path="/add-business-details/:businessType" element={<BusinessForm />} />
                    <Route path="/search" element={<SearchPage user={user} />} />
                    <Route path="/search/:q" element={<SearchPage user={user} />} />
                    <Route path="/announcements" element={<AnnouncementList user={user} />} />
                    <Route path="/announcements/add" element={<AnnouncementForm />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;