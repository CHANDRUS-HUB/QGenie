import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../utils/URL";
import { toast, Toaster } from "react-hot-toast";
function PublicBooks() {
    const [publicbooksList, setPublicbooksList] = useState([]);
  
    useEffect(() => {
      const fetchIntegrations = async () => {
        try {
          const response = await axios.get(`${baseUrl}/get-all-publicbooks`, {
            withCredentials: true,
          });
  
          const books = response.data.books || [];
  
          const transformed = books.map((book) => ({
            book_id: book.book_id, // important: keep book_id
            name: book.title || book.original_name || "Untitled Book",
            icon: book.book_ispublic
              ? "https://cdn-icons-png.flaticon.com/512/2111/2111615.png"
              : "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
            isActive: book.book_ispublic ?? false,
            subject: book.subject || "N/A",
            className: book.class_name || "N/A",
            medium: book.medium || "N/A",
            totalChapters: book.total_chapters ?? 0,
            status: book.book_ispublic ? "Public" : "Private",
          }));
  
          setPublicbooksList(transformed);
        } catch (error) {
          console.error("Error fetching integrations:", error);
          toast.error("Failed to fetch integrations");
        }
      };
  
      fetchIntegrations();
    }, []);
  
  
    return (
      <div className="relative">
        <Toaster />
  
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicbooksList.map((integration, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 p-6 flex flex-col justify-between"
            >
              {/* Top Section */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {integration.name}
                  </h2>
                </div>
                <div
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                    integration.isActive
                      ? "bg-green-500/80 text-white"
                      : "bg-red-500/80 text-white"
                  }`}
                >
                  {integration.status}
                </div>
              </div>
  
              {/* Middle Section */}
              <div className="flex items-center space-x-5">
                <img
                  alt="icon"
                  src={integration.icon}
                  className="w-14 h-14 rounded-full object-cover dark:ring-4 ring-indigo-300 hover:scale-110 transition-transform duration-300"
                />
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>
                    <span className="font-semibold">Subject:</span> {integration.subject}
                  </li>
                  <li>
                    <span className="font-semibold">Class:</span> {integration.className}
                  </li>
                  <li>
                    <span className="font-semibold">Medium:</span> {integration.medium}
                  </li>
                  <li>
                    <span className="font-semibold">Chapters:</span> {integration.totalChapters}
                  </li>
                </ul>
              </div>
  
            
             
            </div>
          ))}
        </div>
  
       
      </div>
    );
  }
  
  export default PublicBooks;