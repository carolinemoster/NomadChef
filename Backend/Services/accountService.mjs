import { connect, disconnect } from '../Utils/mongodb.mjs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function generateToken(user) {
    console.log("Generating token for user:", user);
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
export async function signUp(name, email, password) {
    let db;
    try {
        db = await connect();
        const collection = db.collection('users');

        console.log("Signing up user in accountService:", name, email, password);


        // First, check if email is already registered
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        console.log("Email is not registered, proceeding to hash password");


        // Security: Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await collection.insertOne({ 
            name, 
            email: email.toLowerCase(), 
            password: hashedPassword,
            createdAt: new Date()
        });

        console.log("Password hashed, inserting user into database");
        console.log("Result:", result);

        const token = generateToken({ _id: result.insertedId, email });
        console.log("Token:", token);

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
