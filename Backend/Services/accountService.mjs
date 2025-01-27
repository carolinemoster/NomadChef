import { connect, disconnect } from '../Utils/mongodb.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
    );
}


// Sign up for an account 
export async function signUp(name, email, password) {
    // Business logic validation
    if (!name || !email || !password) {
        throw new Error('Name, email and password are required');
    }
    if (password.length < 5) {
        throw new Error('Password must be at least 5 characters long');
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new Error('Invalid email format');
    }
    let db;
    try {
        db = await connect();
        const collection = db.collection('users');

        // Business logic validation
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Security: Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await collection.insertOne({ 
            name, 
            email: email.toLowerCase(), 
            password: hashedPassword,
            createdAt: new Date()
        });
        
        const token = generateToken({ _id: result.insertedId, email });
        
        return {
            statusCode: 201,
            body: {
                user: { _id: result.insertedId, name, email },
                token
            }
        };
    } catch (error) {
        console.error("Error signing up:", error);
        return {
            statusCode: error.message === 'Email already registered' ? 409 : 500,
            body: { error: error.message }
        };
    } finally {
        if (db) await disconnect();
    }
}

//Login to an account (check if user exists and password is correct)
export async function login(email, password) {
    let db;
    try {
        db = await connect();
        const collection = db.collection('users');
        
        const user = await collection.findOne({ email: email.toLowerCase() });
        if (!user) {
            return {
                statusCode: 401,
                body: { error: 'Invalid credentials' }
            };
        }
        
        // Security: Compare hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return {
                statusCode: 401,
                body: { error: 'Invalid credentials' }
            };
        }
        
        const token = generateToken(user);
        
        const { password: _, ...userWithoutPassword } = user;
        return {
            statusCode: 200,
            body: {
                user: userWithoutPassword,
                token
            }
        };
    } catch (error) {
        console.error("Error logging in:", error);
        return {
            statusCode: 500,
            body: { error: 'Internal server error' }
        };
    } finally {
        if (db) await disconnect();
    }
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
