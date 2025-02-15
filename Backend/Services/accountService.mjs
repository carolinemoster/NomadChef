import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDb } from '../Utils/mongodb.mjs';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email 
        }, 
        JWT_SECRET, 
        { expiresIn: '12h' }
    );
}


// Sign up for an account 
export async function signUp(userData) {
    let db;
    try {
        console.log('Connecting to DB...');
        db = await connect();
        console.log('Database connected');

        // Ensure that the `collection` is available
        const collection = db.collection('users');
        console.log('Collection selected');

        const existingUser = await collection.findOne({ email: userData.email.toLowerCase() });
        console.log('Existing user check:', existingUser);

        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        console.log('Password hashed');

        const newUser = {
            ...userData,
            email: userData.email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await collection.insertOne(newUser);
        console.log('User inserted:', result);

        const token = generateToken({ _id: result.insertedId, email: newUser.email });
        console.log('Token generated:', token);

        return {
            statusCode: 201,
            body: {
                message: "Sign Up Successful!",
                token
            }
        };
    } catch (error) {
        console.error('Error in signUp:', error);
        throw error; // Let the calling function handle it
    } finally {
        if (db) await disconnect();
    }
}

//Login to an account (check if user exists and password is correct)
export async function login(email, password) {
    try {
        const db = await getDb();
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
    } 
}

export function verifyToken(token) {
    try {
        console.log('JWT Secret:', process.env.JWT_SECRET);
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export async function getUserData(id) {
    try {
        const db = await getDb();
        const collection = db.collection('users');
   
        // Find user by ID (from the decoded token)
        const user = await collection.findOne({ _id: new ObjectId(String(id)) });
        console.log("User found: ", user);
        if (!user) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }

        // Exclude the password before sending the response
        const { password, ...userWithoutPassword } = user;
        
        return {
            statusCode: 200,
            body: userWithoutPassword
        };
    } catch (error) {
        console.error("Error getting user data:", error);
        return {
            statusCode: 500,
            body: { error: 'Internal server error' }
        };
    }
}
