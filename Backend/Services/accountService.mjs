import { connect, disconnect } from '../Utils/mongodb.mjs';
import bcrypt from 'bcrypt';

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
        setError('Invalid email format');
        return;
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
        
        return result;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    } finally {
        if (db) {
            await disconnect();
        }
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
            throw new Error('User not found');
        }
        
        // Security: Compare hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }
        
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    } finally {
        if (db) {
            await disconnect();
        }
    }
}
