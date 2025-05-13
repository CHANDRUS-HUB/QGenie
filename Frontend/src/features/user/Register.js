import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import baseUrl from '../../utils/URL';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

function Register() {
    const INITIAL_REGISTER_OBJ = {
        name: '',
        password: '',
        phoneNumber: '',
        role: 'Teacher',
        emailId: ''
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState('register');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(320);
    const [resendDisabled, setResendDisabled] = useState(true);

    const otpInputs = useRef([]);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage('');
        setRegisterObj({ ...registerObj, [updateType]: value });
    };

    useEffect(() => {
        let countdown;
        if (step === 'otp' && timer > 0) {
            countdown = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setResendDisabled(false);
        }
        return () => clearInterval(countdown);
    }, [step, timer]);

    const submitForm = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (registerObj.name.trim() === '')
            return setErrorMessage('Name is required!');
        else if (!registerObj.name.match(/^[a-zA-Z ]+$/))
            return setErrorMessage('Name can only contain letters');
        if (registerObj.emailId.trim() === '')
            return setErrorMessage('Email Id is required!');
        else if (!registerObj.emailId.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))
            return setErrorMessage('Email Id is not valid');
        if (registerObj.password.trim() === '')
            return setErrorMessage('Password is required!');
        else if (registerObj.password.length < 8)
            return setErrorMessage('Password must be at least 8 characters');
        else if (!/[A-Z]/.test(registerObj.password))
            return setErrorMessage('Password must have one uppercase letter');
        else if (!/[a-z]/.test(registerObj.password))
            return setErrorMessage('Password must have one lowercase letter');
        else if (!/[0-9]/.test(registerObj.password))
            return setErrorMessage('Password must have one number');
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(registerObj.password))
            return setErrorMessage('Password must have one special character');

        try {
            setLoading(true);
            const response = await axios.post(`${baseUrl}/register`, {
                username: registerObj.name,
                email: registerObj.emailId,
                password: registerObj.password,
                role: registerObj.role
            }, { withCredentials: true });

            toast.success("OTP sent to your email.");
            setTimer(320);
            setResendDisabled(true);
            setStep("otp");
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Registration failed");
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const submitOTP = async (e) => {
        e.preventDefault();
        const enteredOTP = otp.join('');
        if (enteredOTP.length !== 6) return setErrorMessage("Enter 6-digit OTP");

        try {
            const response = await axios.post(`${baseUrl}/verify-otp`, {
                username: registerObj.name,
                email: registerObj.emailId,
                password: registerObj.password,
                role: registerObj.role,
                otp: enteredOTP
            }, { withCredentials: true });

            toast.success("Registered successfully");
            navigate('/login');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "OTP verification failed");
            toast.error(error.response?.data?.message || "OTP verification failed");
        }
    };

    const resendOTP = async () => {
        try {
          setResendDisabled(true);
          setTimer(60);
    
          await axios.post(`${baseUrl}/resend-otp`, {
            email: registerObj.emailId,
            username: registerObj.name,
          });
    
          toast.success('OTP resent to your email.');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to resend OTP');
          setResendDisabled(false);
        }
      };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-lime-100 via-white to-green-100 flex items-center justify-center">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-2 grid-cols-1">
                <div className="hidden md:block">
                    <LandingIntro />
                </div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-10"
                >
                    {step === "register" ? (
                        <>
                            <h2 className='text-3xl font-bold mb-4 text-center text-green-600'>Create Account</h2>
                            <form onSubmit={submitForm}>
                                <InputText
                                    value={registerObj.name}
                                    updateType="name"
                                    containerStyle="mt-4"
                                    labelTitle="Full Name"
                                    updateFormValue={updateFormValue}
                                />
                                <InputText
                                    value={registerObj.emailId}
                                    updateType="emailId"
                                    containerStyle="mt-4"
                                    labelTitle="Email"
                                    updateFormValue={updateFormValue}
                                />
                                <div className="relative mt-4">
                                    <InputText
                                        value={registerObj.password}
                                        type={showPassword ? "text" : "password"}
                                        updateType="password"
                                        containerStyle="mt-4"
                                        labelTitle="Password"
                                        updateFormValue={updateFormValue}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 bottom-2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                <ErrorText styleClass="mt-6">{errorMessage}</ErrorText>
                                <button type="submit" className="btn mt-4 w-full bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold hover:scale-105 transition-all">
                                    {loading ? "Submitting..." : "Register"}
                                </button>

                                <p className="text-sm text-center mt-4">
                                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
                                </p>
                            </form>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Verify Email</h2>
                            <p className="text-center text-sm text-gray-500 mb-4">Enter the 6-digit code sent to your email</p>
                            <form onSubmit={submitOTP}>
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (otpInputs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            className="w-12 h-12 rounded-lg border-2 text-center text-xl font-semibold focus:ring-2 ring-lime-400 focus:outline-none transition-all duration-200"
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/, '');
                                                const newOtp = [...otp];
                                                newOtp[index] = val;
                                                setOtp(newOtp);
                                                if (val && index < 5) otpInputs.current[index + 1]?.focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Backspace" && !otp[index] && index > 0) {
                                                    otpInputs.current[index - 1]?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                <ErrorText styleClass="mt-6">{errorMessage}</ErrorText>
                                <button type="submit" className="btn btn-success w-full mt-4">
                                    Verify OTP
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={resendOTP}
                                        className={`text-sm font-medium ${
                                            resendDisabled ? 'text-gray-400' : 'text-green-600 hover:underline'
                                        }`}
                                        disabled={resendDisabled}
                                    >
                                        Resend OTP {resendDisabled && `in ${timer}s`}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}

export default Register;
