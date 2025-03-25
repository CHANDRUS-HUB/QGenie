const validateUserInput = (username, email,password, phoneNumber, role) => {
    const errors = [];
    if (!username || !/^[A-Za-z]+$/.test(username) || username.trim().length < 3) {
        errors.push("Username is required, must be at least 3 characters, and contain only alphabets.");
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        errors.push("Invalid email format.");
    }
    if (!password || password.length < 6 || !/\d/.test(password)) {
        errors.push("Password must be at least 6 characters and contain at least one number.");
    }

    if (phoneNumber && !/^\d{12}$/.test(phoneNumber)) {
        errors.push("Phone number must be exactly 12 digits.");
    }

    if (role && !["Admin", "Teacher", "Student"].includes(role)) {
        errors.push("Invalid role. Allowed values: Admin, Teacher, Student.");
    }

    return errors;
};

module.exports = { validateUserInput };
