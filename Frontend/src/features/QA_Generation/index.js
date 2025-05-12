import React, { useState, useEffect } from "react";
import axios from "axios";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import htmlDocx from "html-docx-js/dist/html-docx";
import { FiTrash2, FiSave } from "react-icons/fi"; // Import React Icons
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
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
  const [difficulty, setDifficulty] = useState("Easy");
  const [easynumQuestions, seteasyNumQuestions] = useState("1");
  const [mediumnumQuestions, setmediumNumQuestions] = useState("1");
  const [hardnumQuestions, sethardNumQuestions] = useState("1");
  const [showModal, setShowModal] = useState(false);
  const [generatedQuestionsID, setGeneratedQuestionsID] = useState([]);
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

  const [fetchedQuestions, setFetchedQuestions] = useState([]);


  //get multiple questions by question IDs
  const fetchMultipleQuestionsById = async (questionIds) => {
    try {
      const response = await axios.post(
        `${baseUrl}/get-multiple-questions`,
        { question_id: questionIds },
        { withCredentials: true }
      );

      if (response.status === 200) {
        return response.data.data; // Return the fetched questions
      } else {
        toast.error("Failed to fetch questions. Please try again.");
        return [];
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("An error occurred while fetching questions.");
      return [];
    }
  };

  const handleEdit = (id, field, value) => {
    setFetchedQuestions((prev) =>
      prev.map((q) => (q.question_id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleUpdate = async (question) => {
    await updateQuestionById(question.question_id, {
      answer: question.answer,
      // add more fields if needed
    });
  };

  const handleDelete = async (id) => {
    await deleteQuestionById(id);
    setFetchedQuestions((prev) => prev.filter((q) => q.question_id !== id));
  };

  // Update a question by its ID
  const updateQuestionById = async (id, updatedQuestion) => {
    try {
      const response = await axios.put(
        `${baseUrl}/update-question-by-currentuser`,
        { ...updatedQuestion, id },
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Question updated successfully!");
      } else {
        toast.error("Failed to update the question. Please try again.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("An error occurred while updating the question.");
    }
  };

  // Delete a question by its ID
  const deleteQuestionById = async (id) => {
    try {
      const response = await axios.post(
        `${baseUrl}/delete-question-by-currentuser`,
        { id }, // Only data here
        { withCredentials: true }
      );

      if (response.status === 200) {
        toast.success("Question deleted successfully!");
      } else {
        toast.error("Failed to delete the question. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting the question.");
    }
  };

  const handleGenerateQuestions = async () => {
    try {
      let hasError = false;

      if (!selections.Book) {
        toast.error("Please select a Book");
        return;
      }

      if (!selections.Chapter) {
        toast.error("Please select a Chapter");
        return;
      }

      if (!selections.Topic) {
        toast.error("Please select a Topic");
        return;
      }

      if (!selections["Question Type"]) {
        toast.error("Please select a Question Type");
        return;
      }

      if (!easynumQuestions && !mediumnumQuestions && !hardnumQuestions) {
        toast.error(
          "Please enter the number of questions for at least one difficulty level"
        );
        return;
      }

      if (hasError) return; // stop if any field is missing

      setIsLoading(true);

      const selectedTopicIds = selections.Topic.map((topicId) => {
        const topic = topics.find((t) => t.id === topicId); // Find topic object by id
        return topic ? topic.topic_id : null; // Map to `topic_id`
      }).filter((topicId) => topicId !== null);

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
        toast.success("Question Generated Successfully");
        const questionIds = response.data.data.map(
          (question) => question.question_id
        ); // This is an array of question_id
        setGeneratedQuestionsID(questionIds);

        // 👇 Fetch full question data
        const questions = await fetchMultipleQuestionsById(questionIds);
        setFetchedQuestions(questions);

        setShowModal(true);
      } else {
        toast.error("No questions were generated. Please try again.");
      }
    } catch (error) {
      const response = error.response;
      if (401 === response.status) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
      console.error("Error generating questions:", error);
      toast.error("Failed to generate questions. Please try again later.");
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  const generateQuestions = async () => {
    await handleGenerateQuestions();
  };

  // const testing = async () => {
  //   const questionIds = [
  //     {
  //       question_ispublic: false,
  //       question_id: 86,
  //       book_id: 6,
  //       chapter_id: 1,
  //       topic_id: 3,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The Automated Question Bank Generation System uses Large Language Models (LLMs) and Generative AI.",
  //       difficulty_level: "easy",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.915Z",
  //       updated_at: "2025-05-04T05:58:02.915Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 87,
  //       book_id: 6,
  //       chapter_id: 2,
  //       topic_id: 4,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "Existing digital platforms offer question bank repositories with real-time adaptability.",
  //       difficulty_level: "easy",
  //       answer: "False",
  //       created_at: "2025-05-04T05:58:02.934Z",
  //       updated_at: "2025-05-04T05:58:02.934Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 88,
  //       book_id: 6,
  //       chapter_id: 1,
  //       topic_id: 3,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The proposed approach includes automating metadata extraction like subject and chapter count.",
  //       difficulty_level: "easy",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.943Z",
  //       updated_at: "2025-05-04T05:58:02.943Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 89,
  //       book_id: 6,
  //       chapter_id: 2,
  //       topic_id: 4,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system architecture of the Automated Question Bank Generation System involves AI integration using Gemini and OpenAI ChatGPT API.",
  //       difficulty_level: "medium",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.950Z",
  //       updated_at: "2025-05-04T05:58:02.950Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 90,
  //       book_id: 6,
  //       chapter_id: 1,
  //       topic_id: 3,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system's advantages include manual question paper creation being efficient and requiring less effort.",
  //       difficulty_level: "medium",
  //       answer: "False",
  //       created_at: "2025-05-04T05:58:02.957Z",
  //       updated_at: "2025-05-04T05:58:02.957Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 91,
  //       book_id: 6,
  //       chapter_id: 2,
  //       topic_id: 4,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system's proposed future enhancements involve bias detection and ethical standards.",
  //       difficulty_level: "medium",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.962Z",
  //       updated_at: "2025-05-04T05:58:02.962Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 92,
  //       book_id: 6,
  //       chapter_id: 1,
  //       topic_id: 3,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system's proposed future enhancements include integration with multimedia question generation for a more engaging learning experience.",
  //       difficulty_level: "medium",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.972Z",
  //       updated_at: "2025-05-04T05:58:02.972Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 93,
  //       book_id: 6,
  //       chapter_id: 2,
  //       topic_id: 4,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system's proposed future enhancements do not include real-time collaboration tools for educators.",
  //       difficulty_level: "medium",
  //       answer: "False",
  //       created_at: "2025-05-04T05:58:02.976Z",
  //       updated_at: "2025-05-04T05:58:02.976Z",
  //       options: ["True", "False"],
  //     },
  //     {
  //       question_ispublic: false,
  //       question_id: 94,
  //       book_id: 6,
  //       chapter_id: 1,
  //       topic_id: 3,
  //       user_id: 3,
  //       question_type: "true_or_false",
  //       no_of_questions_easy: 3,
  //       no_of_questions_medium: 5,
  //       no_of_questions_hard: 1,
  //       all_questions:
  //         "The system's proposed future enhancements could involve multi-language support for global accessibility.",
  //       difficulty_level: "hard",
  //       answer: "True",
  //       created_at: "2025-05-04T05:58:02.979Z",
  //       updated_at: "2025-05-04T05:58:02.979Z",
  //       options: ["True", "False"],
  //     },
  //   ].map((question) => question.question_id); // This is an array of question_id
  //   setGeneratedQuestionsID(questionIds);

  //   // 👇 Fetch full question data
  //   const questions = await fetchMultipleQuestionsById(questionIds);
  //   setFetchedQuestions(questions);

  //   setShowModal(true);
  // };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/get-books-by-user-publicbooks`,
          {
            withCredentials: true,
          }
        );
        setBooks(response.data.books); // Accessing the books array from the response
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      setChapters([]); // if (!selections.Book) return;

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
        const response = await axios.get(`${baseUrl}/get-multiple-topics`, {
          params: {
            book_id: selections.Book,
            chapter_ids: selections.Chapter.join(","),
          },
          withCredentials: true,
        });

        setTopics(response.data.topics || []);
        setSelections((prev) => ({ ...prev, Topic: "" }));
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selections.Chapter]);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  const handleCheckboxChange = (type, value) => {
    setSelections((prev) => {
      const newSelections = { ...prev };
      if (newSelections[type].includes(value)) {
        newSelections[type] = newSelections[type].filter(
          (item) => item !== value
        );
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

  //provide export for generated questions in pdf format


  
  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    question: { fontSize: 12, marginBottom: 5 },
    option: { fontSize: 10, marginLeft: 10 },
    answer: { fontSize: 10, fontStyle: 'italic', color: 'green' }
  });
  
  const MyPDF = ({ questions }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Generated Questions</Text>
        <Text style={{ fontSize: 12, marginBottom: 10 }}>
          Question Type: {fetchedQuestions.length > 0
            ? fetchedQuestions[0].question_type.replace(/_/g, " ")
            : "No Question Type Found"}
        </Text>
        {questions.map((q, i) => (
          <View key={i} style={styles.section}>
            <Text style={styles.question}>
              Difficulty Level: {q.difficulty_level}
            </Text>
            <Text style={styles.question}>
              {i + 1}. {q.all_questions}
            </Text>
            {Array.isArray(q.options) && q.options.length > 0 && (
              q.options.map((opt, idx) => (
                <Text key={idx} style={styles.option}>
                  {String.fromCharCode(65 + idx)}) {opt}
                </Text>
              ))
            )}
            <Text style={styles.answer}>Answer: {q.answer}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
  const exportToWord = () => {
    if (!fetchedQuestions || fetchedQuestions.length === 0) {
      console.error("No questions to export.");
      return;
    }
  
    const questionHtml = fetchedQuestions.map((q, index) => {
      const optionsHtml = Array.isArray(q.options)
        ? q.options.map((opt, i) => `<li>${String.fromCharCode(65 + i)}) ${opt}</li>`).join("")
        : "";
  
      return `
        <div style="margin-bottom: 20px;">
          <p><strong>Difficulty Level:</strong> ${q.difficulty_level}</p>
          <h3>Q${index + 1}. ${q.all_questions}</h3>
          
          <ul style="margin-left: 20px;">${optionsHtml}</ul>
          <p><strong>Answer:</strong> ${q.answer}</p>
            
        </div>
      `;
    }).join("");
  
    const content = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Questions Export</title>
        </head>
        <body>
          <h1>Generated Questions</h1>
          ${questionHtml}
        </body>
      </html>
    `;
  
    const blob = htmlDocx.asBlob(content);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "questions.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
// provide export for generated questions in word format
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
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Book
          </label>
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
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Chapter
          </label>
          <button
            onClick={() => setIsChapterModalOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white text-gray-800 shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            {selections.Chapter.length > 0 ? (
              <div className="text-sm text-gray-800 font-medium leading-snug">
                Selected:{" "}
                <span className="text-green-500 text-xs rounded-full">
                  {chapters
                    .filter((chapter) =>
                      selections.Chapter.includes(chapter.chapter_id)
                    )
                    .map((chapter) => chapter.chapter_name)
                    .join(", ")}
                </span>
              </div>
            ) : (
              <span className="text-gray-500">Select Chapters</span>
            )}
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
                <div className="space-y-2 overflow-y-auto max-h-72 pr-2">
                  {chapters.map((chapter) => (
                    <div key={chapter.chapter_id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`chapter-${chapter.chapter_id}`}
                        value={chapter.chapter_id}
                        placeholder="Chapter slection"
                        checked={selections.Chapter.includes(
                          chapter.chapter_id
                        )}
                        onChange={() =>
                          handleCheckboxChange("Chapter", chapter.chapter_id)
                        }
                        className="h-5 w-5  border-gray-300 rounded focus:ring-blue-500"
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
                    <p className="text-gray-500 mt-2">😓No chapters found </p>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => closeModal("chapter")}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="">
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Topic
          </label>
          <button
            onClick={() => setIsTopicModalOpen(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white text-gray-700 shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            {selections.Topic.length > 0 ? (
              <div className="text-sm text-gray-800 font-medium leading-snug">
                Selected:{" "}
                <span className="text-xs rounded-full text-green-500">
                  {topics
                    .filter((topic) => selections.Topic.includes(topic.id))
                    .map((topic) => topic.topic_name)
                    .join(", ")}
                </span>
              </div>
            ) : (
              <span className="text-gray-500">Select Topics</span>
            )}
          </button>

          {/* Topic Modal */}
          {isTopicModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              onClick={() => closeModal("topic")}
            >
              <div
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-h-72 overflow-y-auto space-y-4 pr-2">
                  {chapters.map((chapter) => {
                    const chapterTopics = topics.filter(
                      (topic) => topic.chapter_id === chapter.chapter_id
                    );
                    if (chapterTopics.length === 0) return null;
                    return (
                      <div key={chapter.chapter_id}>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          {chapter.chapter_name || "Unnamed Chapter"}
                        </h3>
                        <div className="space-y-2 pl-3">
                          {chapterTopics.map((topic) => (
                            <div
                              key={topic.topic_id}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                id={`topic-${topic.topic_id}`}
                                value={topic.id}
                                checked={selections.Topic.includes(topic.id)}
                                onChange={() =>
                                  handleCheckboxChange("Topic", topic.id)
                                }
                                className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label
                                htmlFor={`topic-${topic.topic_id}`}
                                className="ml-3 text-gray-700"
                              >
                                {topic.topic_name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {topics.length === 0 && (
                    <p className="text-gray-500 text-sm">😓No topics found</p>
                  )}
                </div>
                <div className="mt-6 text-right">
                  <button
                    onClick={() => closeModal("topic")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-800 mb-2">
            Question Type
          </label>
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
            <option value="multiple_choice">Multiple Choice</option>
            <option value="fill_in_the_blanks">Fill in the Blanks</option>
            {/* <option value="match_the_following">Match the Following</option> */}
            {/* <option value="logical_reasoning">Logical Reasoning</option> */}
            <option value="short_answer">Short Answer</option>
            <option value="long_answer">Long Answer</option>
            <option value="true_or_false">True/False</option>
        
          </select>
        </div>

        <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-800">
            Difficulty
          </label>
          <div className="flex gap-4">
            <div
              className={`p-3 rounded-lg border-2 ${
                difficulty === "Easy" ? "border-green-600" : "border-gray-300"
              } bg-green-100 cursor-pointer w-32`}
              onClick={() => setDifficulty("Easy")}
            >
              <div className="flex items-center gap-2">
                <Gauge className="text-green-600 text-lg" />
                <span className="text-lg font-semibold text-green-800">
                  Easy
                </span>
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
              className={`p-3 rounded-lg border-2 ${
                difficulty === "Medium"
                  ? "border-yellow-600"
                  : "border-gray-300"
              } bg-yellow-100 cursor-pointer w-32`}
              onClick={() => setDifficulty("Medium")}
            >
              <div className="flex items-center gap-2">
                <Gauge className="text-yellow-600 text-lg" />
                <span className="text-lg font-semibold text-yellow-800">
                  Medium
                </span>
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
              className={`p-3 rounded-lg border-2 ${
                difficulty === "Hard" ? "border-red-600" : "border-gray-300"
              } bg-red-100 cursor-pointer w-32`}
              onClick={() => setDifficulty("Hard")}
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
              <span className="text-gray-400 font-medium">
                Please wait a moment...
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={generateQuestions}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white text-lg font-semibold rounded-xl shadow-md hover:scale-105 transition"
          >
            ✨ Generate Questions
          </button>
        )}
      </div>
      <AnimatePresence>
        {showModal && (
          <div className="bg-white">            
          <div  className="fixed inset-0 z-50 bg-black  bg-opacity-60 flex items-center justify-center px-4">
          
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}  
              className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-2xl p-8 overflow-y-auto max-h-[90vh] transition-transform transform"
            >
           <PDFDownloadLink document={<MyPDF questions={fetchedQuestions} />} fileName="questions.pdf">
          {({ loading }) => (
            <button className="bg-red-500 text-white px-4 py-2 mr-2 rounded">{loading ? 'Loading...' : <FaRegFilePdf />}</button>
          )}
        </PDFDownloadLink>
             <button
                       onClick={exportToWord}
                       className="bg-blue-500 text-white px-4 py-2 rounded"
                     >
                       <FaRegFileWord />
                     </button>
           <div id="question-export">
              <h1 className="text-center text-2xl font-medium text-black dark:text-white">
                {" "}
                Generated Questions
              </h1>
              <h1 className="text-xl mt-2 font-semibold text-gray-400 mb-6">
                Question Type:{" "}
                <span className="text-lime-400">
                  {fetchedQuestions.length > 0
                    ? fetchedQuestions[0].question_type.replace(/_/g, " ")
                    : "No Question Type Found"}
                </span>
              </h1>

              {fetchedQuestions.map((question, index) => (
                <div
                  key={question.question_id}
                  className="mb-8 border p-4 rounded-lg shadow-md bg-gray-100 "
                >
                  <div className="flex justify-end items-center">
                    <button
                      onClick={() => handleDelete(question.question_id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>

                  <div className="">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty Level:
                      <span className="text-lime-500">
                      {" " + question.difficulty_level}
                      </span>
                    </label>

                    <span className="block text-sm font-medium text-gray-700  ">
                      Question:
                    </span>
                    <div className="relative mb-4">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 font-medium">
                        {index + 1}.
                      </span>
                      <div className="pl-6">
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={question.all_questions}
                            onChange={(e) =>
                              handleEdit(
                                question.question_id,
                                "all_questions",
                                e.target.value
                              )
                            }
                            className="w-full h-10  border-b-2 border-gray-300 bg-gray-100 text-gray-700 outline-none px-1   transition-all duration-300 focus:border-lime-500 resize-none"
                          />
                          <span className="absolute left-0 bottom-[6px] w-0 h-0.5 bg-lime-500 transition-all duration-300 origin-left group-focus-within:w-full"></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(question.options) &&
                    question.options.length > 0 && (
                      <div className="mb-6 bg-yellow-200/50 p-5 rounded-xl">
                        <span className="block text-sm font-medium text-gray-700 mb-2">
                          Options:
                        </span>
                        {question.options.map((option, idx) => (
                          <div key={idx} className="flex items-center mb-2">
                            <span className="text-gray-700 font-medium mr-2">
                              {String.fromCharCode(65 + idx)})
                            </span>
                            <input
                              type="text"
                              className="w-full h-10 border-b-2 border-gray-300 bg-yellow-100/50 text-gray-700 outline-none px-1 transition-all duration-300 focus:border-lime-500 resize-none"
                              value={option}
                              onChange={(e) =>
                                handleEdit(question.question_id, "options", [
                                  ...question.options.slice(0, idx),
                                  e.target.value,
                                  ...question.options.slice(idx + 1),
                                ])
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}

                  <div className="mb-6">
                    <span className="block text-sm font-medium text-gray-700  mb-2">
                      Answer:
                    </span>
                    <textarea
                      type="text"
                      className="w-full border border-gray-300 rounded-lg dark:bg-white p-4 mb-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-500"
                      value={question.answer}
                      onChange={(e) =>
                        handleEdit(
                          question.question_id,
                          "answer",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdate(question)}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-green-600 inline-flex transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ))}

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="font-medium bg-green-500 hover:bg-lime-500 text-white px-5 py-2 rounded-lg transition-colors duration-300 ease-in-out"
              >
                Close
              </button>
              </div>
            </motion.div>
          </div>
          
          </div>

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
