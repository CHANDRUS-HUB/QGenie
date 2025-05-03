import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Book,
  ListOrdered,
  FileText,
  LayoutList,
  Gauge,
  Hash,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import baseUrl from "../../utils/URL"; // Replace with your actual API base URL

export default function QuestionGeneratorUI() {
  const [inputText, setInputText] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [easynumQuestions, seteasyNumQuestions] = useState("5");
  const [mediumnumQuestions, setmediumNumQuestions] = useState("5");
  const [hardnumQuestions, sethardNumQuestions] = useState("5");
  const [showModal, setShowModal] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selections, setSelections] = useState({
    Book: "",
    Chapter: [],
    Topic: [],
    "Question Type": "",
  });


  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get-books-by-user-publicbooks`, {
          withCredentials: true,
        });
        setBooks(response.data.books); // Accessing the books array from the response
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      setChapters([]) // if (!selections.Book) return;

      try {
        const response = await axios.get(
          `${baseUrl}/get-chapters/${selections.Book}`,
          { withCredentials: true }
        );
        const fetchedChapters = response.data.chapters;
        setChapters(fetchedChapters); // Set fetched chapters

        // If chapters is empty, clear the Topic selection
        if (fetchedChapters.length === 0) {
          setTopics([]); // Clear topics if no chapters are found
        }
        setSelections((prev) => ({ ...prev, Chapter: "", Topic: "" }));
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setTopics([]);
      }
    };

    fetchChapters();
  }, [selections.Book]);

  useEffect(() => {
    const fetchTopics = async () => {
      setTopics([]);

      if (!selections.Book || selections.Chapter.length === 0) return;

      try {
        const response = await axios.get(
          `${baseUrl}/get-multiple-topics`,
          {
            params: {
              book_id: selections.Book,
              chapter_ids: selections.Chapter.join(','),
            },
            withCredentials: true,
          }
        );

        setTopics(response.data.topics || []);
        setSelections((prev) => ({ ...prev, Topic: "" }));
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selections.Chapter]);

  const handleGenerateQuestions = async () => {
    try {
      let hasError = false;

      if (!selections.Book) {
        toast.error("Please select a Book");
        hasError = true;
      }

      if (!selections.Chapter) {
        toast.error("Please select a Chapter");
        hasError = true;
      }

      if (!selections.Topic) {
        toast.error("Please select a Topic");
        hasError = true;
      }

      if (!selections["Question Type"]) {
        toast.error("Please select a Question Type");
        hasError = true;
      }

      if (!easynumQuestions && !mediumnumQuestions && !hardnumQuestions) {
        toast.error("Please enter the number of questions for at least one difficulty level");
        hasError = true;
      }

      if (hasError) return; // stop if any field is missing

      setIsLoading(true);




      const selectedTopicIds = selections.Topic.map(topicId => {
        const topic = topics.find(t => t.id === topicId); // Find topic object by id
        return topic ? topic.topic_id : null; // Map to `topic_id`
      }).filter(topicId => topicId !== null);



      const payload = {
        book_id: selections.Book,
        chapter_id: selections.Chapter,
        topic_id: selectedTopicIds,
        question_type: selections["Question Type"],
        no_of_questions_easy: parseInt(easynumQuestions),
        no_of_questions_medium: parseInt(mediumnumQuestions),
        no_of_questions_hard: parseInt(hardnumQuestions),
      };

      const response = await axios.post(`${baseUrl}/create-question`, payload, {
        withCredentials: true,
      });

      if (response.data && response.data.data) {
        setGeneratedQuestions(response.data.data);
        setShowModal(true);
      } else {
        toast.error("No questions were generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again later.");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };




  const generateQuestions = async () => {
    await handleGenerateQuestions();
  };

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  const handleCheckboxChange = (type, value) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (newSelections[type].includes(value)) {
        newSelections[type] = newSelections[type].filter((item) => item !== value);
      } else {
        newSelections[type] = [...newSelections[type], value];
      }
      return newSelections;
    });
  };

  const closeModal = (modalType) => {
    if (modalType === "chapter") {
      setIsChapterModalOpen(false);
    } else if (modalType === "topic") {
      setIsTopicModalOpen(false);
    }
  };

  return (

    <div className="min-h-screen flex flex-col items-center text-white px-4 py-6">

      <Toaster />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 text-center rounded-xl shadow-xl dark:shadow-green-600 bg-white/0 dark:shadow-md p-6 w-full max-w-5xl mx-auto"
      >
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-lime-400 bg-clip-text text-transparent drop-shadow-md">
          QGENIE <span className="font-light">Questions Generator</span>
        </h1>
      </motion.header>




      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-8 shadow-lg">
      <div>
        <label className="block text-lg font-semibold text-gray-800 mb-2">Book</label>
        <div className="relative">
          <select
            value={selections.Book}
            onChange={(e) =>
              setSelections((prev) => ({ ...prev, Book: e.target.value }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Book</option>
            {books.map((book) => (
              <option key={book.book_id} value={book.book_id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chapter Modal Dropdown */}
      <div>
  <label className="block text-lg font-semibold text-gray-800 mb-2">Chapter</label>
  <button
    onClick={() => setIsChapterModalOpen(true)}
    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {selections.Chapter.length > 0
      ? `Selected: ${chapters
          .filter((chapter) => selections.Chapter.includes(chapter.chapter_id))
          .map((chapter) => chapter.chapter_name)
          .join(", ")}`
      : "Select Chapters"}
  </button>

  {isChapterModalOpen && (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => closeModal("chapter")}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Select Chapters</h3>
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <div key={chapter.chapter_id} className="flex items-center">
              <input
                type="checkbox"
                id={`chapter-${chapter.chapter_id}`}
                value={chapter.chapter_id}
                checked={selections.Chapter.includes(chapter.chapter_id)}
                onChange={() => handleCheckboxChange("Chapter", chapter.chapter_id)}
                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor={`chapter-${chapter.chapter_id}`}
                className="ml-2 text-gray-800"
              >
                {chapter.chapter_name ?? "no chapter name found"}
              </label>
            </div>
          ))}

{chapters.length === 0 && (
  <p className="text-gray-500 mt-2">No chapters found </p>
)}

        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => closeModal("chapter")}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )}
</div>

<div>
  <label className="block text-lg font-semibold text-gray-800 mb-2">Topic</label>
  <button
    onClick={() => setIsTopicModalOpen(true)}
    className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    {selections.Topic.length > 0
      ? `Selected: ${topics
          .filter((topic) => selections.Topic.includes(topic.id))
          .map((topic) => topic.topic_name)
          .join(", ")}`
      : "Select Topics"}
  </button>

  {isTopicModalOpen && (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
      onClick={() => closeModal("topic")}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-semibold mb-4">Select Topics</h3>
        <div className="space-y-2">
          {topics.map((topic) => (
            <div key={topic.topic_id} className="flex items-center">
              <input
                type="checkbox"
                id={`topic-${topic.topic_id}`}
                value={topic.id}
                checked={selections.Topic.includes(topic.id)}
                onChange={() => handleCheckboxChange("Topic", topic.id)}
                className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label
                htmlFor={`topic-${topic.topic_id}`}
                className="ml-2 text-gray-800"
              >
                {topic.topic_name}
              </label>
            </div>
        
        
        
        ))}

{topics.length === 0 && (
  <p className="text-gray-500 mt-2">No Topics found </p>
)}

        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => closeModal("topic")}
            className="px-4 py-2 text-white bg-green-600 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )}
</div>
   




        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">Question Type</label>
          <select
            value={selections["Question Type"]}
            onChange={(e) =>
              setSelections((prev) => ({
                ...prev,
                "Question Type": e.target.value,
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none"
          >
            <option value="">Select Question Type</option>
            <option value="fill_in_the_blanks">Fill in the Blanks</option>
            <option value="match_the_following">Match the Following</option>
            <option value="logical_reasoning">Logical Reasoning</option>
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
            <option value="true_or_false">True/False</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="comprehension">Comprehension</option>
          </select>
        </div>
   




        <div className="space-y-4">

          <label className="block text-lg font-semibold text-gray-800">Difficulty</label>
          <div className="flex gap-4">

            <div
              className={`p-3 rounded-lg border-2 ${difficulty === 'Easy' ? 'border-green-600' : 'border-gray-300'} bg-green-100 cursor-pointer w-32`}
              onClick={() => setDifficulty('Easy')}
            >
              <div className="flex items-center gap-2">
                <Gauge className="text-green-600 text-lg" />
                <span className="text-lg font-semibold text-green-800">Easy</span>
              </div>
              <input
                type="number"
                value={easynumQuestions}

                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 1 && value <= 5) {
                    seteasyNumQuestions(value);
                  }
                }}
                className="mt-2 w-full p-2 border-none focus:outline-none text-gray-800 bg-transparent"
                placeholder="No. of Questions"
              />
            </div>


            <div
              className={`p-3 rounded-lg border-2 ${difficulty === 'Medium' ? 'border-yellow-600' : 'border-gray-300'} bg-yellow-100 cursor-pointer w-32`}
              onClick={() => setDifficulty('Medium')}
            >
              <div className="flex items-center gap-2">
                <Gauge className="text-yellow-600 text-lg" />
                <span className="text-lg font-semibold text-yellow-800">Medium</span>
              </div>
              <input
                type="number"
                value={mediumnumQuestions}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 1 && value <= 5) {
                    setmediumNumQuestions(value);
                  }
                }}
                className="mt-2 w-full p-2 border-none focus:outline-none text-gray-800 bg-transparent"
                placeholder="No. of Questions"
              />
            </div>
            <div
              className={`p-3 rounded-lg border-2 ${difficulty === 'Hard' ? 'border-red-600' : 'border-gray-300'} bg-red-100 cursor-pointer w-32`}
              onClick={() => setDifficulty('Hard')}
            >
              <div className="flex items-center gap-2">
                <Gauge className="text-red-600 text-lg" />
                <span className="text-lg font-semibold text-red-800">Hard</span>
              </div>
              <input
                type="number"
                value={hardnumQuestions}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (value >= 1 && value <= 5) {
                    sethardNumQuestions(value);
                  }
                }}
                className="mt-2 w-full p-2 border-none focus:outline-none text-gray-800 bg-transparent"
                placeholder="No. of Questions"
              />
            </div>
          </div>
        </div>

      </div>



      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 border-4 border-t-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-400 font-medium">Please wait a moment...</span>
            </div>
          </div>) : (
          <button
            onClick={generateQuestions}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white text-lg font-semibold rounded-xl shadow-md hover:scale-105 transition"
          >
            ✨ Generate Questions
          </button>)}
      </div>


      <div className="mt-10 w-full max-w-6xl grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {generatedQuestions.map((q) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white p-5 rounded-xl shadow-lg border border-green-200 hover:shadow-2xl transition"
            >
              <h3 className="font-semibold text-lg text-green-600 mb-2">
                Question
              </h3>
              <p className="text-gray-700">{q.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl p-8 relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              >
                <X />
              </button>
              <h2 className="text-xl font-bold text-green-600 mb-4">
                🎉 Questions Generated
              </h2>
              <p className="text-gray-600">
                Your questions have been generated and listed below.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>


  );
}



// {dropdownItems.map(({ label, options }) => (
//   <div key={label} className="space-y-4">
//     <label className="block text-lg font-semibold text-gray-800">{label}</label>
//     <div className="flex flex-wrap items-center gap-3 border-b-2 pb-2 border-gray-300">
//       <span className="text-green-600 text-xl">
//         {label === "Book" && "📖"}
//         {label === "Chapter" && "📚"}
//         {label === "Topic" && "📑"}
//         {label === "Question Type" && "❓"}
//       </span>

//       {/* Show selected Chapters as chips */}
//       {(label === "Chapter" || label === "Topic") && selections[label].length > 0 && (
//         <div className="flex flex-wrap gap-2">
//          {selections[label].map((val) => {
// const selectedOption = options.find((opt) => opt.value === val);
// console.log("Selected Option:", selectedOption);
// console.log("Value:", val);
// return (
// <span
// key={val}
// className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center gap-2"
// >
// {selectedOption?.label || val}
// <button
// className="text-red-500 hover:text-red-700 ml-1 text-sm"
// onClick={() => handleChipRemove(label, val)}
// >
// ✕
// </button>
// </span>
// );
// })}
//         </div>
//       )}


//       {/* Dropdown input */}
//       <select
//         className="w-full border-none focus:outline-none text-gray-800 text-lg bg-transparent"
//         value={label === "Chapter" ? "" : selections[label] || ""}
//         onChange={(e) => handleSelection(label, e.target.value)}
//       >
//         <option value="">Select {label}</option>
//         {options.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   </div>
// ))}





// const handleRemoveSelection = (key, value) => {
//   setSelections((prev) => {
//     const newSelections = { ...prev };
//     newSelections[key] = newSelections[key].filter((item) => item !== value);
//     return newSelections;
//   });
// };

// const handleChapterChange = (e) => {
//   const selectedChapters = Array.from(e.target.selectedOptions, (opt) => opt.value);
//   setSelections((prev) => ({
//     ...prev,
//     Chapter: selectedChapters,
//   }));
// };

// const handleTopicChange = (e) => {
//   const selectedTopics = Array.from(e.target.selectedOptions, (opt) => opt.value);
//   setSelections((prev) => ({
//     ...prev,
//     Topic: selectedTopics,
//   }));
// };