import TitleCard from "../../../components/Cards/TitleCard";
import baseUrl from "../../../utils/URL";
import { useEffect, useState } from 'react';
import axios from 'axios';

function UserChannels() {
    const [subjectData, setSubjectData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuestionData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch all questions
                const response = await axios.get(`${baseUrl}/get-all-questions`, { withCredentials: true });
                console.log("Fetched questions:", response.data);
                
                if (response.data?.data) {
                    // Process data to count questions by subject from the associated Book
                    const subjectCounts = {};
                    let totalQuestions = 0;
                    
                    response.data.data.forEach(question => {
                        const subject = question.Book?.subject || 'Unknown';
                        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
                        totalQuestions++;
                    });
                    
                    // Convert to array format for table and calculate percentages
                    const processedData = Object.entries(subjectCounts)
                        .map(([subject, count]) => ({
                            subject,
                            count,
                            conversionPercent: Math.round((count / totalQuestions) * 100)
                        }))
                        .sort((a, b) => b.count - a.count); // Sort by count descending
                    
                    setSubjectData(processedData);
                }
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError("Failed to load question data");
            } finally {
                setLoading(false);
            }
        };
        
        fetchQuestionData();
    }, []);

    if (loading) {
        return <TitleCard title={"Questions by Subject"}>Loading...</TitleCard>;
    }

    if (error) {
        return <TitleCard title={"Questions by Subject"}>
            <div className="text-red-500">{error}</div>
        </TitleCard>;
    }

    return (
        <TitleCard title={"Question Generation by Subject"}>
            <div className="overflow-auto ">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th className="normal-case">Subject</th>
                            <th className="normal-case">Questions Generated</th>
                            <th className="normal-case">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectData.map((data, index) => (
                            <tr key={index}>
                                <th>{index + 1}</th>
                                <td>{data.subject}</td>
                                <td>{data.count}</td>
                                <td>{`${data.conversionPercent}%`}</td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </TitleCard>
    );
}

export default UserChannels;