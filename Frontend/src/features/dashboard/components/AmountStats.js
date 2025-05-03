import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import baseUrl from "../../../utils/URL";
import { motion } from "framer-motion";


function AmountStats() {
    const [questions, setQuestions] = useState([]);
    const [publicQuestionsCount, setPublicQuestionsCount] = useState(0);
    const [privateQuestionsCount, setPrivateQuestionsCount] = useState(0);


    useEffect(() => {
        // Replace with your actual base URL

        axios
            .get(`${baseUrl}/get-all-questions`, { withCredentials: true })
            .then((response) => {
                const questions = response.data.data || [];
                setQuestions(questions);

                // Calculate public and private questions count
                const publicCount = questions.filter((q) => q.question_ispublic).length;
                const privateCount = questions.length - publicCount;

                setPublicQuestionsCount(publicCount);
                setPrivateQuestionsCount(privateCount);
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
        <div className="stats bg-base-100 shadow">
            <div className="stat">
                <div className="stat-title">Total Questions</div>
                <div className="stat-value">{questions.length}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">View All Questions</button>
                </div>
            </div>

            <div className="stat">
                <div className="stat-title">Public Questions</div>
                <div className="stat-value">{publicQuestionsCount}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">View Public Questions</button>
                </div>
            </div>

            <div className="stat">
                <div className="stat-title">Private Questions</div>
                <div className="stat-value">{privateQuestionsCount}</div>
                <div className="stat-actions">
                    <button className="btn btn-xs">View Private Questions</button>
                </div>
            </div>
        </div>
    );
}

export default AmountStats;
