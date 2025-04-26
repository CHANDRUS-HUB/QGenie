import moment from "moment"
import { useEffect, useState } from "react"
import axios from "axios"
import TitleCard from "../../../components/Cards/TitleCard"
import { showNotification } from '../../common/headerSlice'
import InputText from '../../../components/Input/InputText'
import TextAreaInput from '../../../components/Input/TextAreaInput'
import ToogleInput from '../../../components/Input/ToogleInput'
import baseUrl from '../../../utils/URL'
import { toast, Toaster } from 'react-hot-toast'

function ProfileSettings() {
    const [userObj, setUserObj] = useState( "sdfsdf",);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [timezone, setTimezone] = useState("Fetching...");

    useEffect(() => {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(detectedTimezone);
    }, []);

    // If you're handling updates:
    const updateTimeValue = ({ updateType, value }) => {
        if (updateType === "timezone") {
            setTimezone(value);
        }
    };


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${baseUrl}/profile`, { withCredentials: true });
                setUserObj({
                    id: res.data.id,
                    username: res.data.username,
                    email: res.data.email,
                    phoneNumber: res.data.phoneNumber,
                    role: res.data.role
                });
                
            } catch (err) {
                console.error("Error fetching user:", err);
                if (err.response && err.response.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1000);
                }
            }
        };

        fetchUser();
    }, []);

  


    // Call API to update profile settings changes
    const updateProfile = async () => {
        setErrors([]);
        setLoading(true);

        try {
            const response = await axios.put(
                `${baseUrl}/update`,
                {
                    id: userObj.id,
                    username: userObj.username,
                    // phoneNumber: userObj.phoneNumber,
                    // role: userObj.role,
                    email: userObj.email
                },
                { withCredentials: true }
            );

            toast.success(response.data.message);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error("Session expired. Please log in again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
            }
            const msg = error.response?.data?.message;
            const errorList = error.response?.data?.errors || [];
            setErrors(errorList);
            toast.error(msg || "Error updating profile");
        } finally {
            setLoading(false);
        }
    };


    const updateFormValue = ({ updateType, value }) => {
        setErrors([]);
        setUserObj({ ...userObj, [updateType]: value });
    };


    return (
        <>

            <TitleCard title="Profile Settings" topMargin="mt-2">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText
                        labelTitle="Name"
                        value={userObj.username}
                        updateType="username"
                        updateFormValue={updateFormValue}
                    />
                  
                    <InputText
                        labelTitle="Email Id"
                        
                        value={userObj.email}
                        defaultValue={userObj.email} 
                        updateType="email"
                        updateFormValue={updateFormValue}
                    />
                    {/* <InputText
    labelTitle="Phone Number"
    value={userObj.phoneNumber}
    updateType="phoneNumber"
    updateFormValue={updateFormValue}
/> */}
                    <InputText
                    type="role"
                    readOnly={true}
                    
                        labelTitle="Role"
                        value={userObj.role}
                        updateType="role"
                        updateFormValue={updateFormValue}
                    />

                </div>
                <div className="divider" ></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputText labelTitle="Language" value="English" readOnly={true} updateFormValue={updateFormValue} />
                   
                   
                    <InputText
            labelTitle="Timezone"
            value={timezone}
            updateType="timezone"
            updateFormValue={updateTimeValue}
        />
                   
                </div>
                {errors.length > 0 && (
                    <ul className="mt-4 text-red-600 text-sm list-disc list-inside">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                )}


                <div className="mt-16">
                    <button
                        className={`btn btn-primary float-right ${loading ? "loading" : ""}`}
                        onClick={updateProfile}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </TitleCard>
        </>
    )
}


export default ProfileSettings