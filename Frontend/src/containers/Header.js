import { themeChange } from 'theme-change'
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import BellIcon from '@heroicons/react/24/outline/BellIcon'
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon'
import MoonIcon from '@heroicons/react/24/outline/MoonIcon'
import SunIcon from '@heroicons/react/24/outline/SunIcon'
import { openRightDrawer } from '../features/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil'
import axios from 'axios'
import { toast, Toaster } from 'react-hot-toast'


import baseUrl from '../utils/URL'

import { NavLink, Routes, Link, useLocation } from 'react-router-dom'


function Header() {

  const dispatch = useDispatch()
  const { noOfNotifications, pageTitle } = useSelector(state => state.header)
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"))
  const [username, Setusername] = useState("");

  useEffect(() => {
    themeChange(false)
    if (currentTheme === null) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setCurrentTheme("dark")
      } else {
        setCurrentTheme("light")
      }
    }
    // 👆 false parameter is required for react project
  }, [])


  // Opening right sidebar for notification
  const openNotification = () => {
    dispatch(openRightDrawer({ header: "Notifications", bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION }))
  }


  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function logoutUser() {
    try {
      await axios.post(`${baseUrl}/logout`, null, { withCredentials: true });
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  }

  //get user profile
  async function getUserProfile() {
    try {
      const response = await axios.get(`${baseUrl}/profile`, { withCredentials: true });
      Setusername(response.data)

    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }
  useEffect(() => {
    getUserProfile()
  }, [])


  return (
    // navbar fixed  flex-none justify-between bg-base-300  z-10 shadow-md

    <>
      <div className="navbar sticky top-0 bg-base-100  z-20 shadow-md ">


        {/* Menu toogle for mobile view or small screen */}
        <div className="flex-1">
          <label htmlFor="left-sidebar-drawer" className="btn  drawer-button">
            <Bars3Icon className="h-5 inline-block w-5" /></label>
          <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
        </div>



        <div className="flex-none ">




          <label className="swap ">
            <input type="checkbox" />
            <SunIcon data-set-theme="light" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "dark" ? "swap-on" : "swap-off")} />
            <MoonIcon data-set-theme="dark" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "light" ? "swap-on" : "swap-off")} />
          </label>



          {/* <button className="btn btn-ghost ml-4  btn-circle" onClick={() => openNotification()}>
                    <div className="indicator">
                        <BellIcon className="h-6 w-6"/>
                        {noOfNotifications > 0 ? <span className="indicator-item badge badge-secondary badge-sm">{noOfNotifications}</span> : null }
                    </div>
                </button> */}


          {/* Profile icon, opening menu on click */}
          <div className="dropdown dropdown-end ml-4">
            <div className="flex items-center gap-2">
              {username.role === "Admin" && (
                <span className="text-sm font-semibold text-gray-600">Admin</span>
              )}

              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full overflow-hidden">
                  <img src="/user.jpg" alt="User profile picture" />
                </div>
              </label>
            </div>

            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li className="justify-between">
                <Link to={'/app/settings-profile'}>
                  View Profile
                  {/* <span className="badge">New</span> */}
                </Link>
              </li>
              {/* <li className=''><Link to={'/app/settings-billing'}>Bill History</Link></li> */}
              <div className="divider mt-0 mb-0"></div>
              <li>
                <a onClick={() => setShowLogoutModal(true)}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Toaster />
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <dialog id="logout_modal" className="modal modal-open ">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Logout</h3>
            <p className="py-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                className="btn btn-error"
                onClick={async () => {
                  await logoutUser();
                  setShowLogoutModal(false);
                }}
              >
                Yes, Logout
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}

export default Header