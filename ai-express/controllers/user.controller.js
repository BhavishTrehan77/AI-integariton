import { Login, Register } from "../services/User.services.js"



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async (req, resp) => {
    try {
        const { name, email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            return resp.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        if (password.length < 6) {
            return resp.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const data = await Register(req.body);
        resp.status(201).json({
            success: true,
            message: "User registered successfully",
            data
        });
    } catch (err) {
        resp.status(400).json({
            success: false,
            message: err.message || "Signup failed"
        });
    }
};

export const login = async (req, resp) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return resp.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        if (!EMAIL_REGEX.test(email.trim())) {
            return resp.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        const data = await Login(email, password);
        resp.status(200).json({
            success: true,
            message: "Login successful",
            data
        });
    } catch (err) {
        const isAuthError = 
            err.message.includes("No account found") || 
            err.message.includes("Incorrect password");

        resp.status(isAuthError ? 401 : 400).json({
            success: false,
            message: err.message || "Invalid credentials"
        });
    }
};

