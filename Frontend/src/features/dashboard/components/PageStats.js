import { HeartIcon, AcademicCapIcon, BookOpenIcon, BoltIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import baseUrl from "../../../utils/URL";

function PageStats() {
    const [stats, setStats] = useState({
        totalQuestions: 0,
        publicQuestions: 0,
        mostQuestionsBook: { title: "Loading...", count: 0 }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all questions
                const questionsRes = await axios.get(`${baseUrl}/get-all-questions`, { withCredentials: true });
                const questions = questionsRes.data.data || [];
                
                // Fetch all books (assuming you have 6 books)
                const booksRes = await axios.get(`${baseUrl}/get-all-books`, { withCredentials: true });
                const books = booksRes.data.books || [];
                
                // Calculate question counts for each of the 6 books
                const bookQuestionCounts = books.map(book => {
                    const count = questions.filter(q => q.book_id === book.book_id).length;
                    return {
                        title: book.title,
                        count
                    };
                });
                
                // Find the book with maximum questions
                const topBook = bookQuestionCounts.reduce((max, book) => 
                    book.count > max.count ? book : max, 
                    { title: "No books", count: 0 }
                );

                setStats({
                    totalQuestions: questions.length,
                    publicQuestions: questions.filter(q => q.question_ispublic).length,
                    mostQuestionsBook: topBook
                });
            } catch (error) {
                const response = error.response;
                if (response && response.status === 401) {
                    toast.error("Session expired. Please login again.");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to fetch data");
                }
            }
        };
        
        fetchData();
    }, []);

    return (
        <div className="stats bg-base-100 shadow">
            <div className="stat">
                <div className="stat-figure invisible md:visible">
                   <BoltIcon className='w-8 h-8 text-orange-400'/>
                </div>
                <div className="stat-title">Total Questions</div>
                <div className="stat-value text-indigo-500">{stats.totalQuestions}</div>
                <div className="stat-desc">All books combined</div>
            </div>
            
            
           <div className="stat">
    <div className="stat-figure invisible md:visible text-accent">
        <BookOpenIcon className='w-8 h-8' />
    </div>
    <div className="stat-content">
        <div className="stat-title ">Top Performing Book</div>
        <div className="stat-desc mt-4  whitespace-normal text-black dark:text-gray-300 font-bold">
           <i> {stats.mostQuestionsBook.title}</i>
        </div>
          <div className="stat-desc mt-2">
                Generated {stats.mostQuestionsBook.count} questions</div>
    </div>
</div>
        </div>
    )
}

export default PageStats