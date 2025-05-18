import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import baseUrl from "../../../utils/URL";

function AmountStats() {
    const [easyCount, setEasyCount] = useState(0);
    const [mediumCount, setMediumCount] = useState(0);
    const [hardCount, setHardCount] = useState(0);

    useEffect(() => {
        axios
            .get(`${baseUrl}/get-all-questions`, { withCredentials: true })
            .then((response) => {
                const questions = response.data.data || [];
                
                // Calculate counts by difficulty level
                setEasyCount(questions.filter(q => q.difficulty_level === 'easy').length);
                setMediumCount(questions.filter(q => q.difficulty_level === 'medium').length);
                setHardCount(questions.filter(q => q.difficulty_level === 'hard').length);
            })
            .catch((error) => {
                const response = error.response;
                if (response && response.status === 401) {
                    toast.error("Session expired. Please login again.");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    console.error("Error fetching questions:", error);
                    toast.error("Failed to fetch questions");
                }
            });
    }, []);

    return (
        <div className="stats bg-base-100 shadow sm:overflow-hidden">
            {/* Easy Questions Stat */}
            <div className="stat">
                <div className="stat-title">Easy Questions</div>
                <div className="stat-value text-green-500">{easyCount}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">Basic level questions</button>
                </div>
            </div>

            {/* Medium Questions Stat */}
            <div className="stat">
                <div className="stat-title">Medium Questions</div>
                <div className="stat-value text-yellow-500">{mediumCount}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">Intermediate level questions</button>
                </div>
            </div>

            {/* Hard Questions Stat */}
            <div className="stat">
                <div className="stat-title">Hard Questions</div>
                <div className="stat-value text-red-500">{hardCount}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">Advanced level questions</button>
                </div>
            </div>
        </div>
    );
}

export default AmountStats;