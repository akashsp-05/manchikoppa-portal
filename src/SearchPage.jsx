import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

function SearchPage({ user }) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const performSearch = async (queryTerm) => {
    if (queryTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const q = query(collection(db, "villagers"), where("lowercaseName", ">=", queryTerm), where("lowercaseName", "<=", queryTerm + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching documents: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery);
  }, [initialQuery]);

  const handleInputChange = (e) => {
    const queryTerm = e.target.value.toLowerCase();
    setSearchQuery(queryTerm);
    performSearch(queryTerm);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteDoc(doc(db, "villagers", id));
        alert("Details deleted successfully!");
        setSearchResults(searchResults.filter(result => result.id !== id));
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete details. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Search Villagers</h1>
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={handleInputChange}
          className="p-3 rounded-full w-full max-w-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-inner"
        />
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : searchResults.length > 0 ? (
          searchResults.map((detail) => (
            <div key={detail.id} className="flex justify-between items-center p-4 border-b last:border-b-0 hover:bg-gray-100 transition-colors duration-200">
              <div>
                <p className="text-gray-700 text-sm">
                  <strong className="capitalize">Name:</strong> {detail.name}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong className="capitalize">Phone:</strong> {detail.phone}
                </p>
                <p className="text-gray-700 text-sm">
                  <strong className="capitalize">Work:</strong> {detail.work}
                </p>
                {detail.address && (
                  <p className="text-gray-700 text-sm">
                    <strong className="capitalize">Address:</strong> {detail.address}
                  </p>
                )}
                {detail.age && (
                  <p className="text-gray-700 text-sm">
                    <strong className="capitalize">Age:</strong> {detail.age}
                  </p>
                )}
                {detail.dob && (
                  <p className="text-gray-700 text-sm">
                    <strong className="capitalize">DOB:</strong> {detail.dob}
                  </p>
                )}
              </div>
              {user && (
                <button onClick={() => handleDelete(detail.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full transition-colors duration-200">
                  <FaTrash />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;