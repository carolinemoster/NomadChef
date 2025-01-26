import { connect, disconnect } from '../Utils/mongodb.mjs';

// Sign up for an account 
async function signUp(name, email, password) {
    let db;
    try {
        db = await connect();
        const collection = db.collection('users');

        // Check if user already exists
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const result = await collection.insertOne({ 
            name, 
            email: email.toLowerCase(), 
            password,
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
async function login(email, password) {
    let db;
    try {
        db = await connect();
        const collection = db.collection('users');
        
        // Find user by email
        const user = await collection.findOne({ email: email.toLowerCase() });
        
        // Check if user exists and password matches
        if (!user) {
            throw new Error('User not found');
        }
        
        if (user.password !== password) {
            throw new Error('Invalid password');
        }
        
        return user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    } finally {
        if (db) {
            await disconnect();
        }
    }
}
