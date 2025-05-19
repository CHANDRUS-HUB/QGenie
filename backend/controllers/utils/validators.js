const validateUserInput = (username, email,password, role) => {
    const errors = [];
     if (!username || !/^[A-Za-z\s]+$/.test(username) || username.trim().length < 3) {
        errors.push("Username is required, must be at least 3 characters, and contain only alphabets and spaces.");
    }


    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push("Invalid email format.");
    }
    if (!password || password.length < 6 || !/\d/.test(password)) {
        errors.push("Password must be at least 6 characters and contain at least one number.");
    }

   

    if (role && !["Admin", "Teacher"].includes(role)) {
        errors.push("Invalid role. Allowed values: Admin, Teacher.");
    }

    return errors;
};

module.exports = { validateUserInput };
