import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../utils/URL";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

function Integration() {
  const [integrationList, setIntegrationList] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentDeletetData, setCurrentDeletetData] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const subjectOptions = [
    "English",
    "Maths",
    "Science",
    "Social Science",
    "Tamil",
    "Biology",
    "Physics",
    "Chemistry",
    "Zoology",
    "Botany",
    "Computer Science",
    "type a subject",
  ];
  const classOptions = [
    ...Array.from({ length: 12 }, (_, i) => i + 1),
    "type a class",
  ];

  useEffect(() => {
    const fetchIntegrations = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get-books-by-user`, {
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

        setIntegrationList(transformed);
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

  const editIntegration = (integration, index) => {
    setCurrentEditData({ ...integration, index });
    setIsEditModalOpen(true);
  };

  const deleteIntegration = (integration, index) => {
    setCurrentDeletetData({ ...integration, index });
    setIsDeleteModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBooks = integrationList
    .filter(
      (book) =>
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

  // Create the delete API call
  const handleDeleteIntegration = async (book_id, index) => {
    try {
      await axios.delete(`${baseUrl}/delete-book-currentUser/${book_id}`, {
        withCredentials: true,
      });

      toast.success("Book deleted successfully!");

      setIntegrationList((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error("Failed to delete the book.");
    }
  };

  const handleSaveIntegration = async () => {
    try {
      const payload = {
        book_id: currentEditData.book_id, // important: send book_id
        title: currentEditData.name,
        subject: currentEditData.subject,
        class_name: currentEditData.className,
        medium: currentEditData.medium,
        book_ispublic: currentEditData.isActive,
      };

      await axios.put(`${baseUrl}/update-book-currentUser`, payload, {
        withCredentials: true,
      });

      toast.success(`Updated successfully!`);

      setIntegrationList((prev) =>
        prev.map((item, idx) =>
          idx === currentEditData.index ? { ...currentEditData } : item
        )
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(`Failed to update "${currentEditData.name}".`);
    }
  };

  return (
    <div className="relative">
      <Toaster />

      {integrationList.length > 0 ? (
        <div>
          <motion.div
            className=""
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-lime-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition duration-150"
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-lime-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 transition duration-150"
                >
                  <option value="name">Name</option>
                  <option value="subject">Subject</option>
                  <option value="className">Class</option>
                </select>
              </div>
            </div>
          </motion.div>
          <motion.div
            className=""
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map((integration, index) => (
                <div
                  key={integration.book_id}
                  className="backdrop-blur-md bg-white/70 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {integration.name}
                    </h2>
                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                        integration.isActive
                          ? "bg-green-500/80 text-white"
                          : "bg-red-500/80 text-white"
                      }`}
                    >
                      {integration.isActive ? "Public" : "Private"}
                    </div>
                  </div>

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

                  <div className="mt-6 flex justify-between gap-2">
                    {/* delete button */}
                    <button
                      onClick={() => deleteIntegration(integration, index)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-400 text-white text-sm font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-8 0h8"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => editIntegration(integration, index)}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-lime-400 text-white text-sm font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16.862 3.487a2.25 2.25 0 113.182 3.182L7.5 19.713 3 21l1.287-4.5L16.862 3.487z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
            alt="No Books"
            className="w-32 h-32 mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            No Books Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You haven't added any books yet. Start by creating one!
          </p>
        </div>
      )}

      {/* /* Delete Confirmation Modal  */}
      <dialog
        id="delete_modal"
        className="modal bg-slate-800 bg-opacity-80"
        open={isDeleteModalOpen}
      >
        <div className="modal-box w-xl xl:max-w-3xl bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 relative">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-4  top-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            ❌
          </button>
          <h2 className="text-lg mt-3 font-bold text-center mb-10 text-gray-800 dark:text-white">
            Are you sure you want to delete{" "}
            <span className="text-red-500 text-sm">
              {currentDeletetData?.name}
            </span>{" "}
            book?
          </h2>

          <div className="modal-action mt-10">
            <div className="flex gap-4 w-full">
              <button
                className="btn btn-outline w-1/2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-black-100 dark:hover:bg-gray-800"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteIntegration(
                    currentDeletetData.book_id,
                    currentDeletetData.index
                  );
                  setIsDeleteModalOpen(false);
                }}
                className="btn bg-gradient-to-r from-red-500 to-pink-400 w-1/2 bg-primary text-white hover:bg-gray-700 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </dialog>
      {/* Edit Modal */}

      <dialog
        id="edit_modal"
        className="modal  bg-black bg-opacity-70"
        open={isEditModalOpen}
      >
        <div className="modal-box max-w-3xl bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 relative">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
            onClick={() => setIsEditModalOpen(false)}
          >
            ❌
          </button>
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white ">
            Edit Book Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-control">
              <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Book Title
              </label>
              <input
                type="text"
                value={currentEditData?.name || ""}
                onChange={(e) =>
                  setCurrentEditData({
                    ...currentEditData,
                    name: e.target.value,
                  })
                }
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
                placeholder="Enter book title"
              />
            </div>
            <div className="form-control relative">
              <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                list="subject-list"
                value={currentEditData?.subject || ""}
                onChange={(e) =>
                  setCurrentEditData({
                    ...currentEditData,
                    subject: e.target.value,
                  })
                }
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
                placeholder="Select or type a subject"
              />
              <datalist id="subject-list">
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </div>

            <div className="form-control md:col-span-2 relative">
              <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Class
              </label>
              <input
                list="class-list"
                value={currentEditData?.className || ""}
                onChange={(e) =>
                  setCurrentEditData({
                    ...currentEditData,
                    className: e.target.value,
                  })
                }
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
                placeholder="Select or type a class"
              />
              <datalist id="class-list">
                {classOptions.map((classItem) => (
                  <option key={classItem} value={classItem} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="mt-10 border-t pt-6 flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                Book Visibility
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentEditData?.isActive
                  ? "🌍 This book is Public and visible to everyone."
                  : "🔒 This book is Private and only visible to you."}
              </p>
            </div>
            <label className="swap swap-rotate">
              <input
                type="checkbox"
                checked={currentEditData?.isActive || false}
                onChange={(e) => {
                  const newIsActive = e.target.checked;
                  setCurrentEditData({
                    ...currentEditData,
                    isActive: newIsActive,
                    status: newIsActive ? "Public" : "Private",
                  });
                }}
              />
              <div className="swap-on badge badge-success p-4 text-white text-sm">
                Public
              </div>
              <div className="swap-off badge badge-error p-4 text-white text-sm">
                Private
              </div>
            </label>
          </div>
          <div className="modal-action mt-10">
            <div className="flex gap-4 w-full">
              <button
                className="btn btn-outline w-1/2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-black-100 dark:hover:bg-gray-800"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveIntegration}
                className="btn bg-gradient-to-r from-green-500 to-lime-400 w-1/2 bg-primary text-white hover:bg-gray-700 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default Integration;

{
  /* Medium Dropdown */
}
{
  /* <div className="form-control">
        <label className="label font-semibold text-gray-700">Medium</label>
        <select
          value={currentEditData?.medium || ""}
          onChange={(e) =>
            setCurrentEditData({ ...currentEditData, medium: e.target.value })
          }
          className="select select-bordered w-full"
        >
          <option disabled value="">
            Select Medium
          </option>
          {[
            "English", "Tamil", "Hindi", "Telugu", "Kannada",
            "Malayalam", "Bengali", "Gujarati", "Marathi", "Punjabi",
            "Urdu", "Other"
          ].map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div> */
}

// import { useState } from "react"
// import { useDispatch } from "react-redux"
// import TitleCard from "../../components/Cards/TitleCard"
// import { showNotification } from "../common/headerSlice"

// const INITIAL_INTEGRATION_LIST = [
//     {name : "Slack", icon : "https://cdn-icons-png.flaticon.com/512/2111/2111615.png", isActive : true, description : "Slack is an instant messaging program designed by Slack Technologies and owned by Salesforce."},
//     {name : "Facebook", icon : "https://cdn-icons-png.flaticon.com/512/124/124010.png", isActive : false, description : "Meta Platforms, Inc., doing business as Meta and formerly named Facebook, Inc., and TheFacebook."},
//     {name : "Linkedin", icon : "https://cdn-icons-png.flaticon.com/512/174/174857.png", isActive : true, description : "LinkedIn is a business and employment-focused social media platform that works through websites and mobile apps."},
//     {name : "Google Ads", icon : "https://cdn-icons-png.flaticon.com/512/2301/2301145.png", isActive : false, description : "Google Ads is an online advertising platform developed by Google, where advertisers bid to display brief advertisements, service offerings"},
//     {name : "Gmail", icon : "https://cdn-icons-png.flaticon.com/512/5968/5968534.png", isActive : false, description : "Gmail is a free email service provided by Google. As of 2019, it had 1.5 billion active users worldwide."},
//     {name : "Salesforce", icon : "https://cdn-icons-png.flaticon.com/512/5968/5968880.png", isActive : false, description : "It provides customer relationship management software and applications focused on sales, customer service, marketing automation."},
//     {name : "Hubspot", icon : "https://cdn-icons-png.flaticon.com/512/5968/5968872.png", isActive : false, description : "American developer and marketer of software products for inbound marketing, sales, and customer service."},
// ]

// function Integration(){

//     const dispatch = useDispatch()

//     const [integrationList, setIntegrationList] = useState(INITIAL_INTEGRATION_LIST)

//     const updateIntegrationStatus = (index) => {
//         let integration = integrationList[index]
//         setIntegrationList(integrationList.map((i, k) => {
//             if(k===index)return {...i, isActive : !i.isActive}
//             return i
//         }))
//         dispatch(showNotification({message : `${integration.name} ${integration.isActive ? "disabled" : "enabled"}` , status : 1}))
//     }

//     const Toast = () => {
//         dispatch(showNotification({message : "hiii", isActive : "enabled", status : 1 }))
//     }

//     return(
//         <>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {
//                 integrationList.map((i, k) => {
//                     return(
//                         <TitleCard key={k} title={i.name} topMargin={"mt-2"}>

//                             <p className="flex">
//                                 <img alt="icon" src={i.icon} className="w-12 h-12 inline-block mr-4" />
//                                 {i.description}
//                             </p>
//                             <div className="mt-6 text-right">
//                                 <input type="checkbox" className="toggle toggle-success toggle-lg" checked={i.isActive} onChange={() => updateIntegrationStatus(k)}/>
//                             </div>

//                         </TitleCard>
//                     )

//                 })

//             }
//              <div>
//                             <button type="button"   onClick={() => Toast()}>  clikeme</button>
//                             </div>

//             </div>
//         </>
//     )
// }

// export default Integration
