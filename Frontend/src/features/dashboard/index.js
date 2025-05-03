import { useEffect, useState } from 'react'
import axios from 'axios'
import baseUrl from '../../utils/URL'

import DashboardStats from './components/DashboardStats'
import AmountStats from './components/AmountStats'
import PageStats from './components/PageStats'
import LineChart from './components/LineChart'
import BarChart from './components/BarChart'
import DoughnutChart from './components/DoughnutChart'
import UserChannels from './components/UserChannels'
import DashboardTopBar from './components/DashboardTopBar'

import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon'
import { FaBook, FaBookOpen, FaLock } from 'react-icons/fa'

import { useDispatch } from 'react-redux'
import { showNotification } from '../common/headerSlice'

function Dashboard() {
    const dispatch = useDispatch()
    const [statsData, setStatsData] = useState([])
    const [userGrowthData, setUserGrowthData] = useState([])
    const [bookDistributionData, setBookDistributionData] = useState([])
    const [barChartData, setBarChartData] = useState([])

    const fetchDashboardData = async () => {
        try {
            const [usersRes, booksRes, publicBooksRes] = await Promise.all([
                axios.get(`${baseUrl}/get-all-users`, { withCredentials: true }),
                axios.get(`${baseUrl}/get-all-books`, { withCredentials: true }),
                axios.get(`${baseUrl}/get-all-publicbooks`, { withCredentials: true }),
            ])

            const users = usersRes.data.users
            const books = booksRes.data.books
            const publicBooks = publicBooksRes.data.books

            // Stats Data
            const newStats = [
                {
                    title: 'Total Users',
                    value: users.length,
                    icon: <UserGroupIcon className="w-8 h-8 text-blue-500" />,
                    description: '↗︎ Users Count',
                },
                {
                    title: 'Total Books',
                    value: books.length,
                    icon: <FaBook className="w-8 h-8 text-sky-500" />,
                    description: '↗︎ All Books',
                },
                {
                    title: 'Public Books',
                    value: publicBooks.length,
                    icon: <FaBookOpen className="w-8 h-8 text-green-600" />,
                    description: 'Accessible by everyone',
                },
                {
                    title: 'Private Books',
                    value: books.length - publicBooks.length,
                    icon: <FaLock className="w-8 h-8 text-red-500" />,
                    description: 'Restricted access books',
                },
            ]

            setStatsData(newStats)

            // User Growth Data for Line Chart
            const userGrowth = users.map((user) => ({
                date: user.created_at.split('T')[0], // Assuming `created_at` is a timestamp
            }))
            const userGrowthCounts = userGrowth.reduce((acc, curr) => {
                acc[curr.date] = (acc[curr.date] || 0) + 1
                return acc
            }, {})
            setUserGrowthData(Object.entries(userGrowthCounts).map(([date, count]) => ({ date, count })))

            // Book Distribution Data for Doughnut Chart
            const bookDistribution = {
                public: publicBooks.length,
                private: books.length - publicBooks.length,
            }
            setBookDistributionData(bookDistribution)

            // Bar Chart Data
            const barData = [
                { label: 'Total Books', value: books.length },
                { label: 'Public Books', value: publicBooks.length },
                { label: 'Private Books', value: books.length - publicBooks.length },
            ]
            setBarChartData(barData)
        } catch (err) {
            dispatch(showNotification({ message: 'Failed to load dashboard data', status: 0 }))
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const updateDashboardPeriod = (newRange) => {
        dispatch(
            showNotification({
                message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`,
                status: 1,
            })
        )
    }

    return (
        <>
            <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />

            {/* Stats Tiles */}
            <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {statsData.map((d, k) => (
                    <DashboardStats key={k} {...d} colorIndex={k} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <LineChart data={userGrowthData} />
                <BarChart data={barChartData} />
            </div>

            {/* More Stats */}
            <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
                <AmountStats />
                <PageStats />
            </div>

            {/* User Channels and Doughnut */}
            <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
                <UserChannels />
                <DoughnutChart data={bookDistributionData} />
            </div>
        </>
    )
}

export default Dashboard
