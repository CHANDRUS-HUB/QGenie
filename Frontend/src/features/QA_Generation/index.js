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
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selections, setSelections] = useState({
    Book: "",
    Chapter: "",
    Topic: "",
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
      setTopics([]) //
      // if (!selections.Book || !selections.Chapter) return;

      try {
        const response = await axios.get(
          `${baseUrl}/get-topics/${selections.Book}/${selections.Chapter}`,
          { withCredentials: true }
        );
        setTopics(response.data.topics); // Accessing the topics array from the response
        setSelections((prev) => ({ ...prev, Topic: "" }));
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selections.Chapter]);

//question generation 



  const dropdownItems = [
    {
      label: "Book",
      icon: Book,
      options: books.map((book) => ({
        value: book.book_id,
        label: book.title,
      })),
    },
    {
      label: "Chapter",
      icon: ListOrdered,
      options: chapters.map((ch) => ({
        value: ch.chapter_id,
        label: ch.chapter_name,
      })),
    },
    {
      label: "Topic",
      icon: FileText,
      options: topics.map((tp) => ({
        value: tp.topic_id,
        label: tp.topic_name,
      })),
    },
    {
      label: "Question Type",
      icon: LayoutList,
      options: [
        { value: "fill_in_the_blanks", label: "Fill in the Blanks" },
        { value: "match_the_following", label: "Match the Following" },
        { value: "logical_reasoning", label: "Logical Reasoning" },
        { value: "short_answer", label: "Short Answer" },
        { value: "long_answer", label: "Long Answer" },
        { value: "true_or_false", label: "True/False" },
        { value: "multiple_choice", label: "Multiple Choice" },
        { value: "comprehension", label: "Comprehension" },
      ],
    },
  ];

  const handleSelection = (label, value) => {
    setSelections({ ...selections, [label]: value });
  };

  
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
  
      const payload = {
        book_id: selections.Book,
        chapter_id: selections.Chapter,
        topic_id: selections.Topic,
        user_id: "current_user_id", // Replace with actual user ID
        question_type: selections["Question Type"],
        no_of_questions_by_difficulty: {
          easy: difficulty === "Easy" ? parseInt(easynumQuestions) : 0,
          medium: difficulty === "Medium" ? parseInt(mediumnumQuestions) : 0,
          hard: difficulty === "Hard" ? parseInt(hardnumQuestions) : 0,
        },
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
    }
  };

  const generateQuestions = async () => {
    await handleGenerateQuestions();
  };

  return (
    
      <div className="min-h-screen flex flex-col items-center text-white px-4 py-6">
        <Toaster />
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center rounded-xl shadow-xl bg-white/50 p-6 w-full"
        >
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-500 to-lime-400 bg-clip-text text-transparent drop-shadow-md">
            QGENIE <span className="font-light">Questions Generator</span>
          </h1>
        </motion.header>
    
        {/* Dropdown Selections */}
        <div className="w-full  grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-xl p-8 shadow-lg">
        {dropdownItems.map(({ label, options }) => (
  <div key={label} className="space-y-4">
    <label className="block text-lg font-semibold text-gray-800">{label}</label>
    <div className="flex items-center gap-3 border-b-2 pb-2 border-gray-300">
      <span className="text-green-600 text-xl">
        {label === "Book" && "📖"}
        {label === "Chapter" && "📚"}
        {label === "Topic" && "📑"}
        {label === "Question Type" && "❓"}
      </span>
      <select
        className="w-full border-none focus:outline-none text-gray-800 text-lg bg-transparent"
        value={selections[label]}
        onChange={(e) => handleSelection(label, e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  </div>
))}


  {/* Difficulty */}
  <div className="space-y-4">
  {/* Difficulty */}
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

    { /* Medium Card */ }
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

      
        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={generateQuestions}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white text-lg font-semibold rounded-xl shadow-md hover:scale-105 transition"
          >
           ✨ Generate Questions
          </button>
        </div>
    
        {/* Generated Questions */}
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
