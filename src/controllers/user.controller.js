const { pool } = require('../config/db.config');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

// The JWT_SECRET definition has been removed, as it will now be read from process.env

// --- 1. SIGN UP Controller Logic (POST /api/auth/register) ---
const signup = async (req, res) => {
    // Uses the requestBody parameters from Claude's spec: fullName, phoneNumber
    const { email, password, fullName, phoneNumber } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: 'Email, password, and full name are required.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (email, password_hash, full_name, phone_number)
            VALUES ($1, $2, $3, $4)
            RETURNING id, email, full_name, total_points, is_verified;
        `;
        const values = [email, password_hash, fullName, phoneNumber];
        
        const result = await pool.query(query, values);
        const newUser = result.rows[0];

        // *** UPDATED to use process.env.JWT_SECRET and process.env.JWT_EXPIRATION ***
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        return res.status(201).json({ 
            data: {
                user: newUser,
                token 
            }
        });

    } catch (error) {
        if (error.code === '23505') { 
            return res.status(409).json({ code: "VALIDATION_ERROR", message: 'Email already exists.' });
        }
        console.error('Sign-up error:', error);
        return res.status(500).json({ code: "INTERNAL_ERROR", message: 'Internal Server Error during registration.' });
    }
};


// --- 2. LOGIN Controller Logic (POST /api/auth/login) ---
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ code: "VALIDATION_ERROR", message: 'Email and password are required.' });
    }

    try {
        const query = 'SELECT id, email, password_hash, is_banned, total_points, full_name FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ code: "INVALID_CREDENTIALS", message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ code: "INVALID_CREDENTIALS", message: 'Invalid email or password.' });
        }

        if (user.is_banned) {
            return res.status(403).json({ code: "UNAUTHORIZED", message: 'Account is banned due to policy violation.' });
        }

        // *** UPDATED to use process.env.JWT_SECRET and process.env.JWT_EXPIRATION ***
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });

        return res.status(200).json({ 
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    totalPoints: user.total_points
                },
                token 
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ code: "INTERNAL_ERROR", message: 'Internal Server Error during login.' });
    }
};

module.exports = {
    signup, 
    login
};