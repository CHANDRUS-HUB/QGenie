import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "Student",
        termsAccepted: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validateField = (name, value) => {
        let error = "";

        switch (name) {
            case "fullName":
                if (!value) error = "Full Name is required.";
                break;

            case "email":
                if (!value) error = "Email is required.";
                else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email format.";
                break;

            case "password":
                if (!value) error = "Password is required.";
                else if (value.length < 8 || !/\d/.test(value))
                    error = "Password must be at least 8 characters and include a number.";
                break;

            case "confirmPassword":
                if (value !== formData.password) error = "Passwords do not match.";
                break;

            case "termsAccepted":
                if (!value) error = "You must agree to the Terms & Conditions.";
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedValue = type === "checkbox" ? checked : value;

        setFormData({
            ...formData,
            [name]: updatedValue,
        });

        setErrors({
            ...errors,
            [name]: validateField(name, updatedValue),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = Object.keys(formData).reduce((acc, field) => {
            const error = validateField(field, formData[field]);
            if (error) acc[field] = error;
            return acc;
        }, {});

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            alert("Registration successful!");
            navigate("/signin");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    {/** Full Name **/}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                        {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                    </div>

                    {/** Email Address **/}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    {/** Phone Number **/}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                    </div>

                    {/** Password **/}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-sm text-blue-600 mt-1"
                        >
                            {showPassword ? "Hide" : "Show"} Password
                        </button>
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    {/** Confirm Password **/}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input input-bordered w-full"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>

                    {/** Terms & Conditions **/}
                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                            />
                            <span className="ml-2">I agree to the Terms & Conditions</span>
                        </label>
                        {errors.termsAccepted && <p className="text-red-500 text-sm">{errors.termsAccepted}</p>}
                    </div>

                    {/** Sign Up Button **/}
                    <button className="btn btn-primary w-full" type="submit">Sign Up</button>
                    <p className="mt-4 text-center">
                        Already have an account? <a href="/signin" className="text-blue-600">Sign In</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default SignUp;
