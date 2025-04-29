import { useState, useRef } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import LandingIntro from './LandingIntro'
import ErrorText from '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import baseUrl from '../../utils/URL'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast'
// import { showNotification } from "../common/headerSlice"
// import { useDispatch } from 'react-redux';


function Register() {


    const INITIAL_REGISTER_OBJ = {
        name: "",
        password: "",
        phoneNumber: "",
        role: "Teacher",
        emailId: ""
    }

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ)
    const [showPassword, setShowPassword] = useState(false);
    // const dispatch = useDispatch()
    const navigate = useNavigate();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // const handleclick = () => {
    //     console.log("clicked")
    //     toast.success("Registered successfully")
    // }

    const submitForm = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (registerObj.name.trim() === "") return setErrorMessage("Name is required!");
        else if (!registerObj.name.match(/^[a-zA-Z ]+$/)) {
            return setErrorMessage("Name can only contain alphabetical characters");
        }
        if (registerObj.emailId.trim() === "") return setErrorMessage("Email Id is required!");
        else if (!registerObj.emailId.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
            return setErrorMessage("Email Id is not valid");
        }
        if (registerObj.password.trim() === "") return setErrorMessage("Password is required!");
        // password must be atleast 6 characters long
        else if (registerObj.password.length < 8) {
            return setErrorMessage("Password must be at least 8 characters long");
        }
        else if (!/[A-Z]/.test(registerObj.password)) {
            return setErrorMessage("Password must contain at least one uppercase letter");
        }
        else if (!/[a-z]/.test(registerObj.password)) {
            return setErrorMessage("Password must contain at least one lowercase letter");
        }
        else if (!/[0-9]/.test(registerObj.password)) {
            return setErrorMessage("Password must contain at least one number");
        }
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(registerObj.password)) {
            return setErrorMessage("Password must contain at least one special character");
        }

        // if (registerObj.phoneNumber.trim() === "") return setErrorMessage("Phone Number is required!");
        // //phone number is 12 digit and only numbers
        // else if (!registerObj.phoneNumber.match(/^\d{12}$/)) {
        //     return setErrorMessage("Phone number is not valid");
        // }


        try {


            const response = await axios.post(`${baseUrl}/verify-otp`, {
                username: registerObj.name,
                email: registerObj.emailId,
                password: registerObj.password,
                // phoneNumber: registerObj.phoneNumber,
                role: registerObj.role

            }, { withCredentials: true });

            if (response.data.message) {
                //  dispatch( showNotification({ message: "resgistered successfully", status: 1 }))
                toast.success("Registered successfully")
                // setTimeout(() => {
                    navigate('/login');
                // }, 1000);
            }
            setLoading(true);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Registration failed");
            // dispatch(showNotification({ message:error.response?.data?.message, status: 0 }))
            toast.error(error.response?.data?.message || "Registration failed")
        } finally {
            setLoading(false);
        }
    }

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("")
        setRegisterObj({ ...registerObj, [updateType]: value })
    }

    return (
        <div className="min-h-screen bg-base-200 flex items-center">
            <div className="card mx-auto w-full max-w-5xl  shadow-xl">
                <div className="grid  md:grid-cols-2 grid-cols-1  bg-base-100 rounded-xl">
                    <div className=''>
                        <LandingIntro />
                    </div>
                    <div className='py-24 px-10'>
                        <h2 className='text-2xl font-semibold mb-2 text-center'>Register</h2>
                        <form onSubmit={(e) => submitForm(e)}>

                            <div className="mb-4">

                                <InputText value={registerObj.name} updateType="name" containerStyle="mt-4" labelTitle="Name" updateFormValue={updateFormValue} Oncustomchange={(e) => {
                                    const newName = e.target.value;

                                    // Update state
                                    updateFormValue({ updateType: "name", value: newName });

                                    // Validate new value
                                    if (newName.trim() === "") {
                                        setErrorMessage("Name is required!");
                                    } else if (!/^[a-zA-Z ]+$/.test(newName)) {
                                        setErrorMessage("Name can only contain alphabetical characters");
                                    } else {
                                        setErrorMessage(""); // Clear error if valid
                                    }
                                }} />

                                <InputText value={registerObj.emailId} updateType="emailId" containerStyle="mt-4" labelTitle="Email Id" updateFormValue={updateFormValue} Oncustomchange={(e) => {
                                    const newEmail = e.target.value; // ✅ Fix: Get the actual typed value
                                    // Update state
                                    updateFormValue({ updateType: "emailId", value: newEmail });
                                    // Validate new value
                                    if (newEmail.trim() === "") {
                                        setErrorMessage("Email is required!");
                                    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(newEmail)) {
                                        setErrorMessage("Invalid email address");
                                    } else {
                                        setErrorMessage(""); // Clear error if valid
                                    }

                                }} />
                                {/* 
                                <InputText value={registerObj.phoneNumber} updateType="phoneNumber" containerStyle="mt-4" labelTitle="Phone Number" updateFormValue={updateFormValue} Oncustomchange={(e)=>{

                                }} /> */}


                                <div className="relative mt-4">
                                    <InputText
                                        value={registerObj.password}
                                        type={showPassword ? "text" : "password"}
                                        updateType="password"
                                        containerStyle="mt-4"
                                        labelTitle="Password"
                                        updateFormValue={updateFormValue}
                                        Oncustomchange={(e) => {
                                            const newPassword = e.target.value; // ✅ Fix: Get the actual typed value
                                            // Update state
                                            updateFormValue({ updateType: "password", value: newPassword });
                                            // Validate new value
                                            if (newPassword.trim() === "") {
                                                setErrorMessage("Password is required!");
                                            } else if (newPassword.length < 8) {
                                                setErrorMessage("Password must be at least 8 characters long");
                                            } else if (!/[A-Z]/.test(newPassword)) {
                                                setErrorMessage("Password must contain at least one uppercase letter");
                                            } else if (!/[a-z]/.test(newPassword)) {
                                                setErrorMessage("Password must contain at least one lowercase letter");
                                            } else if (!/[0-9]/.test(newPassword)) {
                                                setErrorMessage("Password must contain at least one number");
                                            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                                                setErrorMessage("Password must contain at least one special character");
                                            } else {
                                                setErrorMessage(""); // Clear error if valid
                                            }
                                        }
                                        }
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 bottom-2 transform -translate-y-1/2 text-gray-500 focus:outline-none"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                            </div>

                            <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>



                            <button type="submit" className={"btn mt-2 w-full btn-primary"}> {(loading ? " loading...." : "register")}</button>

                            <div className='text-center mt-4'>Already have an account? <Link to="/login"><span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Login</span></Link></div>
                        </form>
                        {/* <button onClick={handleclick}>dfljdskf</button> */}
                    </div>
                </div>
            </div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
        </div>



    )
}

export default Register