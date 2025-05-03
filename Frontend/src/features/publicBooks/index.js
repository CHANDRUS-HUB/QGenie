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
          User_name: book.User?.username || "N/A",
          name: book.title || book.original_name || "Untitled Book",
          icon: book.book_ispublic
            ? "https://cdn-icons-png.flaticon.com/512/2111/2111615.png"
            : "https://cdn-icons-png.flaticon.com/512/2232/2232688.png",
          isActive: book.book_ispublic ?? false,
          create_at: book.created_at || "N/A",
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
        } else {
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
            {/* total no of books */}
           
            <div className="col-span-2">
              <label
                htmlFor="search"
                className="block text-sm text-green-500 dark:text-lime-500 font-medium mb-1"
              >
                📚 Search Books
              </label>
              <input
                id="search"
                type="text"
                placeholder="Enter title, subject, class, or medium..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full mb-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-lime-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition duration-150"
              />
            </div>
            <div>
              <label
                htmlFor="sort"
                className="block text-sm text-green-500 font-medium dark:text-lime-500 mb-1"
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
            <div className="col-span-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Total Books: {publicbooksList.length}
              </h2>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                {publicbooksList.length} books available for you to explore.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {filteredBooks.map((book, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-md hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 p-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b-2 border-gray-200 dark:border-gray-800 pb-1">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {book.name}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${book.isActive
                        ? "bg-green-500/90 text-white"
                        : "bg-red-500/90 text-white"
                      } shadow-sm`}
                  >
                    {book.status}
                  </span>
                </div>

                {/* Middle Content */}
                <div className="flex gap-6 items-center justify-center">
                  {/* Book Icon */}
                  <img
                    alt="icon"
                    src={book.icon}
                    className="w-24 h-30 rounded-full object-cover shadow-md dark:ring-2  dark:ring-indigo-500"
                  />

                  {/* Details */}
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>
                      <span className="font-medium">User Name:</span>{" "}
                      {book.User_name || "N/A"}
                    </li>
                    <li>
                      <span className="font-medium">Subject:</span> {book.subject}
                    </li>
                    <li>
                      <span className="font-medium">Class:</span> {book.className}
                    </li>
                    <li>
                      <span className="font-medium">Medium:</span> {book.medium}
                    </li>
                    <li>
                      <span className="font-medium">Chapters:</span>{" "}
                      {book.totalChapters}
                    </li>
                    <li>
                      <span className="font-medium">Topics:</span>{" "}
                      {book.totalTopics}
                    </li>
                  </ul>
                </div>

                {/* Footer */}
                <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-right">
                  Uploaded on:{" "}
                  {new Date(book.create_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
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