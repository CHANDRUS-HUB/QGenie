import { useState , useEffect } from 'react'
import { Link } from 'react-router-dom'
import LandingIntro from './LandingIntro'
import ErrorText from  '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon'
import axios from 'axios'
import baseUrl from '../../utils/URL'
// import { showNotification } from "../common/headerSlice"
// import { useDispatch } from 'react-redux'
import {toast, Toaster} from 'react-hot-toast'

function ForgotPassword() {
    const INITIAL_USER_OBJ = {
        emailId: "",
        otp: "",
        newPassword: ""
    }

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [otpSent, setOtpSent] = useState(false)
    const [userObj, setUserObj] = useState(INITIAL_USER_OBJ)
    const [timer, setTimer] = useState(10) // 10 minutes in seconds
    const [canResend, setCanResend] = useState(false) 
    // const dispatch = useDispatch()


  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
        interval = setInterval(() => {
            setTimer(prev => prev - 1)
        }, 1000)
    } else if (timer === 0) {
        setCanResend(true)
        clearInterval(interval)
    }

    return () => clearInterval(interval)
}, [otpSent, timer])

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}



    // Handle form submission for OTP
    const submitForm = async (e) => {
        e.preventDefault()
        setErrorMessage("")

        // Basic validation
        if (userObj.emailId.trim() === "") return setErrorMessage("Email Id is required!");
        if (userObj.otp.trim() === "") return setErrorMessage("OTP is required!");
        if (userObj.newPassword.trim() === "") return setErrorMessage("New Password is required!");
        if (userObj.newPassword.length < 6 || !/\d/.test(userObj.newPassword)) {
            return setErrorMessage("Password must be at least 6 characters long and contain at least one number.");
        }

        setLoading(true);
        try {
            // Call API to reset password with OTP
            const response = await axios.post(`${baseUrl}/reset-password`, {
                email: userObj.emailId,
                otp: userObj.otp,
                newPassword: userObj.newPassword
            });

            // If password reset is successful
            if (response.status === 200) {
                // Redirect to login page after password reset
                // dispatch( showNotification({ message: response.data.message, status: 1 }))
                toast.success(response.data.message)
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 2000);
            
            } else {
                setErrorMessage(response.data.message || "Something went wrong");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Error resetting password");
        } finally {
            setLoading(false);
        }
    }

    // Update form input value
    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("")
        setUserObj({ ...userObj, [updateType]: value })
    }

    // Handle email submission to send OTP
    const submitEmailForm = async (e) => {
        
       
        e.preventDefault()
        setErrorMessage("")

        // Basic validation for emailId
        if (userObj.emailId.trim() === "") return setErrorMessage("Email Id is required!");

        setLoading(true);
        try {
            // Call API to send OTP
            const response = await axios.post(`${baseUrl}/forgot-password`, { email: userObj.emailId });

            if (response.status === 200) {
                setOtpSent(true);
                setTimer(10); // Reset timer to 10 minutes
                setCanResend(false);
                toast.success(response.data.message)
            } else {
                setErrorMessage(response.data.message || "Something went wrong");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Error sending OTP");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center">
            <div className="card mx-auto w-full max-w-5xl shadow-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
                    <div className=''>
                        <LandingIntro />
                    </div>
                    <div className='py-24 px-10'>
                        <h2 className='text-2xl font-semibold mb-2 text-center'>
                            Forgot Password
                        </h2>

                        {
                            !otpSent &&
                            <>
                                <p className='my-8 font-semibold text-center'>
                                    We will send a password reset link to your email Id
                                </p>
                                <form onSubmit={submitEmailForm}>
                                    <div className="mb-4">
                                        <InputText
                                            type="emailId"
                                            value={userObj.emailId}
                                            updateType="emailId"
                                            containerStyle="mt-4"
                                            labelTitle="Email Id"
                                            updateFormValue={updateFormValue}
                                        />
                                    </div>

                                    <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                                    <button type="submit" className={"btn mt-2 w-full btn-primary"}>
                                   { (loading ? " loading..." : "Send OTP")}  
                                    </button>

                                    <div className='text-center mt-4'>
                                        Don't have an account yet? 
                                        <Link to="/register">
                                            <button className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                                                Register
                                            </button>
                                        </Link>
                                    </div>
                                </form>
                            </>
                        }

                        {
                            otpSent &&
                            <>
                                <p className='my-8 font-semibold text-center'>
                                    Please enter the OTP sent to your email, and your new password
                                </p>
                                <form onSubmit={submitForm}>

                                    <div className="mb-4">
                                        <InputText
                                            type="otp"
                                            value={userObj.otp}
                                            updateType="otp"
                                            containerStyle="mt-4"
                                            labelTitle="OTP"
                                            updateFormValue={updateFormValue}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <InputText
                                            type="password"
                                            value={userObj.newPassword}
                                            updateType="newPassword"
                                            containerStyle="mt-4"
                                            labelTitle="New Password"
                                            updateFormValue={updateFormValue}
                                        />
                                    </div>

                                    <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                                    <button type="submit" className={"btn mt-2 w-full btn-primary" }>
                                    {(loading ? " loading..." : "Reset Password") }   
                                    </button>
                                    <div className='text-center mt-4'>
                                        {timer > 0 ? (
                                            <span className="text-gray-500">
                                                Resend OTP in {formatTime(timer)}</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    submitEmailForm(e);
                                                  
                                                }}
                                                className={`w-full px-4 py-2 rounded-md transition duration-200 ${
                                                    canResend
                                                        ? "bg-green-600 text-white hover:bg-green-700"
                                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                                disabled={!canResend}
                                            >
                                                Resend OTP
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </>
                        }

                    </div>
                </div>
            </div>
            <Toaster />
        </div>
    )
}

export default ForgotPassword
