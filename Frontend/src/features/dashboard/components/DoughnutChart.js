import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import TitleCard from '../../../components/Cards/TitleCard';
import axios from 'axios';
import baseUrl from '../../../utils/URL';

ChartJS.register(ArcElement, Tooltip, Legend, Filler);

function DoughnutChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios
      .get(`${baseUrl}/get-all-questions`, { withCredentials: true })
      .then((response) => {
        const questions = response.data.data; // Access the 'data' array from the response

        // Count the number of questions by type
        const questionTypeCounts = questions.reduce((acc, question) => {
          acc[question.question_type] = (acc[question.question_type] || 0) + 1;
          return acc;
        }, {});

        const labels = Object.keys(questionTypeCounts).map((type) => {
          switch (type) {
            case 'fill_in_the_blanks':
              return 'Fill in the Blanks';
            case 'match_the_following':
              return 'Match the Following';
            case 'logical_reasoning':
              return 'Logical Reasoning';
            case 'short_answer':
              return 'Short Answer';
            case 'long_answer':
              return 'Long Answer';
            case 'true_or_false':
              return 'True or False';
            case 'multiple_choice':
              return 'Multiple Choice';
            default:
              return type;
          }
        });
        const data = Object.values(questionTypeCounts);

        setChartData({
          labels,
          datasets: [
            {
              label: 'No of Questions',
              data,
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      })
      .catch((error) => {
        console.error('Error fetching questions:', error);
      });
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <TitleCard title={'Questions by Type'}>
      {chartData ? (
        <Doughnut options={options} data={chartData} />
      ) : (
        <p>Loading...</p>
      )}
    </TitleCard>
  );
}

export default DoughnutChart;
