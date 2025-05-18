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
        confirmPassword: '',
        phoneNumber: '',
        role: 'Teacher',
        emailId: ''
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState('register');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const otpInputs = useRef([]);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage('');
        setRegisterObj({ ...registerObj, [updateType]: value });
        
        // Validate fields on change
        if (updateType === 'name') {
            if (value.trim() === '') {
                setNameError('Name is required!');
            } else if (!value.match(/^[a-zA-Z ]+$/)) {
                setNameError('Name can only contain letters');
            } else if (value.length > 30) {
                setNameError('Name cannot exceed 30 characters');
            } else {
                setNameError('');
            }
        }
        
        if (updateType === 'emailId') {
            if (value.trim() === '') {
                setEmailError('Email Id is required!');
            } else if (!value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
                setEmailError('Email Id is not valid');
            } else {
                setEmailError('');
            }
        }
        
        if (updateType === 'password') {
            validatePassword(value);
            // Also validate confirm password if it exists
            if (registerObj.confirmPassword) {
                validateConfirmPassword(registerObj.confirmPassword, value);
            }
        }
        
        if (updateType === 'confirmPassword') {
            validateConfirmPassword(value, registerObj.password);
        }
    };

    const validatePassword = (password) => {
        if (password.trim() === '') {
            setPasswordError('Password is required!');
        } else if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters');
        } else if (!/[A-Z]/.test(password)) {
            setPasswordError('Password must have one uppercase letter');
        } else if (!/[a-z]/.test(password)) {
            setPasswordError('Password must have one lowercase letter');
        } else if (!/[0-9]/.test(password)) {
            setPasswordError('Password must have one number');
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            setPasswordError('Password must have one special character');
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (confirmPassword, password) => {
        if (confirmPassword.trim() === '') {
            setConfirmPasswordError('Please confirm your password');
        } else if (confirmPassword !== password) {
            setConfirmPasswordError('Passwords do not match');
        } else {
            setConfirmPasswordError('');
        }
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

        // Validate all fields before submission
        if (registerObj.name.trim() === '') {
            setNameError('Name is required!');
            return;
        }
        if (registerObj.emailId.trim() === '') {
            setEmailError('Email Id is required!');
            return;
        }
        if (registerObj.password.trim() === '') {
            setPasswordError('Password is required!');
            return;
        }
        if (registerObj.confirmPassword.trim() === '') {
            setConfirmPasswordError('Please confirm your password');
            return;
        }
        if (nameError || emailError || passwordError || confirmPasswordError) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${baseUrl}/register`, {
                username: registerObj.name,
                email: registerObj.emailId,
                password: registerObj.password,
                role: registerObj.role
            }, { withCredentials: true });

            toast.success("OTP sent to your email.");
            setTimer(60);
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
                                    Oncustomchange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z ]/g, '');
                                        updateFormValue({ updateType: 'name', value });
                                    }}
                                />
                                {nameError && <ErrorText styleClass="mt-1">{nameError}</ErrorText>}

                                <InputText
                                    value={registerObj.emailId}
                                    updateType="emailId"
                                    containerStyle="mt-4"
                                    labelTitle="Email"
                                    updateFormValue={updateFormValue}
                                    Oncustomchange={(e) => {
                                        const value = e.target.value.replace(/[^a-zA-Z0-9@.]/g, '');
                                        updateFormValue({ updateType: 'emailId', value });
                                    }}
                                />
                                {emailError && <ErrorText styleClass="mt-1">{emailError}</ErrorText>}

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
                                {passwordError && <ErrorText styleClass="mt-1">{passwordError}</ErrorText>}

                                <div className="relative mt-4">
                                    <InputText
                                        value={registerObj.confirmPassword}
                                        type={showConfirmPassword ? "text" : "password"}
                                        updateType="confirmPassword"
                                        containerStyle="mt-4"
                                        labelTitle="Confirm Password"
                                        updateFormValue={updateFormValue}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 bottom-2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                                {confirmPasswordError && <ErrorText styleClass="mt-1">{confirmPasswordError}</ErrorText>}

                                <ErrorText styleClass="mt-6">{errorMessage}</ErrorText>
                                <button
                                    type="submit"
                                    className="btn mt-4 w-full bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold hover:scale-105 transition-all disabled:text-white disabled:cursor-not-allowed"
                                    disabled={loading || nameError || emailError || passwordError || confirmPasswordError}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : "Register"}
                                </button>

                                <p className="text-sm text-center mt-4">
                                    Already have an account? <Link to="/login" className="text-green-600 hover:underline">Login</Link>
                                </p>
                            </form>
                        </>
                    ) : (
                        <>
                        <div className="flex flex-col items-center justify-center h-full">
                            <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Verify Email</h2>
                            <p className="text-center text-sm text-gray-500 mb-4">
                                Enter the 6-digit code sent to {registerObj.emailId}
                            </p>
                            <form onSubmit={submitOTP} className="w-full">
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
                    
                                <ErrorText styleClass="mt-6 text-center">{errorMessage}</ErrorText>
                                <button 
                                    type="submit" 
                                    className="btn w-full mt-4 bg-gradient-to-r from-green-500 to-lime-500 text-white font-semibold hover:scale-105 transition-all"
                                >
                                    Verify OTP
                                </button>
                    
                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                setResendDisabled(true);
                                                setTimer(60);
                                                await resendOTP();
                                            } catch (error) {
                                                // setErrorMessage(error.response?.data?.message || "Failed to resend OTP");
                                                toast.error(error.response?.data?.message || "Failed to resend OTP");
                                                setResendDisabled(false);
                                            }
                                        }}
                                        className={`text-sm font-medium ${
                                            resendDisabled ? 'text-gray-400' : 'text-green-600 hover:underline'
                                        }`}
                                        disabled={resendDisabled}
                                    >
                                        {resendDisabled ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                    </button>
                                </div>
                    
                                <p className="text-sm text-center mt-4">
                                    Want to change email? <button 
                                        type="button" 
                                        onClick={() => {
                                            setStep('register');
                                            setErrorMessage('');
                                        }} 
                                        className="text-green-600 hover:underline"
                                    >
                                        Go back
                                    </button>
                                </p>
                            </form>
                        </div>
                    </>
                    )}
                </motion.div>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}

export default Register;