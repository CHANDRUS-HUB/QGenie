import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import baseUrl from '../../utils/URL';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';

const Generated_Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${baseUrl}/get-all-questions-by-currentuser`, { withCredentials: true });
        setQuestions(Array.isArray(response.data?.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to fetch questions');
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const handleEdit = (question) => {
    setEditingId(question.question_id);
    setEditForm({
      all_questions: question.all_questions,
      difficulty_level: question.difficulty_level,
      question_type: question.question_type,
      answer: question.answer,
      options: question.options ? [...question.options] : [],
      question_ispublic: question.question_ispublic
    });
  };

  const handleDelete = async (questionId) => {
    try {
      await axios.delete(`${baseUrl}/delete-question/${questionId}`, { withCredentials: true });
      setQuestions(questions.filter(q => q.question_id !== questionId));
      toast.success('Question deleted successfully');
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, value) => {
    setEditForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSave = async (questionId) => {
    try {
      await axios.put(`${baseUrl}/update-question/${questionId}`, editForm, { withCredentials: true });
      setQuestions(questions.map(q => 
        q.question_id === questionId ? { ...q, ...editForm } : q
      ));
      setEditingId(null);
      toast.success('Question updated successfully');
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error('Failed to update question');
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'question_id',
        header: 'ID',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'all_questions',
        header: 'Question',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'difficulty_level',
        header: 'Difficulty',
        cell: info => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            info.getValue() === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            info.getValue() === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'question_type',
        header: 'Type',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'Book.title',
        header: 'Book',
        cell: info => info.row.original.Book?.title || 'N/A',
      },
      {
        accessorKey: 'User.username',
        header: 'Created By',
        cell: info => info.row.original.User?.username || 'N/A',
      },
      {
        id: 'actions',
        header: 'Actions',
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
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(row.original.question_id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  Delete
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
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
      <h1 className="text-2xl font-bold mb-6">Generated Questions</h1>
      
      <div className="mb-4 flex items-center flex-wrap gap-2">
        <input
          placeholder="Filter questions..."
          value={(table.getColumn('all_questions')?.getFilterValue() ?? '')}
          onChange={(e) =>
            table.getColumn('all_questions')?.setFilterValue(e.target.value)
          }
          className="p-2 border rounded w-full md:w-1/2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <select
          value={(table.getColumn('difficulty_level')?.getFilterValue() ?? '')}
          onChange={(e) =>
            table.getColumn('difficulty_level')?.setFilterValue(e.target.value)
          }
          className="p-2 border rounded flex-1 min-w-[150px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={(table.getColumn('question_type')?.getFilterValue() ?? '')}
          onChange={(e) =>
            table.getColumn('question_type')?.setFilterValue(e.target.value)
          }
          className="p-2 border rounded flex-1 min-w-[150px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="fill_in_the_blanks">Fill in the Blanks</option>
          <option value="true_false">True/False</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-gray-800 dark:border dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                  Toggle
                </th>
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap dark:text-gray-300">
                      {editingId === row.original.question_id && 
                      (cell.column.id === 'all_questions' || 
                       cell.column.id === 'difficulty_level' ||
                       cell.column.id === 'question_type') ? (
                        cell.column.id === 'difficulty_level' ? (
                          <select
                            name="difficulty_level"
                            value={editForm.difficulty_level || ''}
                            onChange={handleEditChange}
                            className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        ) : cell.column.id === 'question_type' ? (
                          <select
                            name="question_type"
                            value={editForm.question_type || ''}
                            onChange={handleEditChange}
                            className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          >
                            <option value="multiple_choice">Multiple Choice</option>
                            <option value="fill_in_the_blanks">Fill in the Blanks</option>
                            <option value="true_false">True/False</option>
                          </select>
                        ) : (
                          <input
                            name={cell.column.id}
                            value={editForm[cell.column.id] || ''}
                            onChange={handleEditChange}
                            className="p-1 border rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
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
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {expandedRows[row.id] ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
                {expandedRows[row.id] && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium dark:text-gray-300">Answer:</h3>
                          {editingId === row.original.question_id ? (
                            <input
                              name="answer"
                              value={editForm.answer || ''}
                              onChange={handleEditChange}
                              className="p-1 border rounded w-full mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            />
                          ) : (
                            <p className="dark:text-gray-300">{row.original.answer}</p>
                          )}
                        </div>
                        
                        {row.original.question_type === 'multiple_choice' && row.original.options && (
                          <div>
                            <h3 className="font-medium dark:text-gray-300">Options:</h3>
                            {editingId === row.original.question_id ? (
                              <div className="space-y-2 mt-1">
                                {editForm.options.map((option, index) => (
                                  <input
                                    key={index}
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
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
                        
                        <div className="flex items-center">
                          <h3 className="font-medium mr-2 dark:text-gray-300">Public:</h3>
                          {editingId === row.original.question_id ? (
                            <input
                              type="checkbox"
                              name="question_ispublic"
                              checked={editForm.question_ispublic || false}
                              onChange={handleEditChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-800 dark:border-gray-700 dark:checked:bg-blue-600"
                            />
                          ) : (
                            <span className="dark:text-gray-300">{row.original.question_ispublic ? 'Yes' : 'No'}</span>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="font-medium dark:text-gray-300">Book Details:</h3>
                          <p className="dark:text-gray-300">Subject: {row.original.Book?.subject || 'N/A'}</p>
                          <p className="dark:text-gray-300">Class: {row.original.Book?.class_name || 'N/A'}</p>
                          <p className="dark:text-gray-300">Medium: {row.original.Book?.medium || 'N/A'}</p>
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

      {/* Enhanced Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Showing{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium">
              {table.getFilteredRowModel().rows.length}
            </span>{' '}
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
          
          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              let pageIndex;
              if (table.getPageCount() <= 5) {
                pageIndex = i;
              } else if (table.getState().pagination.pageIndex <= 2) {
                pageIndex = i;
              } else if (table.getState().pagination.pageIndex >= table.getPageCount() - 3) {
                pageIndex = table.getPageCount() - 5 + i;
              } else {
                pageIndex = table.getState().pagination.pageIndex - 2 + i;
              }
              
              return (
                <button
                  key={pageIndex}
                  onClick={() => table.setPageIndex(pageIndex)}
                  className={`px-3 py-1 border rounded ${
                    table.getState().pagination.pageIndex === pageIndex
                      ? 'bg-blue-500 text-white dark:bg-blue-600'
                      : 'bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              );
            })}
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
          <span className="text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
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


  


        {/* <div className="flex space-x-2">
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
        </div>/*} */}