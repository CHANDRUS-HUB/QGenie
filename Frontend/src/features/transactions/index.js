import React from "react";
import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showNotification } from "../common/headerSlice";
import TitleCard from "../../components/Cards/TitleCard";
import { RECENT_TRANSACTIONS } from "../../utils/dummyData";
import FunnelIcon from "@heroicons/react/24/outline/FunnelIcon";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";
import SearchBar from "../../components/Input/SearchBar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import baseUrl from "../../utils/URL";
import { motion } from "framer-motion";

const TopSideButtons = ({ removeFilter, applyFilter, applySearch }) => {
    const [filterParam, setFilterParam] = useState("");
    const [searchText, setSearchText] = useState("");
    const roleFilters = ["Teacher", "Admin"];

    const showFiltersAndApply = (params) => {
        applyFilter(params);
        setFilterParam(params);
    };

    const removeAppliedFilter = () => {
        removeFilter();
        setFilterParam("");
        setSearchText("");
    };

    useEffect(() => {
        if (searchText === "") {
            removeAppliedFilter();
        } else {
            applySearch(searchText);
        }
    }, [searchText]);

    return (
        <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        {/* Search Bar */}
        <SearchBar
            searchText={searchText}
            styleClass="w-64 btn-md"
            setSearchText={setSearchText}
            placeholderText="Search by Name or Email"
        />
    
        {/* Filter Chip */}
        {filterParam !== "" && (
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={removeAppliedFilter}
                className="flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm shadow-sm hover:bg-green-200 transition"
            >
                {filterParam}
                <XMarkIcon className="w-4 h-4 ml-2" />
            </motion.button>
        )}
    
        {/* Filter Dropdown */}
        <div className="dropdown dropdown-end">
            <label
                tabIndex={0}
                className="btn btn-md  flex items-center gap-2 bg-gradient-to-r from-green-500 to-lime-400 text-white hover:shadow-lg transition"
            >
                <FunnelIcon className="w-5" />
                Filter
            </label>
            <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-lg bg-white rounded-md w-52 z-20"
            >
                {roleFilters.map((l, k) => (
                    <li key={k}>
                        <button onClick={() => showFiltersAndApply(l)} className="hover:bg-gray-100 px-2 py-1 rounded text-sm w-full text-left">
                            {l}
                        </button>
                    </li>
                ))}
                <div className="divider my-1" />
                <li>
                    <button onClick={removeAppliedFilter} className="hover:bg-red-100 px-2 py-1 rounded text-sm w-full text-left text-red-600">
                        Remove Filter
                    </button>
                </li>
            </ul>
        </div>
    </div>
    
    );
};

const ITEMS_PER_PAGE = 10;

function Transactions() {
    const [trans, setTrans] = useState([]);
    const [allTrans, setAllTrans] = useState([]); // Keeps original data for reset
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    // Fetch API data
    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${baseUrl}/get-all-users`, {
                withCredentials: true,
            });

            const users = res.data.users;
            const transactions = users.map((u) => ({
                id: u.id,
                name: u.username,
                email: u.email,
                location: u.role,
                amount: Math.floor(Math.random() * 500) + 100, // Random amount for demo
                Books: u.Books, // Assuming Books is an array
                date: u.created_at,
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`, // Avatar mock
            }));

            setAllTrans(transactions);
            setTrans(transactions);
        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const removeFilter = () => {
        setTrans(allTrans);
        setCurrentPage(1);
    };

    const applyFilter = (location) => {
        const filtered = allTrans.filter((t) => t.location === location);
        setTrans(filtered);
        setCurrentPage(1);
    };

    const applySearch = (value) => {
        const filtered = allTrans.filter(
            (t) =>
                t.email.toLowerCase().includes(value.toLowerCase()) ||
                t.name.toLowerCase().includes(value.toLowerCase())
        );
        setTrans(filtered);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(trans.length / ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const paginatedData = trans.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleViewBook = (l) => {
        navigate(`/app/Users/view-book/${l.id}`);
        console.log(l.id);
    };

    return (
        <>
            <TitleCard
                title={`Total Users: ${allTrans.length} | Total Books: ${allTrans.reduce(
                    (acc, user) => acc + (user.Books?.length || 0),
                    0
                )}`}
                topMargin="mt-2"
                style={{ background: "green" }}
                TopSideButtons={
                    <TopSideButtons
                        applySearch={applySearch}
                        applyFilter={applyFilter}
                        removeFilter={removeFilter}
                        style={{ zIndex: "999" }}
                    />
                }
            >
                <div className="overflow-x-auto w-full">
                    <motion.table
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="table w-full"
                    >
                        <thead>
                            <tr className="text-black dark:text-white">
                             
                                <th>Name</th>
                                <th>Email Id</th>
                                <th>Role</th>
                                <th>Registered At</th>
                                <th>Uploaded Books</th>
                                <th>View Books</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((l, k) => (
                                <motion.tr
                                    key={k}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: k * 0.1 }}
                                >
                                  
                                    <td>
                                        <div className="flex items-center space-x-3">
                                            <div className="avatar">
                                                <div className="mask mask-circle w-12 h-12">
                                                    <img
                                                        src={l.avatar || "/default-avatar.png"}
                                                        alt="Avatar"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{l.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{l.email}</td>
                                    <td>{l.location}</td>
                                    <td>{moment(l.date).format("DD MMM YYYY hh:mm A")}</td>
                                    <td>
                                        <span
                                            className="badge badge-ghost badge-sm cursor-help"
                                            title={
                                                l.Books?.length > 0
                                                    ? l.Books.map((book) => book.title).join(", ")
                                                    : "No books"
                                            }
                                        >
                                            {l.Books?.length || 0} Books
                                        </span>
                                    </td>
                                    <td>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 rounded-lg hover:bg-gradient-to-r from-green-200 to-lime-200 text-sky-500 transition duration-300 ease-in-out flex items-center justify-center shadow-md dark:shadow-md dark:shadow-green-400"
                                            onClick={() => handleViewBook(l)}
                                            title="View Book"
                                            aria-label="View Book"
                                        >
                                            <span className="material-icons transform transition-transform duration-300 hover:scale-110">
                                                visibility
                                            </span>
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </motion.table>

                    {/* Modern Pagination Controls */}
                    <div className="flex justify-center mt-4 space-x-2 items-center">
                        <button
                            className={`btn btn-sm rounded-full ${
                                currentPage === 1 ? "btn-disabled" : "btn-outline"
                            }`}
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <span className="material-icons">chevron_left</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                                (page) =>
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                            )
                            .map((page, index, array) => {
                                const isPrevEllipsis =
                                    page > 2 && array[index - 1] !== page - 1;
                                const isNextEllipsis =
                                    page < totalPages - 1 && array[index + 1] !== page + 1;

                                return (
                                    <React.Fragment key={page}>
                                        {isPrevEllipsis && (
                                            <span className="text-gray-500">...</span>
                                        )}
                                        <button
                                            className={`btn btn-sm rounded-full ${
                                                currentPage === page
                                                    ? "bg-gradient-to-r from-green-500 to-lime-500 text-white"
                                                    : "btn-outline"
                                            }`}
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </button>
                                        {isNextEllipsis && (
                                            <span className="text-gray-500">...</span>
                                        )}
                                    </React.Fragment>
                                );
                            })}

                        <button
                            className={`btn btn-sm rounded-full ${
                                currentPage === totalPages ? "btn-disabled" : "btn-outline"
                            }`}
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <span className="material-icons">chevron_right</span>
                        </button>
                    </div>
                </div>
            </TitleCard>
        </>
    );
}

export default Transactions;
