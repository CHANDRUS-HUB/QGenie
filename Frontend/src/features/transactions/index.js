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
import { FaEye } from "react-icons/fa6";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Avatar Component
const UserAvatar = ({ user }) => {
  return (
    <div className="mask mask-circle w-12 h-12 bg-gray-200 flex items-center justify-center">
      <img
        src={user.avatar || "/default-avatar.png"}
        alt={`${user.name}'s avatar`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = "/default-avatar.png";
        }}
      />
    </div>
  );
};

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
      <SearchBar
        searchText={searchText}
        styleClass="w-64 btn-md"
        setSearchText={setSearchText}
        placeholderText="Search by Name or Email"
      />
    
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
    
      <div className="dropdown dropdown-end">
        <label
          tabIndex={0}
          className="btn btn-md flex items-center gap-2 bg-gradient-to-r from-green-500 to-lime-400 text-white hover:shadow-lg transition"
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
  const [allTrans, setAllTrans] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

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
        role: u.role, // Changed from 'location' to 'role' for clarity
        amount: Math.floor(Math.random() * 500) + 100,
        books: u.Books || [], // Ensure books is always an array
        date: u.created_at,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random`,
      }));

      setAllTrans(transactions);
      setTrans(transactions);
    } catch (err) {
      console.error("Error fetching user data:", err);
      showNotification({ message: "Failed to fetch users", status: 0 });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const removeFilter = () => {
    setTrans(allTrans);
    setCurrentPage(1);
  };

  const applyFilter = (role) => {
    const filtered = allTrans.filter((t) => t.role === role);
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

  const handleViewBook = (user) => {
    navigate(`/app/Users/view-book/${user.id}`);
  };

  const handleViewQuestions = (user) => {
    navigate(`/app/Users/view-questions/${user.id}`);
  };

  const totalPages = Math.ceil(trans.length / ITEMS_PER_PAGE);
  const paginatedData = trans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <TitleCard
        title={`Total Users: ${allTrans.length} | Total Books: ${allTrans.reduce(
          (acc, user) => acc + (user.books?.length || 0),
          0
        )}`}
        topMargin="mt-2"
        style={{ background: "green" }}
        TopSideButtons={
          <TopSideButtons
            applySearch={applySearch}
            applyFilter={applyFilter}
            removeFilter={removeFilter}
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
                <th>View Questions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td>
                    <div className="flex items-center space-x-3">
                      <UserAvatar user={user} />
                      <div>
                        <div className="font-bold">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{moment(user.date).format("DD MMM YYYY hh:mm A")}</td>
                  <td>
                    <span
                      className="badge badge-ghost badge-sm cursor-help"
                      title={
                        user.books?.length > 0
                          ? user.books.map((book) => book.title).join(", ")
                          : "No books"
                      }
                    >
                      {user.books?.length || 0} Books
                    </span>
                  </td>
                  <td>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-gradient-to-r from-blue-200 to-sky-200 text-sky-500 transition duration-300 ease-in-out flex items-center justify-center shadow-md"
                      onClick={() => handleViewBook(user)}
                      title="View Book"
                    >
                      <FaEye />
                    </motion.button>
                  </td>
                  <td>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg hover:bg-gradient-to-r from-green-200 to-lime-200 text-green-500 transition duration-300 ease-in-out flex items-center justify-center shadow-md"
                      onClick={() => handleViewQuestions(user)}
                      title="View Questions"
                    >
                      <FaEye />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </motion.table>

          {/* Pagination */}
          <div className="flex justify-center mt-4 space-x-2 items-center">
            <button
              className={`btn btn-sm rounded-full ${
                currentPage === 1 ? "btn-disabled" : "btn-outline"
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon />
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
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </TitleCard>
    </>
  );
}

export default Transactions;