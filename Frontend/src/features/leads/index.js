import moment from "moment"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import TitleCard from "../../components/Cards/TitleCard"
import { openModal } from "../common/modalSlice"
import { deleteLead, getLeadsContent } from "./leadSlice"
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_BODY_TYPES } from '../../utils/globalConstantUtil'
import TrashIcon from '@heroicons/react/24/outline/TrashIcon'
import { showNotification } from '../common/headerSlice'
import { toast } from 'react-hot-toast'
import InboxArrowDownIcon from '@heroicons/react/24/outline/InboxArrowDownIcon'
import axios from "axios"
import baseUrl from "../../utils/URL"
import { motion } from "framer-motion"

function Leads() {
    const { leads } = useSelector((state) => state.lead);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getLeadsContent());
    }, [dispatch]);

    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorMessage2, setErrorMessage2] = useState("");
    const [subject, setSubject] = useState("");
    const [className, setClassName] = useState("");

    const [responseContent, setResponseContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isValidFile, setIsValidFile] = useState(null);
    const [bookIsPublic, setBookIsPublic] = useState(true);
    const allowedFileTypes = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
        "text/plain"
    ];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && allowedFileTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setIsValidFile(true);
        } else {
            // Clear invalid file and show error toast immediately
            setFile(null);
            setIsValidFile(false);
            toast.error("Invalid file type. Only .doc, .docx, .pdf, and .txt files are allowed.");
        }
    };

    const togglePublicStatus = () => {
        setBookIsPublic(!bookIsPublic); // Toggle the public/private status
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && allowedFileTypes.includes(droppedFile.type)) {
            setFile(droppedFile);
            setIsValidFile(true);
        } else {

            setFile(null);
            setIsValidFile(false);
            toast.error("Invalid file type. Only .doc, .docx, .pdf, and .txt files are allowed.");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const generateQuestionPaper = async () => {
        if (!file) {
            toast.error("Please upload a file before submitting.");
            return;
        }

        if (!subject) {
            setErrorMessage("Please provide subject.");
            return;
        }

        if (!className) {
            setErrorMessage2("Please provide class name.");
            return;
        }


        // Clear error messages
        setErrorMessage("");
        setErrorMessage2("");

        setIsLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", subject);
        formData.append("class_name", className);
        formData.append("Book__ispublic", bookIsPublic.toString());

        console.log(bookIsPublic.toString());




        try {
            const response = await axios.post(`${baseUrl}/upload-book`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            });

            toast.success(response.data.message);
            setFile(null);
            setSubject("");
            setClassName("");
            setIsValidFile(null);
            setErrorMessage2("");

            if (response.data.message && response.data.message.includes("Duplicate book detected")) {
                const bookId = response.data.book_id;
                const bookDetailsResponse = await axios.get(`${baseUrl}/get-book-by-bookid/${bookId}`, {
                    withCredentials: true,
                });
                setTimeout(() => {
                    setResponseContent({
                        ...response.data,
                        book: bookDetailsResponse.data.book,
                    });
                    setIsModalOpen(true);
                }, 2000);
            } else {
                setTimeout(() => {
                    setResponseContent(response.data);
                    setIsModalOpen(true);
                }, 2000);
            }
        } catch (error) {
            const response = error.response;
            if (401 === response.status) {
                toast.error("Session expired. Please login again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
            if (response && response.data && response.data.error) {
                toast.error(response.data.error);
            }
            console.error("Error during API call:", error);
        } finally {
            setIsLoading(false);
        }
    };



    const subjectOptions = [
        "English", "Maths", "Science", "Social Science", "Tamil",
        "Biology", "Physics", "Chemistry", "Zoology", "Botany",
        "Computer Science", "Other"
    ];

    const classOptions = [
        ...Array.from({ length: 12 }, (_, i) => i + 1),
        "Others"
    ];

    return (

        <>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6 text-center rounded-xl shadow-xl bg-white/50 p-6 w-full max-w-4xl mx-auto"
            >
                <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-lime-400 bg-clip-text text-transparent drop-shadow-md">
                    QGENIE <span className="font-light">Questions Generator</span>
                </h1>
            </motion.header>

            <TitleCard title="Please select a file (accepted types: .doc, .docx, .pdf, .txt)" topMargin="mt-6">
                <div
                    className={`relative border-2 ${isValidFile === null
                        ? 'border-dashed border-gray-300 bg-gray-50'
                        : isValidFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-red-400 bg-red-50'
                        } rounded-xl p-6 sm:p-8 transition-all duration-300 text-center cursor-pointer hover:shadow-md w-full`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {file ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-700 gap-4">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full">
                                    ✔
                                </span>
                                <span className="break-words">
                                    Uploaded: <strong>{file.name}</strong>
                                </span>
                            </div>
                            <button
                                className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition"
                                onClick={() => {
                                    setFile(null);
                                    setIsValidFile(null);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <InboxArrowDownIcon className="h-12 w-12 text-green-400 " />
                            <p className="text-gray-700 text-base font-medium text-center">Drag and drop your file here</p>
                            <p className="text-sm text-gray-500 text-center">or click below to select a file</p>

                            {/* Styled file input */}
                            <label className="inline-block cursor-pointer mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold text-sm rounded-lg hover:bg-indigo-100 transition">
                                Choose File
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                            </label>
                            <h4 className="text-sm">(accepted types: .doc, .docx, .pdf, .txt)</h4>
                        </div>
                    )}
                </div>



                {file && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                Subject
                            </label>
                            <select
                                id="subject"
                                className="input input-bordered w-full"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            >
                                <option value="">Select Subject</option>
                                {subjectOptions.map((subjectOption) => (
                                    <option key={subjectOption} value={subjectOption}>
                                        {subjectOption}
                                    </option>
                                ))}
                            </select>
                            {subject && <p className="mt-2 text-sm text-gray-500">Selected Subject: <strong>{subject}</strong></p>}
                            {!subject && errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
                        </div>
                        <div>
                            <label htmlFor="className" className="block text-sm font-medium text-gray-700">
                                Class Name
                            </label>
                            <select
                                id="className"
                                className="input input-bordered w-full"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                            >
                                <option value="">Select Class</option>
                                {classOptions.map((classOption) => (
                                    <option key={classOption} value={classOption}>
                                        Class {classOption}
                                    </option>
                                ))}
                            </select>
                            {className && <p className="mt-2 text-sm text-gray-500">Selected Class: <strong>Class {className}</strong></p>}
                            {!className && errorMessage2 && <p className="mt-2 text-sm text-red-500">{errorMessage2}</p>}
                        </div>




                        <div className="mt-4 flex items-center space-x-4">


                            <label className="font-medium text-gray-700">
                                Book Visibility set as <span className="font-bold text-black">{bookIsPublic ? 'Public' : 'Private'}</span>
                                <br />
                                <p className="text-sm text-gray-500 mt-2">
                                    {bookIsPublic
                                        ? "Anyone can view this book when it's set to Public."
                                        : "Only you can view this book when it's set to Private."}
                                </p>

                            </label>

                            <label
                                htmlFor="visibility-toggle"
                                className="relative inline-flex items-center cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    id="visibility-toggle"
                                    checked={bookIsPublic}
                                    onChange={togglePublicStatus}
                                    className="sr-only"
                                />
                                <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner transition-colors duration-300 ease-in-out">
                                    {/* Inner toggle circle */}
                                    <div
                                        className={`${bookIsPublic ? 'translate-x-5 bg-green-500' : 'translate-x-0 bg-red-500'
                                            } absolute left-1 top-1 w-3 h-3 rounded-full transition-all duration-300 ease-in-out`}
                                    ></div>
                                </div>
                            </label>
                        </div>

                        {/* Add description text below */}




                    </div>





                )}

                {isLoading ? (
                    <div className="flex justify-center mt-6">
                        <div className="w-8 h-8 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <button
                        className="btn  mt-6 bg-gradient-to-r from-green-500 to-lime-500 text-white"
                        onClick={generateQuestionPaper}
                        disabled={isLoading} // Disable the button while loading
                    >
                        Upload File
                    </button>
                )}
            </TitleCard>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 animate-fade-in">
                        <div className="border-b pb-4 mb-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-3xl font-semibold text-gray-800">📘 Book Details</h3>
                                <span className={`px-3 py-1 rounded-full font-semibold text-white ${responseContent.book.book_ispublic ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {responseContent.book.book_ispublic ? "Public" : "Private"}
                                </span>
                            </div>

                            <p className="text-gray-500 text-sm mt-1">
                                {responseContent?.message || "The response from the server will be displayed here."}
                            </p>
                        </div>

                        {responseContent?.book && (
                            <div className="space-y-3 text-gray-700 text-base">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="font-medium text-gray-900">Title:</span> {responseContent.book.title || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Subject:</span> {responseContent.book.subject || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Class Name:</span> {responseContent.book.class_name + " Standard" || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Medium:</span> {responseContent.book.medium || "N/A"}
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900">Total Chapters:</span> {responseContent.book.total_chapters || "N/A"}
                                    </div>
                                    {/* <div>
                                        <span className="font-medium text-gray-900">Total Topics:</span> {responseContent.book.metadata?.totalTopics || "N/A"}
                                    </div> */}
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                className="inline-flex items-center px-6 py-2  bg-gradient-to-r from-green-500 to-lime-400 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

export default Leads;








{/* Topic Input */ }
//  <div>
//  <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
//  <input 
//      id="topic"
//      type="text" 
//      className="input input-bordered w-full" 
//      placeholder="Topic" 
//      value={topic}
//      onChange={(e) => setTopic(e.target.value)}
//  />
// </div>

// {/* Question Type Dropdown */}
// <div>
//  <label htmlFor="questionType" className="block text-sm font-medium text-gray-700">Question Type</label>
//  <select 
//      id="questionType" 
//      className="select select-bordered w-full" 
//      value={questionType} 
//      onChange={(e) => setQuestionType(e.target.value)}
//  >
//      <option>Multiple Choice</option>
//      <option>Fill in the Blanks</option>
//      <option>True/False</option>
//      <option>Short Answer</option>
//  </select>
// </div>


// <div>
// <label className="block text-sm font-medium text-gray-700 mb-2">Select Difficulty Level & Set Question Count</label>
// <div className="flex flex-wrap gap-4">
// {difficultyOptions.map((option) => (
//  <div
//      key={option.label}
//      className={`cursor-pointer  rounded-lg px-3 py-1 w-48 transition-all duration-200
//          ${option.color}

//      `}
//      onClick={() => setDifficulty(option.label)}
//  >
//      <div className="text-center font-semibold mb-2">{option.label}</div>
//      <input
//          type="number"
//          min={1}
//          value={numQuestions[option.label]}
//          onClick={(e) => e.stopPropagation()} // prevent card from being selected when clicking input
//          onChange={(e) => {
//              const updated = { ...numQuestions, [option.label]: Number(e.target.value) }
//              setNumQuestions(updated)
//          }}
//          className="input input-bordered w-full"
//      />

//  </div>
// ))}
// </div>
// </div>







// function Leads() {
//     const { leads } = useSelector(state => state.lead)
//     const dispatch = useDispatch()

//     useEffect(() => {
//         dispatch(getLeadsContent())
//     }, [])

//     const [file, setFile] = useState(null)
//     const [subject, setSubject] = useState("")
//     const [topic, setTopic] = useState("")
//     const [type, setType] = useState("Objective")
//     const [difficulty, setDifficulty] = useState("Easy")

//     const [questionType, setQuestionType] = useState("Multiple Choice")
//     const [numQuestions, setNumQuestions] = useState({ Easy: 5, Medium: 5, Hard: 5 })

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0])
//     }

//     const handleDrop = (e) => {
//         e.preventDefault()
//         setFile(e.dataTransfer.files[0])
//     }

//     const handleDragOver = (e) => {
//         e.preventDefault()
//     }

//     const generateQuestionPaper = () => {
//         console.log({
//             file,
//             subject,
//             topic,
//             type,
//             difficulty,
//             numQuestions,
//             questionType
//         })
//         alert("Question Paper Generation Triggered!")
//     }

//     const difficultyOptions = [
//         { label: "Easy", color: "bg-green-100 border-green-400" },
//         { label: "Medium", color: "bg-yellow-100 border-yellow-400" },
//         { label: "Hard", color: "bg-red-100 border-red-400" },
//     ]

//     return (
//         <>
//             <TitleCard title="Please select a file (Accepted types: .doc, .pdf, .txt)" topMargin="mt-6">
//                 <div
//                     className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
//                     onDrop={handleDrop}
//                     onDragOver={handleDragOver}
//                 >
//                     {file ? (
//                         <div className="text-sm text-gray-600">File Uploaded: <strong>{file.name}</strong></div>
//                     ) : (
//                         <>
//                             <InboxArrowDownIcon className="mx-auto h-12 w-12 text-gray-400" />
//                             <p className="mt-2 text-sm text-gray-500">Drag & drop file here or</p>
//                             <input type="file" className="mt-2" onChange={handleFileChange} />
//                         </>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
//                     {/* Subject Input */}
//                     <div>
//                         <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
//                         <input
//                             id="subject"
//                             type="text"
//                             className="input input-bordered w-full"
//                             placeholder="Subject"
//                             value={subject}
//                             onChange={(e) => setSubject(e.target.value)}
//                         />
//                     </div>

//                     {/* Topic Input */}
//                     <div>
//                         <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
//                         <input
//                             id="topic"
//                             type="text"
//                             className="input input-bordered w-full"
//                             placeholder="Topic"
//                             value={topic}
//                             onChange={(e) => setTopic(e.target.value)}
//                         />
//                     </div>



//                     <div className="md:col-span-2">
//     <label className="block text-sm font-medium text-gray-700 mb-2">Select Difficulty Level & Set Question Count</label>
//     <div className="flex flex-wrap gap-4">
//         {difficultyOptions.map((option) => (
//             <div
//                 key={option.label}
//                 className={`cursor-pointer border rounded-lg px-3 py-1 w-48 transition-all duration-200
//                     ${option.color}
//                     ${difficulty === option.label ? "ring-2 ring-offset-2 ring-gray-600" : "opacity-90"}
//                 `}
//                 onClick={() => setDifficulty(option.label)}
//             >
//                 <div className="text-center font-semibold mb-2">{option.label}</div>
//                 <input
//                     type="number"
//                     min={1}
//                     value={numQuestions[option.label]}
//                     onClick={(e) => e.stopPropagation()} // prevent card from being selected when clicking input
//                     onChange={(e) => {
//                         const updated = { ...numQuestions, [option.label]: Number(e.target.value) }
//                         setNumQuestions(updated)
//                     }}
//                     className="input input-bordered w-full"
//                 />
//                 {/* <div className="text-xs text-gray-600 mt-1 text-center">Questions</div> */}
//             </div>
//         ))}
//     </div>
// </div>





//                 </div>

//                 <button className="btn btn-primary mt-6" onClick={generateQuestionPaper}>Generate QP</button>
//             </TitleCard>
//         </>
//     )
// }

// export default Leads




{/* <TitleCard title="Current Leads" topMargin="mt-2" TopSideButtons={<TopSideButtons />}>

            <div className="overflow-x-auto w-full">
                <table className="table w-full">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email Id</th>
                        <th>Created At</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                        {
                            leads.map((l, k) => {
                                return(
                                    <tr key={k}>
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img src={l.avatar} alt="Avatar" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{l.first_name}</div>
                                                <div className="text-sm opacity-50">{l.last_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{l.email}</td>
                                    <td>{moment(new Date()).add(-5*(k+2), 'days').format("DD MMM YY")}</td>
                                    <td>{getDummyStatus(k)}</td>
                                    <td>{l.last_name}</td>
                                    <td><button className="btn btn-square btn-ghost" onClick={() => deleteCurrentLead(k)}><TrashIcon className="w-5"/></button></td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
            </TitleCard> */}