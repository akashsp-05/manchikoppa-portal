// ... (imports and other components)

function BusinessPage() {
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

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">{businessType} Details</h2>
            <Link to={`/add-business-details/${businessType}`} className="px-4 py-2 bg-green-500 text-white rounded-lg mb-4 inline-block">Add New {businessType}</Link>
            
            {isLoading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : businesses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses.map((biz) => (
                        <div key={biz.id} className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="font-bold text-xl text-blue-700">{biz.businessName}</h3>
                            <p className="text-gray-700">Owner: {biz.ownerName}</p>
                            
                            {/* Display the list of members */}
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
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No {businessType} details found.</p>
            )}
        </div>
    );
}

// ... (remaining App.jsx code)