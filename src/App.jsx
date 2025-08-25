import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, query, where, getDocs, deleteDoc, doc, addDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import myPhoto from './myphoto.jpg';
import AnnouncementForm from './AnnouncementForm';
import AnnouncementList from './AnnouncementList';
import { FaSchool, FaStore, FaWineBottle, FaIndustry, FaLandmark, FaWrench, FaStethoscope, FaTools, FaChalkboardTeacher, FaTrash, FaComments, FaBullhorn, FaMapMarkerAlt, FaPhone, FaUser, FaBriefcase, FaCalendarAlt, FaIdBadge, FaPlayCircle, FaGlobe, FaClock, FaTemperatureHigh, FaWind, FaCloud, FaUmbrella, FaEdit, FaPlus, FaSave, FaImage, FaArrowLeft, FaBirthdayCake} from "react-icons/fa";

// All components are combined into this single file for simplicity.
import imageCompression from 'browser-image-compression';


// ... (other imports)

// Asynchronously checks image dimensions
const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            reject(new Error("Failed to load image."));
        };
        img.src = URL.createObjectURL(file);
    });
};
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
        name: "", phone: "", work: "", address: "", age: "", dob: ""
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState("");
    const [showRules, setShowRules] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPhotoFile(null);
            setPhotoPreview(null);
            setError("");
            return;
        }

        setError("");

        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file.");
            setPhotoFile(null);
            setPhotoPreview(null);
            return;
        }

        try {
            const { width, height } = await getImageDimensions(file);
            let processedFile = file;

            // Check if compression is needed
            if (width > 145 || height > 175) {
                const options = {
                    maxSizeMB: 0.05, // 50 KB
                    maxWidthOrHeight: 175,
                    useWebWorker: true,
                };
                processedFile = await imageCompression(file, options);
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(processedFile);
            setPhotoFile(processedFile);
        } catch (err) {
            setError("Failed to compress image automatically. Please resize the photo manually using the instructions below.");
            setPhotoFile(null);
            setPhotoPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (error || !photoFile) {
            alert(error || "Please select a photo to upload.");
            return;
        }

        setIsUploading(true);

        try {
            const photoRef = ref(storage, `villager_photos/${uuidv4()}-${photoFile.name}`);
            await uploadBytes(photoRef, photoFile);
            const photoURL = await getDownloadURL(photoRef);

            const villagerData = {
                ...formData,
                lowercaseName: formData.name.toLowerCase(),
                photoURL: photoURL,
            };
            await addDoc(collection(db, "villagers"), villagerData);
            alert("Details saved successfully!");
            setFormData({ name: "", phone: "", work: "", address: "", age: "", dob: "" });
            setPhotoFile(null);
            setPhotoPreview(null);
            setShowRules(false);
            navigate("/");
        } catch (error) {
            console.error("Error adding document:", error);
            alert("Failed to save details. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
                <Link to="/" className="absolute top-4 left-4 text-gray-500 hover:text-blue-500 transition duration-300">
                    <FaArrowLeft className="w-6 h-6" />
                </Link>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Add Villager Details</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <FaUser className="text-blue-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaPhone className="text-green-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" placeholder="e.g., +91 9876543210" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaBriefcase className="text-purple-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Work</label>
                            <input type="text" name="work" value={formData.work} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaMapMarkerAlt className="text-red-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaBirthdayCake className="text-orange-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Age</label>
                            <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <FaCalendarAlt className="text-teal-500 text-xl" />
                        <div className="flex-1">
                            <label className="block text-gray-700 font-medium mb-1">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <FaImage className="text-gray-500 text-xl" />
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium mb-1">Profile Photo</label>
                                <input type="file" onChange={handlePhotoChange} className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept="image/*" />
                            </div>
                        </div>
                        {photoPreview && (
                            <div className="mt-4 flex flex-col items-center">
                                <span className="text-gray-700 mb-2">Image Preview:</span>
                                <img src={photoPreview} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow-md" />
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-1 text-center">{error}</p>}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            type="button"
                            onClick={() => setShowRules(!showRules)}
                            className="text-sm text-blue-500 underline hover:no-underline transition duration-300"
                        >
                            {showRules ? "Hide Photo Rules" : "Show Photo Rules"}
                        </button>
                        <button
                            type="submit"
                            disabled={isUploading}
                            className={`py-2 px-6 rounded-md font-semibold transition duration-300 shadow-md ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {isUploading ? 'Saving...' : 'Save Details'}
                        </button>
                    </div>
                </form>

                {showRules && (
                    <div className="mt-6 border-t pt-6 space-y-4">
                        <h3 className="text-xl font-bold text-center text-gray-800">Photo Uploading Rules</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-lg text-gray-700 flex items-center">
                                    <span className="mr-2 text-yellow-500">📌</span>Photo Uploading Rules (English)
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 text-gray-700 mt-2">
                                    <li>The maximum photo dimensions allowed are 145px width and 175px height.</li>
                                    <li>Our system will **automatically attempt to compress** your photo to meet the requirements.</li>
                                    <li>If the automatic compression fails, you must **manually resize** your photo using this website: <a href="https://www.simpleimageresizer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:no-underline">Simple Image Resizer</a>.</li>
                                    <li>Steps for manual resize:
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Upload your photo.</li>
                                            <li>Select **Dimensions (px)** option.</li>
                                            <li>Do not select **“Keep aspect ratio”**.</li>
                                            <li>Set **Width = 145** and **Height = 175**.</li>
                                            <li>Click on **Resize**.</li>
                                            <li>Download and upload the resized picture.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                            <hr className="my-4" />
                            <div>
                                <h4 className="font-semibold text-lg text-gray-700 flex items-center">
                                    <span className="mr-2 text-yellow-500">📌</span>ಫೋಟೋ ಅಪ್ಲೋಡ್ ನಿಯಮಗಳು (Kannada)
                                </h4>
                                <ol className="list-decimal list-inside space-y-2 text-gray-700 mt-2">
                                    <li>ಗರಿಷ್ಠ ಫೋಟೋ ಗಾತ್ರವು 145px ಅಗಲ ಮತ್ತು 175px ಎತ್ತರ ಇರಬೇಕು.</li>
                                    <li>ನಿಮ್ಮ ಫೋಟೋವನ್ನು ಅಗತ್ಯವಿರುವ ಗಾತ್ರಕ್ಕೆ **ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕುಗ್ಗಿಸಲು** ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ಪ್ರಯತ್ನಿಸುತ್ತದೆ.</li>
                                    <li>ಸ್ವಯಂಚಾಲಿತ ಕುಗ್ಗಿಸುವಿಕೆ ವಿಫಲವಾದರೆ, ನೀವು ಈ ವೆಬ್‌ಸೈಟ್ ಬಳಸಿ ಫೋಟೋವನ್ನು **ಕೈಯಾರೆ ರಿಸೈಜ್ ಮಾಡಬೇಕು**: <a href="https://www.simpleimageresizer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:no-underline">Simple Image Resizer</a>.</li>
                                    <li>ಫೋಟೋ ರಿಸೈಜ್ ಮಾಡುವ ವಿಧಾನ:
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>ನಿಮ್ಮ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ.</li>
                                            <li>**Dimensions (px)** ಆಯ್ಕೆ ಮಾಡಿ.</li>
                                            <li>**Keep aspect ratio** ಆಯ್ಕೆ ಮಾಡಬೇಡಿ.</li>
                                            <li>**Width = 145** ಮತ್ತು **Height = 175** ನಮೂದಿಸಿ.</li>
                                            <li>**Resize** ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.</li>
                                            <li>ಬಂದ ಫೋಟೋವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಅಪ್ಲೋಡ್ ಮಾಡಿ.</li>
                                        </ul>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
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

    const hasMembers = ["Grama Panchayat", "Shops", "Schools", "Wine Shop", "Rice Mill", "Interlock Factory", "Milk Dairy"].includes(businessType);

    const handleAddMember = async (id) => {
        const docRef = doc(db, "businesses", id);
        const newMember = { name: "New Staff", work: "", phone: "" };
        
        try {
            await updateDoc(docRef, {
                members: arrayUnion(newMember)
            });
            const updatedBusinesses = businesses.map(biz => {
                if (biz.id === id) {
                    return { ...biz, members: [...(biz.members || []), newMember] };
                }
                return biz;
            });
            setBusinesses(updatedBusinesses);
            alert("New staff member added successfully!");
        } catch (error) {
            console.error("Error adding new staff member:", error);
            alert("Failed to add new staff member. Please try again.");
        }
    };

    const handleMemberChange = (businessId, index, e) => {
        const { name, value } = e.target;
        const updatedBusinesses = businesses.map(biz => {
            if (biz.id === businessId) {
                const newMembers = [...(biz.members || [])];
                newMembers[index][name] = value;
                return { ...biz, members: newMembers };
            }
            return biz;
        });
        setBusinesses(updatedBusinesses);
    };

    const handleSaveMembers = async (businessId) => {
        const businessToUpdate = businesses.find(biz => biz.id === businessId);
        if (!businessToUpdate) return;
        
        try {
            const docRef = doc(db, "businesses", businessId);
            await updateDoc(docRef, { members: businessToUpdate.members });
            alert("Staff details updated successfully!");
        } catch (error) {
                console.error("Error updating staff details:", error);
                alert("Failed to save changes. Please try again.");
            }
    };
    
    const handleRemoveMember = async (businessId, memberToRemove) => {
        if (window.confirm("Are you sure you want to remove this staff member?")) {
            const businessDocRef = doc(db, "businesses", businessId);
            const businessToUpdate = businesses.find(biz => biz.id === businessId);
            const updatedMembers = businessToUpdate.members.filter(m => m.name !== memberToRemove.name || m.phone !== memberToRemove.phone);

            try {
                await updateDoc(businessDocRef, { members: updatedMembers });
                
                setBusinesses(businesses.map(biz => {
                    if (biz.id === businessId) {
                        return { ...biz, members: updatedMembers };
                    }
                    return biz;
                }));
                alert("Staff member removed successfully!");
            } catch (error) {
                console.error("Error removing staff member:", error);
                alert("Failed to remove staff member. Please try again.");
            }
        }
    };

    const getOwnerLabel = () => {
        return businessType === "Schools" ? "Principal" : "Owner";
    };

    const getPhotoLabel = () => {
        return `${businessType} Photo`;
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
                        <div key={biz.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col space-y-4 relative">
                            {/* Reordered to show Name and Photo first */}
                            <div className="flex flex-col items-center">
                                <h3 className="font-bold text-xl text-blue-700 mb-2 text-center">{biz.name}</h3>
                                {biz.photoURL && (
                                    <>
                                        <p className="text-gray-700 text-sm font-semibold mt-2">{getPhotoLabel()}:</p>
                                        <img
                                            src={biz.photoURL}
                                            alt={`${biz.name} ${businessType} Photo`}
                                            className="w-32 h-32 rounded-lg object-cover flex-shrink-0 mt-2"
                                        />
                                    </>
                                )}
                            </div>
                            
                            {/* Horizontal line as a separator */}
                            <hr className="my-4" />

                            {/* Remaining details in a new flex container */}
                            <div className="flex-1 space-y-2">
                                {biz.ownerName && <p className="text-gray-700 text-sm">{getOwnerLabel()}: <span className="font-semibold">{biz.ownerName}</span></p>}
                                {biz.phone && <p className="text-gray-700 text-sm">Phone: <span className="font-semibold">{biz.phone}</span></p>}
                                {biz.address && <p className="text-gray-700 text-sm">Address: <span className="font-semibold">{biz.address}</span></p>}
                                {biz.specification && <p className="text-gray-700 text-sm">Specification: <span className="font-semibold">{biz.specification}</span></p>}
                                {biz.locationLink && <p className="text-gray-700 text-sm">Location: <a href={biz.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View on Map</a></p>}
                            </div>

                            {/* Public View: Read-only Staff Details */}
                            {!user && hasMembers && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-lg text-blue-600 mb-2">Staff/Members:</h4>
                                    <ol className="list-decimal list-inside space-y-1">
                                        {(biz.members || []).map((member, idx) => (
                                            <li key={idx}>
                                                <p className="text-gray-700 text-sm">Name: <span className="font-semibold">{member.name}</span></p>
                                                <p className="text-gray-700 text-sm">Work: <span className="font-semibold">{member.work}</span></p>
                                                <p className="text-gray-700 text-sm">Phone: <span className="font-semibold">{member.phone}</span></p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}

                            {/* Admin View: Editable Staff Details */}
                            {user && hasMembers && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-lg text-blue-600 mb-2">Staff/Members:</h4>
                                    <div className="space-y-4">
                                        {(biz.members || []).map((member, idx) => (
                                            <div key={idx} className="flex flex-col space-y-2 border p-3 rounded-md">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={member.name}
                                                        onChange={(e) => handleMemberChange(biz.id, idx, e)}
                                                        className="flex-1 px-2 py-1 border rounded-md text-sm"
                                                        placeholder="Name"
                                                    />
                                                    <input
                                                        type="text"
                                                        name="work"
                                                        value={member.work}
                                                        onChange={(e) => handleMemberChange(biz.id, idx, e)}
                                                        className="flex-1 px-2 py-1 border rounded-md text-sm"
                                                        placeholder="Work"
                                                    />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={member.phone}
                                                        onChange={(e) => handleMemberChange(biz.id, idx, e)}
                                                        className="flex-1 px-2 py-1 border rounded-md text-sm"
                                                        placeholder="Phone"
                                                    />
                                                    <button onClick={() => handleRemoveMember(biz.id, member)} className="text-red-500 hover:text-red-700 text-sm"><FaTrash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <button onClick={() => handleAddMember(biz.id)} className="flex items-center space-x-2 bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-200 text-sm">
                                            <FaPlus />
                                            <span>Add Staff</span>
                                        </button>
                                        <button onClick={() => handleSaveMembers(biz.id)} className="flex items-center space-x-2 bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition duration-200 text-sm">
                                            <FaSave />
                                            <span>Save</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {user && (
                                <button onClick={() => handleDeleteBusiness(biz.id)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200 text-sm flex items-center justify-center">
                                    <FaTrash />
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

function EditStaffForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const docRef = doc(db, "businesses", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBusiness(data);
                    setMembers(data.members || []);
                } else {
                    setError("No such business found!");
                }
            } catch (err) {
                console.error("Error fetching document:", err);
                setError("Failed to fetch business details.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusiness();
    }, [id]);

    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const newMembers = [...members];
        newMembers[index][name] = value;
        setMembers(newMembers);
    };

    const handleAddMember = () => {
        setMembers([...members, { name: "", work: "", phone: "" }]);
    };

    const handleRemoveMember = (index) => {
        const newMembers = [...members];
        newMembers.splice(index, 1);
        setMembers(newMembers);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const docRef = doc(db, "businesses", id);
            await updateDoc(docRef, { members: members });
            alert("Staff/Members updated successfully!");
            navigate(`/business/${business.type}`);
        } catch (err) {
            console.error("Error updating document:", err);
            alert("Failed to update staff. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return <div className="text-center mt-8">Loading...</div>;
    }

    if (error) {
        return <div className="text-center mt-8 text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Edit Staff/Members for {business.name}</h2>
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <h3 className="text-xl font-bold mt-6 mb-4">Staff/Members Details</h3>
                        <ul className="list-disc list-inside space-y-4">
                            {members.map((member, index) => (
                                <li key={index} className="border p-4 rounded-md relative">
                                    <h4 className="font-semibold mb-2">Staff/Member {index + 1}</h4>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-gray-700">Name</label>
                                            <input type="text" name="name" value={member.name} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Name" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700">Work</label>
                                            <input type="text" name="work" value={member.work} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Work" />
                                        </div>
                                        <div>
                                            <label className="block text-gray-700">Phone</label>
                                            <input type="tel" name="phone" value={member.phone} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Phone" />
                                        </div>
                                    </div>
                                    {members.length > 1 && (
                                        <button type="button" onClick={() => handleRemoveMember(index)} className="mt-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <button type="button" onClick={handleAddMember} className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 mt-4">Add Another Staff/Member</button>
                    </div>
                    <button type="submit" disabled={isUpdating} className={`w-full text-white py-2 px-4 rounded-md transition duration-300 ${isUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {isUpdating ? 'Updating...' : 'Update Staff'}
                    </button>
                </form>
            </div>
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
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState("");
    const [showPhotoRules, setShowPhotoRules] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            setPhotoFile(null);
            setPhotoPreview(null);
            setError("");
            return;
        }

        setError("");

        if (!file.type.startsWith('image/')) {
            setError("Please upload a valid image file.");
            setPhotoFile(null);
            setPhotoPreview(null);
            return;
        }

        try {
            const { width, height } = await getImageDimensions(file);
            let processedFile = file;

            // Check if compression is needed
            if (width > 145 || height > 175) {
                const options = {
                    maxSizeMB: 0.05, // 50 KB
                    maxWidthOrHeight: 175,
                    useWebWorker: true,
                };
                processedFile = await imageCompression(file, options);
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(processedFile);
            setPhotoFile(processedFile);
        } catch (err) {
            setError("Failed to compress image automatically. Please resize the photo manually using the instructions below.");
            setPhotoFile(null);
            setPhotoPreview(null);
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

        if (error || !photoFile) {
            alert(error || "Please select a photo to upload.");
            return;
        }

        setIsUploading(true);

        try {
            let photoURL = "";
            const photoRef = ref(storage, `business_photos/${uuidv4()}-${photoFile.name}`);
            await uploadBytes(photoRef, photoFile);
            photoURL = await getDownloadURL(photoRef);

            let dataToSave;
            const commonData = {
                type: businessType,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                locationLink: formData.locationLink,
                photoURL: photoURL,
            };

            const isIndividual = ["Electrician", "Doctors", "Engineers", "Teachers"].includes(businessType);
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
            } else if (isIndividual) {
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
        } finally {
            setIsUploading(false);
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
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    {hasOwner && !isGramaPanchayat && (
                        <div>
                            <label className="block text-gray-700">
                                {businessType === "Schools" ? "Principal Name" : "Owner Name"}
                            </label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}
                    {(hasOwner || hasSpecification) && (
                        <div>
                            <label className="block text-gray-700">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}
                    {hasSpecification && (
                        <div>
                            <label className="block text-gray-700">Specification</label>
                            <input type="text" name="specification" value={formData.specification} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Location Link</label>
                        <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-gray-700">Business/Service Photo</label>
                        <input type="file" onChange={handlePhotoChange} className="w-full px-3 py-2 border rounded-md" accept="image/*" />
                        {photoPreview && (
                            <div className="mt-4 flex flex-col items-center">
                                <span className="text-gray-700 mb-2">Image Preview:</span>
                                <img src={photoPreview} alt="Business Preview" className="w-48 h-32 object-cover rounded-md border border-gray-300" />
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>

                    <div className="flex justify-center mt-4">
                        <button
                            type="button"
                            onClick={() => setShowPhotoRules(!showPhotoRules)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300"
                        >
                            {showPhotoRules ? 'Hide Photo Rules' : 'Show Photo Rules'}
                        </button>
                    </div>

                    {showPhotoRules && (
                        <div className="mt-4 p-4 border rounded-md bg-gray-50">
                            <h4 className="font-bold text-lg mb-2">📌 Photo Uploading Rules (English)</h4>
                            <p className="text-sm">1. The maximum photo dimensions allowed are 145px width and 175px height.</p>
                            <p className="text-sm">2. Our system will **automatically attempt to compress** your photo to meet the requirements.</p>
                            <p className="text-sm mt-2">3. If the automatic compression fails, you must **manually resize** your photo using this website: <a href="https://simpleimageresizer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Simple Image Resizer</a>.</p>
                            <p className="text-sm font-semibold mt-2">4. Steps for manual resize:</p>
                            <ul className="list-disc list-inside text-sm">
                                <li>Upload your photo.</li>
                                <li>Select Dimensions (px) option.</li>
                                <li>Do not select “Keep aspect ratio”.</li>
                                <li>Set Width = 145 and Height = 175.</li>
                                <li>Click on Resize.</li>
                                <li>Download and upload the resized picture.</li>
                            </ul>

                            <hr className="my-4" />

                            <h4 className="font-bold text-lg mb-2">📌 ಫೋಟೋ ಅಪ್ಲೋಡ್ ನಿಯಮಗಳು (Kannada)</h4>
                            <p className="text-sm">1. ಗರಿಷ್ಠ ಫೋಟೋ ಗಾತ್ರವು 145px ಅಗಲ ಮತ್ತು 175px ಎತ್ತರ ಇರಬೇಕು.</p>
                            <p className="text-sm">2. ನಿಮ್ಮ ಫೋಟೋವನ್ನು ಅಗತ್ಯವಿರುವ ಗಾತ್ರಕ್ಕೆ **ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕುಗ್ಗಿಸಲು** ನಮ್ಮ ವ್ಯವಸ್ಥೆಯು ಪ್ರಯತ್ನಿಸುತ್ತದೆ.</p>
                            <p className="text-sm mt-2">3. ಸ್ವಯಂಚಾಲಿತ ಕುಗ್ಗಿಸುವಿಕೆ ವಿಫಲವಾದರೆ, ನೀವು ಈ ವೆಬ್‌ಸೈಟ್ ಬಳಸಿ ಫೋಟೋವನ್ನು **ಕೈಯಾರೆ ರಿಸೈಜ್ ಮಾಡಬೇಕು**: <a href="https://simpleimageresizer.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Simple Image Resizer</a>.</p>
                            <p className="text-sm font-semibold mt-2">4. ಫೋಟೋ ರಿಸೈಜ್ ಮಾಡುವ ವಿಧಾನ:</p>
                            <ul className="list-disc list-inside text-sm">
                                <li>ನಿಮ್ಮ ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ.</li>
                                <li>Dimensions (px) ಆಯ್ಕೆ ಮಾಡಿ.</li>
                                <li>Keep aspect ratio ಆಯ್ಕೆ ಮಾಡಬೇಡಿ.</li>
                                <li>Width = 145 ಮತ್ತು Height = 175 ನಮೂದಿಸಿ.</li>
                                <li>Resize ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.</li>
                                <li>ಬಂದ ಫೋಟೋವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ಅಪ್ಲೋಡ್ ಮಾಡಿ.</li>
                            </ul>
                        </div>
                    )}

                    {hasMembers && (
                        <div>
                            <h3 className="text-xl font-bold mt-6 mb-4">Staff/Members Details</h3>
                            <ul className="list-disc list-inside space-y-4">
                                {formData.members.map((member, index) => (
                                    <li key={index} className="border p-4 rounded-md relative">
                                        <h4 className="font-semibold mb-2">Staff/Member {index + 1}</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-gray-700">Name</label>
                                                <input type="text" name="name" value={member.name} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Name" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700">Work</label>
                                                <input type="text" name="work" value={member.work} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Work" />
                                            </div>
                                            <div>
                                                <label className="block text-gray-700">Phone</label>
                                                <input type="tel" name="phone" value={member.phone} onChange={(e) => handleMemberChange(index, e)} className="w-full px-3 py-2 border rounded-md" placeholder="Phone" />
                                            </div>
                                        </div>
                                        {formData.members.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveMember(index)} className="mt-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <button type="button" onClick={handleAddMember} className="w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 mt-4">Add Another Staff/Member</button>
                        </div>
                    )}
                    <button type="submit" disabled={isUploading} className={`w-full text-white py-2 px-4 rounded-md transition duration-300 ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}>
                        {isUploading ? 'Saving...' : 'Save Details'}
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

    const handleDeleteVillager = async (id) => {
        if (window.confirm("Are you sure you want to delete this villager's details?")) {
            try {
                await deleteDoc(doc(db, "villagers", id));
                alert("Details deleted successfully!");
                setSearchResults(searchResults.filter(villager => villager.id !== id));
            } catch (error) {
                console.error("Error deleting villager:", error);
                alert("Failed to delete details. Please try again.");
            }
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Villager Details</h2>
            <div className="mb-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }} className="flex">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name..."
                        className="flex-grow p-3 rounded-l-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <button type="submit" className="bg-blue-500 text-white p-3 rounded-r-lg hover:bg-blue-600 transition duration-300">
                        Search
                    </button>
                </form>
            </div>
            {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                    {searchResults.map((villager) => (
                        <div key={villager.id} className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-6 border border-gray-200">
                            {villager.photoURL && (
                                <img
                                    src={villager.photoURL}
                                    alt={`${villager.name}'s photo`}
                                    className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-blue-400"
                                />
                            )}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center space-x-2">
                                    <FaUser className="text-blue-500 text-xl" />
                                    <h3 className="font-bold text-xl text-gray-800">{villager.name}</h3>
                                </div>
                                {villager.phone && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaPhone className="text-green-500 text-lg" />
                                        <p className="text-sm">Phone: <span className="font-semibold">{villager.phone}</span></p>
                                    </div>
                                )}
                                {villager.work && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaBriefcase className="text-purple-500 text-lg" />
                                        <p className="text-sm">Work: <span className="font-semibold">{villager.work}</span></p>
                                    </div>
                                )}
                                {villager.address && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaMapMarkerAlt className="text-red-500 text-lg" />
                                        <p className="text-sm">Address: <span className="font-semibold">{villager.address}</span></p>
                                    </div>
                                )}
                                {villager.age && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaBirthdayCake className="text-orange-500 text-lg" />
                                        <p className="text-sm">Age: <span className="font-semibold">{villager.age}</span></p>
                                    </div>
                                )}
                                {villager.dob && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaCalendarAlt className="text-teal-500 text-lg" />
                                        <p className="text-sm">Date of Birth: <span className="font-semibold">{villager.dob}</span></p>
                                    </div>
                                )}
                                {villager.locationLink && (
                                    <div className="flex items-center space-x-2 text-gray-700">
                                        <FaMapMarkerAlt className="text-red-500 text-lg" />
                                        <p className="text-sm">Location: <a href={villager.locationLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:no-underline">View on Map</a></p>
                                    </div>
                                )}
                            </div>
                            {user && (
                                <button onClick={() => handleDeleteVillager(villager.id)} className="flex items-center space-x-2 bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200 text-sm self-start">
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No details found. Try a different name.</p>
            )}
        </div>
    );
}

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
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            setCurrentTime(now.toLocaleTimeString('en-US', timeOptions));
            setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
        };
        updateDateTime();
        const timer = setInterval(updateDateTime, 1000);
        return () => clearInterval(timer);
    }, []);

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
                    <div className="flex flex-col space-y-8">
                        <Link to="/add-villager-details" className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-blue-900 px-6 py-2 rounded-full shadow-lg font-bold hover:scale-105 transition-transform duration-300">
                            Add Details <br/> <span className="text-sm font-normal">ವಿವರಗಳನ್ನು ಸೇರಿಸಿ</span>
                        </Link>
                        <Link to="/feedback" className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300 flex items-center space-x-2">
                            <span>Complaint</span>
                            <span>/ ದೂರು</span>
                        </Link>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors duration-300"
                    >
                        Search <br/> <span className="text-sm font-normal">ಹುಡುಕಿ</span>
                    </button>
                    <div className="flex flex-col items-end space-y-2">
                        {user ? (
                            <>
                                <button onClick={handleLogout} className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300">
                                    Logout <br/> <span className="text-sm font-normal">ಲಾಗ್ ಔಟ್</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <img
                                    src={myPhoto}
                                    alt="Admin Profile"
                                    className="w-4 h-4 rounded-full"
                                />
                                <Link to="/admin-login" className="bg-gray-400 text-white px-4 py-2 rounded-full hover:bg-gray-500 transition-colors duration-300">
                                    Admin Login <br/> <span className="text-sm font-normal">ನಿರ್ವಾಹಕ ಲಾಗಿನ್</span>
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
            <div className="flex justify-center flex-col items-center mt-8 p-4 bg-gray-200 rounded-lg max-w-lg mx-auto shadow-inner">
                <h2 className="text-3xl font-bold text-blue-800 mb-4">Village Announcements <br/> <span className="text-xl font-normal">ಗ್ರಾಮ ಪ್ರಕಟಣೆಗಳು</span></h2>
                <Link to="/announcements" className="text-lg text-blue-500 hover:underline">
                    Click here to see all announcements. <br/> <span className="text-base">ಎಲ್ಲಾ ಪ್ರಕಟಣೆಗಳನ್ನು ನೋಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ.</span>
                </Link>
                {user && (
                    <div className="mt-4 flex flex-col items-center">
                        <Link to="/add-announcement" className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md">
                            <FaBullhorn />
                            <span>Add New Announcement</span>
                            <span>/ ಹೊಸ ಪ್ರಕಟಣೆ ಸೇರಿಸಿ</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Services Section */}
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
                        <p className="text-sm text-gray-500 mt-2">Click to view details <br/> <span className="text-xs">ವಿವರಗಳನ್ನು ನೋಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ</span></p>
                    </Link>
                ))}
            </div>

            {/* Manchikoppa Details Section */}
            <div className="flex justify-center mt-8 px-4">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Manchikoppa - ಮಂಚಿಕೊಪ್ಪ</h3>
                    <div className="text-gray-600 space-y-2">
                        <p className="font-semibold text-sm">Karnataka {" >> "} Shimoga {" >> "} Shikarpur<br/> <span className="font-normal text-xs">ಕರ್ನಾಟಕ {" >> "} ಶಿವಮೊಗ್ಗ {" >> "} ಶಿಕಾರಿಪುರ</span></p>
                        <p className="text-sm">Locality Name: Manchikoppa (3) <br/> <span className="text-xs">ಸ್ಥಳೀಯ ಹೆಸರು: ಮಂಚಿಕೊಪ್ಪ (3)</span></p>
                        <p className="text-sm">Taluk Name: Shikarpur <br/> <span className="text-xs">ತಾಲ್ಲೂಕಿನ ಹೆಸರು: ಶಿಕಾರಿಪುರ</span></p>
                        <p className="text-sm">District: Shimoga <br/> <span className="text-xs">ಜಿಲ್ಲೆ: ಶಿವಮೊಗ್ಗ</span></p>
                        <p className="text-sm">State: Karnataka <br/> <span className="text-xs">ರಾಜ್ಯ: ಕರ್ನಾಟಕ</span></p>
                        <p className="text-sm">Division: Bangalore <br/> <span className="text-xs">ವಿಭಾಗ: ಬೆಂಗಳೂರು</span></p>
                        <p className="text-sm">Language: Kannada <br/> <span className="text-xs">ಭಾಷೆ: ಕನ್ನಡ</span></p>
                        <div className="flex items-center space-x-2 text-sm mt-4">
                            <FaClock className="text-blue-500" />
                            <span>Current Time: {currentTime} (IST) <br/> <span className="text-xs">ಪ್ರಸ್ತುತ ಸಮಯ: {currentTime} (IST)</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                            <FaCalendarAlt className="text-green-500" />
                            <span>Date: {currentDate} <br/> <span className="text-xs">ದಿನಾಂಕ: {currentDate}</span></span>
                        </div>
                        <p className="text-sm">Time zone: IST (UTC+5:30) <br/> <span className="text-xs">ಸಮಯ ವಲಯ: IST (UTC+5:30)</span></p>
                        <p className="text-sm">Elevation / Altitude: 661 meters. Above Seal level <br/> <span className="text-xs">ಎತ್ತರ / ಸಮುದ್ರ ಮಟ್ಟದಿಂದ: 661 ಮೀಟರ್</span></p>
                        <p className="text-sm">Telephone Code / Std Code: 08187 <br/> <span className="text-xs">ದೂರವಾಣಿ ಕೋಡ್ / STD ಕೋಡ್: 08187</span></p>
                        <p className="text-sm">Assembly constituency: Shikaripura assembly. constituency <br/> <span className="text-xs">ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ: ಶಿಕಾರಿಪುರ ವಿಧಾನಸಭಾ ಕ್ಷೇತ್ರ</span></p>
                        <p className="text-sm">Assembly MLA: Vijayendra Yediyurappa <br/> <span className="text-xs">ವಿಧಾನಸಭಾ ಶಾಸಕರು: ವಿಜಯೇಂದ್ರ ಯಡಿಯೂರಪ್ಪ</span></p>
                        <p className="text-sm">Lok Sabha constituency: Shimoga parliamentary. constituency <br/> <span className="text-xs">ಲೋಕಸಭಾ ಕ್ಷೇತ್ರ: ಶಿವಮೊಗ್ಗ ಸಂಸದೀಯ ಕ್ಷೇತ್ರ</span></p>
                        <p className="text-sm">Parliament MP: B.Y.RAGHAVENDRA. <br/> <span className="text-xs">ಸಂಸದ: ಬಿ.ವೈ.ರಾಘವೇಂದ್ರ</span></p>
                        <p className="text-sm">Serpanch Name:- <br/> <span className="text-xs">ಸರ್ಪಂಚ್ ಹೆಸರು:-</span></p>
                        <div className="flex items-center space-x-4 mt-4">
                            <p className="text-sm">Pin Code: 577428 <br/> <span className="text-xs">ಪಿನ್ ಕೋಡ್: 577428</span></p>
                        </div>
                        <p className="text-sm">Post Office Name: Shiralakoppa <br/> <span className="text-xs">ಅಂಚೆ ಕಚೇರಿ ಹೆಸರು: ಶಿರಳಕೊಪ್ಪ</span></p>
                        <p className="text-sm mt-4">Commodities Prices: <a href="#" className="text-blue-500 hover:underline">Hirekerur Market / Mandi</a> <br/> <span className="text-xs">ಸರಕುಗಳ ಬೆಲೆಗಳು: <a href="#" className="text-blue-500 hover:underline">ಹಿರೇಕೆರೂರು ಮಾರುಕಟ್ಟೆ / ಮಂಡಿ</a></span></p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-12 mb-20">
                <h3 className="text-3xl font-semibold text-center text-gray-800 mb-6">Submitted Villager Details <br/> <span className="text-xl font-normal">ಸಲ್ಲಿಸಿದ ಗ್ರಾಮಸ್ಥರ ವಿವರಗಳು</span></h3>
                <p className="text-gray-500 text-center text-lg mt-8">Click on the Search button above to search villager details.<br/> <span className="text-base">ಗ್ರಾಮಸ್ಥರ ವಿವರಗಳನ್ನು ಹುಡುಕಲು ಮೇಲೆ ಇರುವ "ಹುಡುಕಿ" ಬಟನ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ.</span></p>
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
                <Route path="/announcements" element={<AnnouncementList />} />
                <Route path="/add-announcement" element={<AnnouncementForm />} />
                <Route path="/edit-staff/:id" element={<EditStaffForm />} />
            </Routes>
        </Router>
    );
}

export default App;
