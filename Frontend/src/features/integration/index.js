import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../utils/URL";
import { toast, Toaster } from "react-hot-toast";

function Integration() {
  const [integrationList, setIntegrationList] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const subjectOptions = [
    "English", "Maths", "Science", "Social Science", "Tamil",
    "Biology", "Physics", "Chemistry", "Zoology", "Botany",
    "Computer Science", "Other"
  ];
  const classOptions = [
    ...Array.from({ length: 12 }, (_, i) => i + 1),
    "Others"
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
          status: book.book_ispublic ? "Public" : "Private",
        }));

        setIntegrationList(transformed);
      } catch (error) {
        console.error("Error fetching integrations:", error);
        toast.error("Failed to fetch integrations");
      }
    };

    fetchIntegrations();
  }, []);

  const editIntegration = (index) => {
    const integration = integrationList[index];
    setCurrentEditData({ ...integration, index });
    setIsEditModalOpen(true);
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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {integrationList.map((integration, index) => (
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
                            {integration.isActive ? "Public" : "Private"}
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

                    {/* Bottom Action */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => editIntegration(index)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-semibold shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
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

     {/* Edit Modal */}
     <dialog id="edit_modal" className="modal" open={isEditModalOpen}>
  <div className="modal-box max-w-3xl bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 relative">
    
    {/* Close Button */}
    <button
      className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
      onClick={() => setIsEditModalOpen(false)}
    >
      ✕
    </button>

    {/* Modal Header */}
    <h2 className="text-3xl font-bold text-center mb-10 text-gray-800 dark:text-white">
      Edit Book Details
    </h2>

    {/* Form Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Book Title */}
      <div className="form-control">
        <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Book Title
        </label>
        <input
          type="text"
          value={currentEditData?.name || ""}
          onChange={(e) =>
            setCurrentEditData({ ...currentEditData, name: e.target.value })
          }
          className="input input-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
          placeholder="Enter book title"
        />
      </div>

      {/* Subject Dropdown */}
      <div className="form-control">
        <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Subject
        </label>
        <select
          value={currentEditData?.subject || ""}
          onChange={(e) =>
            setCurrentEditData({ ...currentEditData, subject: e.target.value })
          }
          className="select select-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
        >
          <option disabled value="">Select Subject</option>
          {subjectOptions.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>

      {/* Class Dropdown */}
      <div className="form-control md:col-span-2">
        <label className="label font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Class
        </label>
        <select
          value={currentEditData?.className || ""}
          onChange={(e) =>
            setCurrentEditData({ ...currentEditData, className: e.target.value })
          }
          className="select select-bordered w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary rounded-lg"
        >
          <option disabled value="">Select Class</option>
          {classOptions.map((classItem) => (
            <option key={classItem} value={classItem}>
              {classItem}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Visibility Switch */}
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

    {/* Modal Actions */}
    <div className="modal-action mt-10">
      <div className="flex gap-4 w-full">
        <button
          className="btn btn-outline w-1/2 border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsEditModalOpen(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveIntegration}
          className="btn btn-primary w-1/2 bg-primary text-white hover:bg-primary-dark transition-all"
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


      {/* Medium Dropdown */}
      {/* <div className="form-control">
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
      </div> */}


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