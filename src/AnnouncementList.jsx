import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

function AnnouncementList() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setAnnouncements(announcementsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching announcements: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-xl text-gray-500">Loading announcements...</p></div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Village Announcements</h2>
      {announcements.length > 0 ? (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{announcement.title}</h3>
              <p className="text-gray-700 mb-4">{announcement.content}</p>
              <div className="text-right text-sm text-gray-500">
                {announcement.createdAt ? `Posted on: ${announcement.createdAt.toLocaleDateString()} at ${announcement.createdAt.toLocaleTimeString()}` : 'Date not available'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-lg">No announcements have been made yet.</p>
      )}
    </div>
  );
}

export default AnnouncementList;