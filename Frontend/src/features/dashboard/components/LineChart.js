import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';
import baseUrl from '../../../utils/URL';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function LineChart() {
  const [monthlyActivity, setMonthlyActivity] = useState({ 
    questions: [], 
    uploads: [],
    labels: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMonthlyActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Generate labels for last 12 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentDate = new Date();
        const labels = [];
        const monthKeys = [];
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(currentDate.getMonth() - i);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          monthKeys.push(`${year}-${String(month).padStart(2, '0')}`);
          labels.push(`${monthNames[date.getMonth()]} ${year}`);
        }

        // Initialize empty data arrays
        const questionsByMonth = Array(12).fill(0);
        const uploadsByMonth = Array(12).fill(0);

        // Fetch questions
        try {
          const questionsRes = await axios.get(`${baseUrl}/get-all-questions`, { withCredentials: true });
        
          
          if (questionsRes.data?.data) {
            questionsRes.data.data.forEach(question => {
              if (!question?.created_at) return;
              
              // Handle both timestamp formats
              const dateStr = question.created_at.includes('T') 
                ? question.created_at.split('T')[0] 
                : question.created_at.split(' ')[0];
              const [year, month] = dateStr.split('-');
              const monthKey = `${year}-${month}`;
              
              const index = monthKeys.indexOf(monthKey);
              if (index !== -1) {
                questionsByMonth[index]++;
              }
            });
          }
        } catch (questionsError) {
          const response = error.response;
      if (401 === response.status) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
          console.error("Error fetching questions:", questionsError);
          setError("Failed to load questions data");
        }

        // Fetch books (uploads)
        try {
          const booksRes = await axios.get(`${baseUrl}/get-all-books`, { withCredentials: true });
          
          
          if (booksRes.data?.books) {
            booksRes.data.books.forEach(book => {
              if (!book?.created_at) return;
              
              // Handle both timestamp formats
              const dateStr = book.created_at.includes('T') 
                ? book.created_at.split('T')[0] 
                : book.created_at.split(' ')[0];
              const [year, month] = dateStr.split('-');
              const monthKey = `${year}-${month}`;
              
              const index = monthKeys.indexOf(monthKey);
              if (index !== -1) {
                uploadsByMonth[index]++;
              }
            });
          }
        } catch (booksError) {
          console.error("Error fetching books:", booksError);
          setError(prev => prev ? `${prev}. Failed to load books data` : "Failed to load books data");
        }

        setMonthlyActivity({
          questions: questionsByMonth,
          uploads: uploadsByMonth,
          labels
        });
      } catch (err) {
        console.error("Error in fetchMonthlyActivity:", err);
        setError("Failed to load activity data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMonthlyActivity();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Activity (Last 12 Months)',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Activity Count',
        },
        beginAtZero: true,
        suggestedMax: Math.max(
          ...(monthlyActivity.questions || []), 
          ...(monthlyActivity.uploads || []), 
          10
        ) + 2
      },
    },
  };

  const data = {
    labels: monthlyActivity.labels || [],
    datasets: [
      {
        fill: true,
        label: 'Questions Created',
        data: monthlyActivity.questions || [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        fill: true,
        label: 'Files Uploaded',
        data: monthlyActivity.uploads || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      }
    ],
  };

  if (loading) {
    return <TitleCard title={"Monthly Activity"}>Loading...</TitleCard>;
  }

  if (error) {
    return (
      <TitleCard title={"Monthly Activity"}>
        <div className="text-red-500">{error}</div>
        {monthlyActivity.labels.length > 0 && (
          <Line data={data} options={options} />
        )}
      </TitleCard>
    );
  }

  return (
    <TitleCard title={"Monthly Activity (Last 12 Months)"}>
      <Line data={data} options={options} />
    </TitleCard>
  );
}

export default LineChart;