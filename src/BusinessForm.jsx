import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useParams, useNavigate } from "react-router-dom";

// Services that have a specific business name field and a members list
const servicesWithMembers = ["Shops", "Grama Panchayat", "Rice Mill", "Schools", "Interlock Factory", "Wine Shop"];
// Services that have a simple form (no members list)
const simplifiedServices = ["Electrician", "Doctors", "Engineers", "Teachers"];

const BusinessForm = () => {
    const { businessType } = useParams();
    const navigate = useNavigate();

    const isSimplified = simplifiedServices.includes(businessType);
    const hasMembers = servicesWithMembers.includes(businessType);

    const [formData, setFormData] = useState(() => {
        // Initialize state based on the type of service
        if (isSimplified) {
            return { name: "", phone: "", address: "", specification: "", type: businessType };
        } else {
            return {
                businessName: "",
                ownerName: "",
                address: "",
                phone: "",
                type: businessType,
                members: [{ name: "", work: "", phone: "" }],
            };
        }
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

    const addMember = () => {
        setFormData({
            ...formData,
            members: [...formData.members, { name: "", work: "", phone: "" }],
        });
    };

    const removeMember = (index) => {
        const newMembers = [...formData.members];
        newMembers.splice(index, 1);
        setFormData({ ...formData, members: newMembers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "businesses"), formData);
            alert("Details added successfully!");
            navigate(`/business/${businessType}`);
        } catch (error) {
            console.error("Error adding details: ", error);
            alert("Failed to add details. Please try again.");
        }
    };

    // Determine the name of the business field dynamically
    const businessNameLabel = `${businessType} Name`;
    // Determine the label for the owner/principal field
    const ownerLabel = businessType === "Schools" ? "Principal Name" : "Owner Name";

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">Add {businessType} Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSimplified ? (
                        // Simplified form for Electrician, Doctors, etc.
                        <>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Specification</label>
                                <input type="text" name="specification" value={formData.specification} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </>
                    ) : (
                        // Full form for Shops, Schools, Wine Shop, etc.
                        <>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">{businessNameLabel}</label>
                                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">{ownerLabel}</label>
                                <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Phone</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-gray-800">Staff/Members</h3>
                                {formData.members.map((member, index) => (
                                    <div key={index} className="flex flex-col space-y-2 border p-4 rounded-lg bg-gray-50">
                                        <label className="block text-gray-700 font-medium">Member {index + 1}</label>
                                        <input type="text" name="name" placeholder="Name" value={member.name} onChange={(e) => handleMemberChange(index, e)} required className="p-2 border border-gray-300 rounded-lg" />
                                        <input type="text" name="work" placeholder="Work" value={member.work} onChange={(e) => handleMemberChange(index, e)} required className="p-2 border border-gray-300 rounded-lg" />
                                        <input type="tel" name="phone" placeholder="Phone" value={member.phone} onChange={(e) => handleMemberChange(index, e)} required className="p-2 border border-gray-300 rounded-lg" />
                                        {formData.members.length > 1 && (
                                            <button type="button" onClick={() => removeMember(index)} className="mt-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">Remove Member</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={addMember} className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Add Another Member</button>
                            </div>
                        </>
                    )}
                    <div className="flex justify-start items-center mt-6 space-x-4">
                        <button type="button" onClick={() => navigate(`/business/${businessType}`)} className="bg-gray-400 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-500 transition duration-300 text-base">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300 text-base">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessForm;