import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import { Link } from 'react-router-dom'
import TemplatePointers from '../../features/user/components/TemplatePointers'
import { motion } from 'framer-motion'
import axios from 'axios'
import baseUrl from '../../utils/URL'


function InternalPage() {
  const dispatch = useDispatch()
  const [roledata, setRoledata] = useState("")


  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${baseUrl}/profile`, { withCredentials: true });
      if (response.status === 200) {
      setRoledata(response.data.role);
       
      }
    } catch (error) {
     
      
     
       
    } finally {
      
    }
  };

  useEffect(() => {
    // Initialize daisy UI themes
    fetchProfile();
  }, []);



  useEffect(() => {
    dispatch(setPageTitle({ title: "Welcome" }))
  }, [dispatch])

  return (
    <div className="sm470:h-screen h-[620px]  bg-gradient-to-t from-green-900 via-emerald-600 to-teal-500 text-white flex items-center justify-center px-4 rounded-lg dark:shadow-lg dark:shadow-green-500">

      <motion.div
        className="text-center w-full max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="sm470:text-6xl text-3xl font-extrabold leading-tight  drop-shadow-lg"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          Welcome to <span className="text-yellow-300">QGenie</span>
        </motion.h1>
        <motion.p
          className="text-lg sm:text-2xl font-light  tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          {roledata === "Teacher" ? "Let’s spark some curiosity — start generating questions now!":"  Your personalized dashboard awaits. Let’s get started!"}
        
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mb-10 flex justify-center"
        >
          <TemplatePointers />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Link to={roledata === "Teacher" ? "/app/Upload-Books" : "/app/dashboard"}>
            <button className="px-8 py-3 animate-bounce bg-gradient-to-r from-green-500 to-lime-400 text-lg font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
              Get Started
            </button>
          </Link>

        </motion.div>
      </motion.div>
    </div>
  )
}

export default InternalPage
