import 'dotenv/config'
import User from '../models/User.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const Register = async (body) => {
    try {
        const normalizedEmail = body.email?.toLowerCase().trim();
        if (!normalizedEmail) {
            throw new Error("Email is required");
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            throw new Error("An account with this email already exists");
        }

        const Data = await User.create({
            ...body,
            email: normalizedEmail,
            name: body.name?.trim() || normalizedEmail.split('@')[0]
        });
        return Data;
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("An account with this email already exists");
        }
        throw new Error(err.message || "Failed to register user");
    }
}

export const Login = async (email, password) => {
    try {
        const normalizedEmail = email?.toLowerCase().trim();
        if (!normalizedEmail || !password) {
            throw new Error("Email and password are required");
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            throw new Error("No account found with this email");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Incorrect password. Please try again.");
        }

        const secretKey = process.env.AccKey || 'express_ai_fallback_secret_key_2026';

        const AccToken = jwt.sign(
            { id: user._id },
            secretKey,
            { expiresIn: "10h" }
        );

        return {
            message: "Login success",
            AccToken,
            user: {
                id: user._id,
                name: user.name || normalizedEmail.split('@')[0],
                email: user.email
            }
        };

    } catch (err) {
        throw new Error(err.message || "Login failed");
    }
}

