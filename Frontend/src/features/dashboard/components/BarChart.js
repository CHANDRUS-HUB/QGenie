import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';
import baseUrl from '../../../utils/URL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Color generator function for unlimited books
const generateBookColors = (count) => {
  const colors = [];
  const saturation = 70;
  const lightness = 60;
  
  // Golden angle for optimal color distribution
  const goldenAngle = 137.508; 
  
  for (let i = 0; i < count; i++) {
    const hue = (i * goldenAngle) % 360;
    colors.push({
      background: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`,
      border: `hsl(${hue}, ${saturation}%, ${lightness * 0.8}%)`
    });
  }
  return colors;
};

function BarChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const booksPerPage = 10; // Show 10 books per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsRes, booksRes] = await Promise.all([
          axios.get(`${baseUrl}/get-all-questions`, { withCredentials: true }),
          axios.get(`${baseUrl}/get-all-books`, { withCredentials: true })
        ]);

        const books = booksRes.data.books || [];
        const questions = questionsRes.data.data || [];

        // Sort books by question count (descending)
        const sortedBooks = [...books].sort((a, b) => {
          const countA = questions.filter(q => q.book_id === a.book_id).length;
          const countB = questions.filter(q => q.book_id === b.book_id).length;
          return countB - countA;
        });

        // Generate colors for all books
        const colorSet = generateBookColors(sortedBooks.length);

        // Prepare paginated data
        const startIdx = currentPage * booksPerPage;
        const paginatedBooks = sortedBooks.slice(startIdx, startIdx + booksPerPage);
        
        const bookQuestionCounts = paginatedBooks.map(book => 
          questions.filter(q => q.book_id === book.book_id).length
        );

        const data = {
          labels: paginatedBooks.map((_, i) => `Book ${startIdx + i + 1}`),
          datasets: [{
            label: 'Questions Generated',
            data: bookQuestionCounts,
            backgroundColor: paginatedBooks.map((_, i) => 
              colorSet[startIdx + i].background
            ),
            borderColor: paginatedBooks.map((_, i) => 
              colorSet[startIdx + i].border
            ),
            borderWidth: 1,
            borderRadius: 4,
          }],
          bookTitles: paginatedBooks.map(book => book.title)
        };

        setChartData({
          allData: {
            books: sortedBooks,
            questions,
            colors: colorSet
          },
          currentPageData: data,
          totalPages: Math.ceil(sortedBooks.length / booksPerPage)
        });

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
          setTimeout(() => window.location.href = "/login", 2000);
        } else {
          toast.error("Failed to load analytics data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Top Books by Question Generation',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        callbacks: {
          title: (context) => chartData?.currentPageData.bookTitles[context[0].dataIndex] || '',
          label: (context) => `Questions: ${context.raw}`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Questions' }
      },
      y: {
        ticks: { font: { weight: 'bold' } }
      }
    }
  };

  if (loading) {
    return <TitleCard title="Book Analytics"><div className="text-center py-8">Loading...</div></TitleCard>;
  }

  if (!chartData) {
    return <TitleCard title="Book Analytics"><div className="text-center py-8 text-red-500">Failed to load data</div></TitleCard>;
  }

  return (
    <TitleCard title="Book Question Analytics">
      <div className=" w-full">
        <Bar options={options} data={chartData.currentPageData} />
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button 
          className="btn btn-sm" 
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(p => p - 1)}
        >
          Previous
        </button>
        
        <span className="text-sm">
          Page {currentPage + 1} of {chartData.totalPages}
        </span>
        
        <button 
          className="btn btn-sm"
          disabled={currentPage >= chartData.totalPages - 1}
          onClick={() => setCurrentPage(p => p + 1)}
        >
          Next
        </button>
      </div>

      <div className="mt-2 text-sm text-gray-500 text-center">
        Showing books {currentPage * booksPerPage + 1}-
        {Math.min((currentPage + 1) * booksPerPage, chartData.allData.books.length)} of {chartData.allData.books.length}
      </div>
    </TitleCard>
  );
}

export default BarChart;