import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import baseUrl from "../../utils/URL";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa6";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Document, Paragraph, TextRun, Packer, AlignmentType, TabStopType, BorderStyle } from 'docx';
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";

const Generated_Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [bookFilter, setBookFilter] = useState("");


  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
const params = useParams();
  const userId = params.id;
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/get-question-by-userid/${userId}`,
          { withCredentials: true }
        );
        setQuestions(
          Array.isArray(response.data?.data) ? response.data.data : []
        );
      } catch (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to fetch questions");
        setQuestions([]);
        if (error.response?.status === 401) {
                  toast.error("Session expired. Please login again.");
                  setTimeout(() => {
                    window.location.href = "/login";
                  }, 2000);}
       } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Modify the handleEdit function to open modal
  const handleEdit = (question) => {
    setCurrentQuestion(question);
    setEditForm({
      all_questions: question.all_questions,
      difficulty_level: question.difficulty_level,
      question_type: question.question_type,
      answer: question.answer,
      options: question.options ? [...question.options] : [],
      question_ispublic: question.question_ispublic,
    });
    setIsEditModalOpen(true);
  };

  // Modify the handleSave function
  const handleSave = async () => {
    if (!currentQuestion) return;
    
    try {
      const updatedData = { ...editForm, id: currentQuestion.question_id };

      await axios.put(
        `${baseUrl}/update-question-by-currentuser`,
        updatedData,
        { withCredentials: true }
      );

      setQuestions(
        questions.map((q) =>
          q.question_id === currentQuestion.question_id ? { ...q, ...editForm } : q
        )
      );
      setIsEditModalOpen(false);
      toast.success("Question updated successfully");
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.post(
        `${baseUrl}/delete-question-by-currentuser`,
        { id: questionId },
        { withCredentials: true }
      );
      setQuestions(questions.filter((q) => q.question_id !== questionId));
      // table.resetRowSelection(); // Reset row selection
      table.getColumn("all_questions")?.setFilterValue(""); // Clear question filter
      table.getColumn("difficulty_level")?.setFilterValue(""); // Clear difficulty filter
      table.getColumn("question_type")?.setFilterValue(""); // Clear type filter
      toast.success("Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized - No access provided");
      } else {
        toast.error("Failed to delete question");
      }
    } finally {
      setQuestionToDelete(null);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setEditForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? value : opt)),
    }));
  };

  // const handleSave = async (questionId) => {
  //   try {
  //     const updatedData = { ...editForm, id: questionId }; // ✅ Include question_id

  //     await axios.put(
  //       `${baseUrl}/update-question-by-currentuser`,
  //       updatedData,
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     setQuestions(
  //       questions.map((q) =>
  //         q.question_id === questionId ? { ...q, ...editForm } : q
  //       )
  //     );
  //     setEditingId(null);
  //     toast.success("Question updated successfully");
  //   } catch (error) {
  //     console.error("Error updating question:", error);
  //     toast.error("Failed to update question");
  //   }
  // };



  const exportToPDF = () => {
    const filteredQuestions = table.getFilteredRowModel().rows.map(row => row.original);
  
    if (filteredQuestions.length === 0) {
      toast.error("No filtered questions to export");
      return;
    }
  
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const rightAlign = pageWidth - margin;
  
    // Set default font
    doc.setFont("helvetica", "normal");
  
    // Title with styling
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.text("Generated Questions Report", margin, 15);
    
    // Metadata section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 25);
    doc.text(`Total Questions: ${filteredQuestions.length}`, rightAlign, 25, { align: "right" });
  
    // Question Type header
    if (filteredQuestions.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      doc.text(`Question Type: ${filteredQuestions[0].question_type.replace(/_/g, " ")}`, margin, 35);
    }
  
    let yPosition = 45;
  
    filteredQuestions.forEach((q, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
        // Add header on new pages
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, rightAlign, 10, { align: "right" });
        yPosition = 20;
      }
  
      // Question number and text
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}.`, margin, yPosition);
      const questionLines = doc.splitTextToSize(q.all_questions, pageWidth - margin * 2 - 10);
doc.text(questionLines, margin + 10, yPosition);
yPosition += questionLines.length * 6;  // Adjust spacing based on line count
      
      // Difficulty level (right aligned)
      const difficultyText = `Difficulty: ${q.difficulty_level}`;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "italic");
      doc.text(difficultyText, rightAlign, yPosition, { align: "right" });
      
      yPosition += 8;
  
      // Options (if multiple choice)
      if (q.question_type === "multiple_choice" && q.options?.length) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.setFont("helvetica", "normal");
        doc.text("Options:", margin + 5, yPosition);
        yPosition += 6;
        
        q.options.forEach((opt, optIndex) => {
          const optionText = `${String.fromCharCode(65 + optIndex)}) ${opt}`;
          const optionLines = doc.splitTextToSize(optionText, pageWidth - margin * 2 - 15);
          doc.text(optionLines, margin + 15, yPosition);
          yPosition += optionLines.length * 6;
        });
        
      }
  
      // Answer
      doc.setFontSize(11);
      const answerText = "Answer: ";
      const answerLines = doc.splitTextToSize(q.answer, pageWidth - margin * 2 - doc.getTextWidth(answerText));
      
      // Render "Answer:" in green
      doc.setTextColor(0, 100, 0); // Dark green
      doc.setFont("helvetica", "bold");
      doc.text(answerText, margin, yPosition);

      // Render the actual answer in black
      doc.setTextColor(0, 0, 0); // Black
      doc.setFont("helvetica", "normal");
      doc.text(answerLines, margin + doc.getTextWidth(answerText), yPosition);

      yPosition += answerLines.length * 6;

  
  
      // Separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, rightAlign, yPosition);
      yPosition += 12;
    });
  
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by QGenie", margin, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, rightAlign, doc.internal.pageSize.getHeight() - 10, { align: "right" });
  
    doc.save("Generated_Questions.pdf");
  };
  const exportToWord = async () => {
    const filteredQuestions = table.getFilteredRowModel().rows.map(row => row.original);
  
    if (filteredQuestions.length === 0) {
      toast.error("No filtered questions to export");
      return;
    }
  
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title with styling similar to PDF
            new Paragraph({
              children: [
                new TextRun({
                  text: "Generated Questions Report",
                  bold: true,
                  size: 32, // Increased font size
                  font: "Helvetica",
                }),
              ],
              spacing: { after: 200, line: 300 },
              alignment: AlignmentType.LEFT,
            }),
  
            // Metadata section
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated: ${new Date().toLocaleString()}`,
                  size: 18, // Increased font size
                  color: "646464", // #646464 similar to PDF's RGB(100,100,100)
                  font: "Helvetica",
                }),
                new TextRun({
                  text: "\t", // Tab for right alignment
                  size: 18,
                }),
                new TextRun({
                  text: `Total Questions: ${filteredQuestions.length}`,
                  size: 18,
                  color: "646464",
                  font: "Helvetica",
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9000, // Right-aligned tab stop
                },
              ],
              spacing: { after: 200 },
            }),
  
            // Question Type header
            new Paragraph({
              children: [
                new TextRun({
                  text: filteredQuestions.length > 0 
                    ? `Question Type: ${filteredQuestions[0].question_type.replace(/_/g, " ")}`
                    : "Question Type: N/A",
                  size: 20, // Increased font size
                  color: "3C3C3C", // #3C3C3C similar to PDF's RGB(60,60,60)
                  font: "Helvetica",
                }),
              ],
              spacing: { after: 300 },
            }),
  
            // Questions list
            ...filteredQuestions.flatMap((q, index) => {
              const questionElements = [];
              
              // Question number and text
              questionElements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${index + 1}. `,
                      bold: true,
                      size: 20, // Increased font size
                      font: "Helvetica",
                    }),
                    new TextRun({
                      text: q.all_questions,
                      bold: true,
                      size: 20,
                      font: "Helvetica",
                    }),
                  ],
                  indent: { left: 0 },
                  spacing: { after: 100 },
                })
              );
  
              // Difficulty level (right aligned)
              questionElements.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Difficulty: ${q.difficulty_level}`,
                      italics: true,
                      size: 18, // Increased font size
                      color: "646464", // #646464
                      font: "Helvetica",
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                  spacing: { after: 100 },
                })
              );
  
              // Options (if multiple choice)
              if (q.question_type === "multiple_choice" && q.options?.length) {
                questionElements.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Options:",
                        size: 18, // Increased font size
                        color: "505050", // #505050 similar to PDF's RGB(80,80,80)
                        font: "Helvetica",
                      }),
                    ],
                    indent: { left: 100 },
                    spacing: { after: 50 },
                  })
                );
  
                q.options.forEach((opt, optIndex) => {
                  questionElements.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${String.fromCharCode(65 + optIndex)}) ${opt}`,
                          size: 18, // Increased font size
                          color: "505050",
                          font: "Helvetica",
                        }),
                      ],
                      indent: { left: 200 },
                      spacing: { after: 50 },
                    })
                  );
                });
              }
  
              // Answer
                questionElements.push(
                new Paragraph({
                  children: [
                  new TextRun({
                    text: "Answer: ",
                    bold: true,
                    color: "006400", // Dark green (#006400)
                    size: 20, // Increased font size
                    font: "Helvetica",
                  }),
                  new TextRun({
                    text: q.answer,
                    bold: true,
                    size: 20, // Increased font size
                    font: "Helvetica",
                  }),
                  ],
                  spacing: { after: 150 },
                })
                );
  
              // Separator line (approximation using border)
              questionElements.push(
                new Paragraph({
                  borders: {
                    bottom: {
                      color: "C8C8C8", // #C8C8C8 similar to PDF's RGB(200,200,200)
                      space: 10,
                      style: BorderStyle.SINGLE,
                      size: 1,
                    },
                  },
                  spacing: { after: 200 },
                })
              );
  
              return questionElements;
            }),
  
            // Footer
            new Paragraph({
              children: [
                new TextRun({
                  text: "Generated by QGenie",
                  size: 14, // Increased font size
                  color: "969696", // #969696 similar to PDF's RGB(150,150,150)
                  font: "Helvetica",
                }),
                new TextRun({
                  text: "\t", // Tab for right alignment
                  size: 14,
                }),
                new TextRun({
                  text: `Page 1`, // Word handles pagination differently
                  size: 14,
                  color: "969696",
                  font: "Helvetica",
                }),
              ],
              tabStops: [
                {
                  type: TabStopType.RIGHT,
                  position: 9000, // Right-aligned tab stop
                },
              ],
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });
  
    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Generated_Questions_Report.docx");
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "question_id",
        header: "Sl No",
        cell: (info) => info.row.index + 1,
        enableSorting: false,
      },
      {
        accessorKey: "all_questions",
        header: "Question",
        cell: (info) => {
          const value = info.getValue();
          if (value && typeof value === 'object') {
            return value.statement || JSON.stringify(value);
          }
          return value;
        }
      },
      {
        accessorKey: "difficulty_level",
        header: "Difficulty",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${info.getValue() === "easy"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : info.getValue() === "medium"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "question_type",
        header: "Type",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "Book.title",
        header: "Book",
        cell: (info) => info.row.original.Book?.title || "N/A",
      },
      {
        accessorKey: "User.username",
        header: "Created By",
        cell: (info) => info.row.original.User?.username || "N/A",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            {editingId === row.original.question_id ? (
              <>
                <button
                  onClick={() => handleSave(row.original.question_id)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(row.original)}
                  className="px-2 py-1 text-blue-500  rounded hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-700"
                >
                  <FiEdit size={16} className="mr-1" />
                </button>
                <button
                  onClick={() => {
                    setQuestionToDelete(row.original.question_id);
                    setDeleteModalOpen(true);
                  }}
                  className="px-2 py-1 text-red-500 rounded hover:text-red-600 dark:hover:text-red-700"
                >
                  <FiTrash2 size={20} />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [editingId, editForm]
  );
  const table = useReactTable({
    data: questions,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter: bookFilter, // Add global filter for book
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setBookFilter, // Add global filter handler
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Add custom filter function for books
    globalFilterFn: (row, columnId, filterValue) => {
      const bookTitle = row.original.Book?.title || "";
      return bookTitle.toLowerCase().includes(filterValue.toLowerCase());
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <Toaster />
       {/* Back Button */}
       <div className="absolute top-20 left-1" onClick={() => window.history.back()}>
        <button
          
          className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-2 shadow-md hover:shadow-lg transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12H3m0 0l9 9m-9-9l9-9"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Total: <span className="text-lime-600 dark:text-lime-400">{questions.length}</span>
          </h1>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Filtered: <span className="text-blue-600 dark:text-blue-400">{table.getFilteredRowModel().rows.length}</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={exportToPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base transition-colors"
          >
            <FaRegFilePdf className="mr-1 sm:mr-2" />
           
          </button>
          <button
            onClick={exportToWord}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base transition-colors"
          >
            <FaRegFileWord className="mr-1 sm:mr-2" />
          
          </button>
        </div>
      </div>
      <div className="mb-4 flex items-center flex-wrap gap-2">
        <input
          placeholder="Filter questions..."
          value={table.getColumn("all_questions")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("all_questions")?.setFilterValue(e.target.value)
          }
          className="p-2 border-none outline-lime-500 rounded w-full md:w-1/2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />

        <select
          value={table.getColumn("difficulty_level")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("difficulty_level")?.setFilterValue(e.target.value)
          }
          className="p-2 border outline-none rounded flex-1 min-w-[150px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={table.getColumn("question_type")?.getFilterValue() ?? ""}
          onChange={(e) =>
            table.getColumn("question_type")?.setFilterValue(e.target.value)
          }
          className="p-2 border outline-none rounded flex-1 min-w-[150px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="fill_in_the_blanks">Fill in the Blanks</option>
          <option value="true_or_false">True/False</option>
          <option value="short_answer">Short Answer</option>
          <option value="long_answer">Long Answer</option>
        </select>

        {/* Add Book filter */}
        <select
            value={bookFilter}
            onChange={(e) => setBookFilter(e.target.value)}
            className="p-2 border outline-none rounded flex-1 min-w-[150px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
            <option value="">All Books</option>
            {Array.from(new Set(questions.map(q => q.Book?.title).filter(Boolean))).map(title => (
                <option key={title} value={title}>{title}</option>
            ))}
        </select>
        </div>

        {questions.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-300 mt-10">
                <p>No questions available.</p>
            </div>
        ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800 dark:border dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-lime-600  dark:bg-gray-700">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider dark:text-gray-300"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: " 🔼",
                                                desc: " 🔽",
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider dark:text-gray-300">
                                    Toggle
                                </th>
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                        {table.getRowModel().rows.map((row) => (
                            <React.Fragment key={row.id}>
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 whitespace-nowrap dark:text-gray-300"
                                        >
                                            {editingId === row.original.question_id &&
                                                (cell.column.id === "all_questions" ||
                                                    cell.column.id === "difficulty_level" ||
                                                    cell.column.id === "question_type") ? (
                                                cell.column.id === "difficulty_level" ? (
                                                    <select
                                                        name="difficulty_level"
                                                        value={editForm.difficulty_level || ""}
                                                        onChange={handleEditChange}
                                                        className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    >
                                                        <option value="easy">Easy</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="hard">Hard</option>
                                                    </select>
                                                ) : cell.column.id === "question_type" ? (
                                                    <select
                                                        name="question_type"
                                                        value={editForm.question_type || ""}
                                                        onChange={handleEditChange}
                                                        className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    >
                                                        <option value="multiple_choice">
                                                            Multiple Choice
                                                        </option>
                                                        <option value="fill_in_the_blanks">
                                                            Fill in the Blanks
                                                        </option>
                                                        <option value="true_or_false">True/False</option>
                                                        <option value="short_answer">Short Answer</option>
                                                        <option value="long_answer">Long Answer</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        name={cell.column.id}
                                                        value={editForm[cell.column.id] || ""}
                                                        onChange={handleEditChange}
                                                        className="p-1 border outline-lime-500 rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                    />
                                                )
                                            ) : (
                                                flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => toggleRowExpansion(row.id)}
                                            className="text-blue-500 hover:text-blue-700 outline-none dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {expandedRows[row.id] ? "▲" : "▼"}
                                        </button>
                                    </td>
                                </tr>
                                {expandedRows[row.id] && (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            className="px-6 py-4 bg-gray-50 dark:bg-gray-700"
                                        >
                                            <div className="space-y-4">
                                                <div>
                                                    <h3 className="font-medium dark:text-gray-300">
                                                        Answer:
                                                    </h3>
                                                    {editingId === row.original.question_id ? (
                                                        <input
                                                            name="answer"
                                                            value={editForm.answer || ""}
                                                            onChange={handleEditChange}
                                                            className="p-1 border rounded w-full mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                        />
                                                    ) : (
                                                        <p className="dark:text-gray-300">
                                                            {row.original.answer}
                                                        </p>
                                                    )}
                                                </div>

                                                {row.original.question_type === "multiple_choice" &&
                                                    row.original.options && (
                                                        <div>
                                                            <h3 className="font-medium dark:text-gray-300">
                                                                Options:
                                                            </h3>
                                                            {editingId === row.original.question_id ? (
                                                                <div className="space-y-2 mt-1">
                                                                    {editForm.options.map((option, index) => (
                                                                        <input
                                                                            key={index}
                                                                            value={option}
                                                                            onChange={(e) =>
                                                                                handleOptionChange(
                                                                                    index,
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                            className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <ul className="list-disc pl-5 dark:text-gray-300">
                                                                    {row.original.options.map((option, index) => (
                                                                        <li key={index}>{option}</li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}

                                                <div className="p-4 rounded-xl shadow-md bg-gradient-to-br from-lime-100 to-purple-100 dark:from-gray-800 dark:to-gray-700 transition-colors">
                                                    <h3 className="text-xl font-bold text-lime-800 dark:text-lime-300 mb-3 flex items-center gap-2">
                                                        📘 Book Details
                                                    </h3>
                                                    <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
                                                        <p>
                                                            <span className="font-semibold text-lime-700 dark:text-lime-400">Subject:</span>{" "}
                                                            {row.original.Book?.subject || "N/A"}
                                                        </p>
                                                        <p>
                                                            <span className="font-semibold text-lime-700 dark:text-lime-400">Chapter Name:</span>{" "}
                                                            {(() => {
                                                                const chapter = row.original.Book?.metadata?.chapters?.find(
                                                                    chap => row.original.chapter_id &&
                                                                        row.original.Book.metadata.chapters.indexOf(chap) + 1 === row.original.chapter_id
                                                                );
                                                                return chapter?.chapterName || "N/A";
                                                            })()}
                                                        </p>
                                                        <p>
                                                            <span className="font-semibold text-lime-700 dark:text-lime-400">Topic Name:</span>{" "}
                                                            {(() => {
                                                                const chapter = row.original.Book?.metadata?.chapters?.find(
                                                                    chap => row.original.chapter_id &&
                                                                        row.original.Book.metadata.chapters.indexOf(chap) + 1 === row.original.chapter_id
                                                                );

                                                                if (chapter && row.original.topic_id && chapter.topics) {
                                                                    return chapter.topics[row.original.topic_id - 1] || "N/A";
                                                                }
                                                                return "N/A";
                                                            })()}
                                                        </p>
                                                        <p>
                                                            <span className="font-semibold text-lime-700 dark:text-lime-400">Class:</span>{" "}
                                                            {row.original.Book?.class_name || "N/A"}
                                                        </p>
                                                        <p>
                                                            <span className="font-semibold text-lime-700 dark:text-lime-400">Medium:</span>{" "}
                                                            {row.original.Book?.medium || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex *
                table.getState().pagination.pageSize +
                1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium">
              {table.getFilteredRowModel().rows.length}
            </span>{" "}
            results
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            ‹
          </button>

          {/* for delete method open one modal confirmation */}
          {/* Delete Confirmation Modal */}
          <input
            type="checkbox"
            id="delete-modal"
            className="modal-toggle"
            checked={deleteModalOpen}
            onChange={() => setDeleteModalOpen(!deleteModalOpen)}
          />
          <div className="modal" role="dialog">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Confirm Deletion</h3>
              <p className="py-4">Are you sure you want to delete this question? This action cannot be undone.</p>
              <div className="modal-action">
                <button
                  onClick={() => {
                    handleDelete(questionToDelete);
                    setDeleteModalOpen(false);
                  }}
                  className="btn btn-error text-white"
                >
                  Delete
                </button>
                <button
                  htmlFor="delete-modal"
                  className="btn"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
            <label
              className="modal-backdrop"
              htmlFor="delete-modal"
              onClick={() => setDeleteModalOpen(false)}
            >
              Close
            </label>
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, table.getPageCount()) },
              (_, i) => {
                let pageIndex;
                if (table.getPageCount() <= 5) {
                  pageIndex = i;
                } else if (table.getState().pagination.pageIndex <= 2) {
                  pageIndex = i;
                } else if (
                  table.getState().pagination.pageIndex >=
                  table.getPageCount() - 3
                ) {
                  pageIndex = table.getPageCount() - 5 + i;
                } else {
                  pageIndex = table.getState().pagination.pageIndex - 2 + i;
                }

                return (
                  <button
                    key={pageIndex}
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={`px-3 py-1 border rounded ${table.getState().pagination.pageIndex === pageIndex
                      ? "bg-lime-500 text-white dark:bg-lime-600"
                      : "bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      }`}
                  >
                    {pageIndex + 1}
                  </button>
                );
              }
            )}
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            ›
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            »
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Rows per page:
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>
          {/* Edit Question Modal */}
<input
  type="checkbox"
  id="edit-modal"
  className="peer/modal hidden"
  checked={isEditModalOpen}
  onChange={() => setIsEditModalOpen(!isEditModalOpen)}
/>

<div className="fixed inset-0 z-50 overflow-y-auto hidden peer-checked/modal:block">
  <div className="flex min-h-screen items-center justify-center p-4">
    {/* Backdrop */}
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={() => setIsEditModalOpen(false)}
    />
    
    {/* Modal container */}
    <div className="relative w-full max-w-4xl rounded-xl bg-white dark:bg-gray-800 shadow-2xl transition-all transform overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Modal content */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Question
          </h2>
          <button 
            onClick={() => setIsEditModalOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {currentQuestion && (
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            {/* Question Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Question
              </label>
              <input
                type="text"
                name="all_questions"
                value={editForm.all_questions || ""}
                onChange={handleEditChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all"
              />
            </div>

            {/* Difficulty & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Difficulty Level
                </label>
                <select
                  name="difficulty_level"
                  value={editForm.difficulty_level || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Question Type
                </label>
                <select
                  name="question_type"
                  value={editForm.question_type || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                >
                  <option value="">Select type</option>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="fill_in_the_blanks">Fill in the Blanks</option>
                  <option value="true_or_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="long_answer">Long Answer</option>
                </select>
              </div>
            </div>

            {/* Answer Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Answer
              </label>
              <textarea
                type="text"
                name="answer"
                value={editForm.answer || ""}
                onChange={handleEditChange}
                className="w-full px-4 py-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all"
              />
            </div>

            {/* Options Field (Only for MCQ) */}
            {editForm.question_type === "multiple_choice" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Options
                </label>
                <div className="space-y-3">
                  {editForm.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-lime-800 dark:text-blue-200 font-medium text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-lime-500 focus:border-lime-500 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-lime-500 hover:bg-lime-400 text-white font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default Generated_Questions;

// const handleEdit = (question) => {
//   setEditingId(question.question_id);
//   setEditForm({
//     all_questions: question.all_questions,
//     difficulty_level: question.difficulty_level,
//     answer: question.answer,
//     options: question.options ? [...question.options] : null,
//     question_ispublic: question.question_ispublic
//   });
// };

// const handleEditChange = (e) => {
//   const { name, value, type, checked } = e.target;
//   setEditForm(prev => ({
//     ...prev,
//     [name]: type === 'checkbox' ? checked : value
//   }));
// };

// const handleDelete = async (questionId) => {
//   try {
//     await axios.delete(`${baseUrl}/delete-question/${questionId}`, { withCredentials: true });
//     setQuestions(questions.filter(q => q.question_id !== questionId));
//     toast.success('Question deleted successfully');
//   } catch (error) {
//     console.error('Error deleting question:', error);
//     toast.error('Failed to delete question');
//   }
// };

{
  /* <div className="flex space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
            «
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
            ‹
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
            ‣
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-white disabled:opacity-50"
          >
            »
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="p-1 border rounded"
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>/*} */
}
