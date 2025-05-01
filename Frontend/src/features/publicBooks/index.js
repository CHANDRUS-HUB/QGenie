import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../utils/URL";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

function PublicBooks() {
  const [publicbooksList, setPublicbooksList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");

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
          totalTopics: book.metadata?.totalTopics || 0,
          status: book.book_ispublic ? "Public" : "Private",
        }));

        setPublicbooksList(transformed);
      } catch (error) {
        const response = error.response;
        if (401 === response.status) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => {
              window.location.href = "/login";
          }, 2000);
      } else{
        console.error("Error fetching integrations:", error);
        toast.error("Failed to fetch user books");
      }
      }
    };

    fetchIntegrations();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBooks = publicbooksList
    .filter((book) =>
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.medium.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortOption === "subject") {
        return a.subject.localeCompare(b.subject);
      } else if (sortOption === "className") {
        return a.className.localeCompare(b.className);
      }
      return 0;
    });

  const handleSort = (e) => {
    setSortOption(e.target.value);
  };

  

  return (
    <div className="relative">
      <Toaster />

      {filteredBooks.length === 0 ? (
        <motion.div
          className="flex flex-col items-center justify-center h-full py-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No Books"
            className="w-32 h-32 mb-6"
          />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            No Books Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            It seems there are no public books at the moment.
          </p>
        </motion.div>
      ) : (
        <div>
          {/* Search and Sort Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="col-span-2">
              <label
                htmlFor="search"
                className="block text-s text-green-500 dark:text-lime-500 font-medium mb-1"
              >
                📚 Search Books
              </label>
              <input
                id="search"
                type="text"
                placeholder="Enter title or subject or medium..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full mb-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-lime-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition duration-150"
              />
            </div>
            <div>
              <label
                htmlFor="sort"
                className="block text-s text-green-500 font-medium dark:text-lime-500 mb-1"
              >
                🔍 Sort By
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={handleSort}
                className="w-full px-4 mb-2 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-lime-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition duration-150"
              >
                <option value="name">Name</option>
                <option value="subject">Subject</option>
                <option value="className">Class</option>
              </select>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1 ,y:0}}
            transition={{ duration: 0.6 }}
          >
            {filteredBooks.map((integration, index) => (
              <motion.div
                key={index}
                className="backdrop-blur-md bg-white/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 p-6 flex flex-col justify-between"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Top Section */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {integration.name}
                    </h2>
                  </div>
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${integration.isActive
                        ? "bg-green-500/80 text-white"
                        : "bg-red-500/80 text-white"
                      }`}
                  >
                    {integration.status}
                  </div>
                </div>

                {/* Middle Section */}
                <div className="flex items-center justify-center space-x-5">
                  <img
                    alt="icon"
                    src={integration.icon}
                    className="w-18 h-20 rounded-full object-cover dark:ring-4 ring-indigo-300 hover:scale-110 transition-transform duration-300"
                  />
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>
                      <span className="font-semibold">Subject:</span>{" "}
                      {integration.subject}
                    </li>
                    <li>
                      <span className="font-semibold">Class:</span>{" "}
                      {integration.className}
                    </li>
                    <li>
                      <span className="font-semibold">Medium:</span>{" "}
                      {integration.medium}
                    </li>
                    <li>
                      <span className="font-semibold">Chapters:</span>{" "}
                      {integration.totalChapters}
                    </li>
                    <li>
                      <span className="font-semibold">Topics:</span>{" "}
                      {integration.totalTopics}
                    </li>
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default PublicBooks;