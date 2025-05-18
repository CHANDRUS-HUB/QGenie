import {useState, useRef} from 'react'
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom'
import LandingIntro from './LandingIntro'
import ErrorText from  '../../components/Typography/ErrorText'
import InputText from '../../components/Input/InputText'
import baseUrl from '../../utils/URL'
import { FaEye, FaEyeSlash } from 'react-icons/fa';
// import { showNotification } from "../common/headerSlice"
// import { useDispatch } from 'react-redux';
import { toast, Toaster } from 'react-hot-toast'

function Login(){

    const INITIAL_LOGIN_OBJ = {
        password : "",
        emailId : ""
    }

    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ)
    const [showPassword, setShowPassword] = useState(false);
    // const dispatch = useDispatch()
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const submitForm = async (e) =>{
        e.preventDefault()
        setErrorMessage("")

        if(loginObj.emailId.trim() === "")return setErrorMessage("Email Id is required! ")

        else if(!loginObj.emailId.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/))return setErrorMessage("Email Id is not valid")

        if(loginObj.password.trim() === "")return setErrorMessage("Password is required!")
       try {
           

            const response = await axios.post(`${baseUrl}/login`, {
               
                email: loginObj.emailId,
                password: loginObj.password,
            }, { withCredentials: true });

            if (response.data.message) {
           toast.success(response.data.message)
            //  setTimeout(() => {
                navigate('/app/welcome');
                window.location.href= "/app/welcome" ;
            //   }, 500); 
            }
            setLoading(true);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Login failed");
           toast.error(error.response?.data?.message || "Login failed")
            
        } finally {
            setLoading(false);
        }
    }

    const updateFormValue = ({updateType, value}) => {
        setErrorMessage("")
        setLoginObj({...loginObj, [updateType] : value})
    }

    return(
        <div className="min-h-screen bg-base-200 flex items-center">
            <div className="card mx-auto w-full max-w-5xl shadow-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
                    <div className=''>
                        <LandingIntro />
                    </div>
                    <div className='py-24 px-10'>
                        <h2 className='text-2xl font-semibold mb-2 text-center'>Login</h2>
                        <form onSubmit={(e) => submitForm(e)}>

                            <div className="mb-4">

                                <InputText type="emailId" value={loginObj.emailId} updateType="emailId" containerStyle="mt-4" labelTitle="Email Id" updateFormValue={updateFormValue}/>

                                <div className="relative mt-4">
                                    <InputText 
                                        value={loginObj.password}  
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
                        </div>

                        <div className='text-right text-primary'><Link to="/forgot-password"><span className="text-sm  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Forgot Password?</span></Link>
                        </div>

                        <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                        <button type="submit" className={"btn mt-2 w-full bg-gradient-to-r from-green-500 to-lime-500 text-white transition duration-300 ease-in-out transform hover:scale-105" + (loading ? " loading" : "")}>Login</button>

                        <div className='text-center mt-4'>Don't have an account yet? <Link to="/register"><span className="  inline-block  hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Register</span></Link></div>
                    </form>
                </div>
            </div>
            </div>
            <Toaster />
        </div>
    )
}

export default Login