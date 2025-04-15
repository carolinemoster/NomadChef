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
export async function signUp(name, email, password) {
    try {
        const db = await getDb();
        const collection = db.collection('users');

        // Business logic validation
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Security: Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 12);

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
export async function getUserCountries(userId) {
    try {
        const db = await getDb();
        const usersCollection = db.collection('users');
        await usersCollection.updateOne(
            { _id: new ObjectId(String(userId)), countriesCompleted: { $exists: false } },
            { $set: { countriesCompleted: 0, countriesCompletedIDs: [] } }
        );
        const userCountries = await usersCollection.findOne({ _id: new ObjectId(String(userId)) }, { projection: { countriesCompletedIDs: 1, countriesCompleted: 1}});
        if (!userCountries) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }
        return {
            statusCode: 200,
            body: userCountries
        };

    }
    catch {
        return {
            statusCode: 404,
            body: { error: 'Unable to fetch user countries' }
        };
    }
} 
export async function updateUserCountries(userId, countryCode) {
    try {
        const db = await getDb();
        
        // First verify user exists in users collection
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(String(userId)) });
        if (!user) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }
        await usersCollection.updateOne(
            { _id: new ObjectId(String(userId)), countriesCompleted: { $exists: false } },
            { $set: { countriesCompleted: 0, countriesCompletedIDs: [] } }
        );
        await usersCollection.updateOne(
            { _id: new ObjectId(String(userId)) },
            {
                $addToSet: { countriesCompletedIDs: countryCode.code },
                $inc: { countriesCompleted: 1 }
            }
        );
        return {
            statusCode: 200,
            body: countryCode
        }
    }
    catch {
        return {
            statusCode: 404,
            body: { error: 'Unable to update user countries' }
        };
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

export async function updateUserData(id, updateData) {
    try {
        const db = await getDb();
        const collection = db.collection('users');
        
        // Check if user exists
        const user = await collection.findOne({ _id: new ObjectId(String(id)) });
        console.log("User found: ", user);
        if (!user) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }

        // Update user data
        await collection.updateOne(
            { _id: new ObjectId(String(id)) },
            { $set: updateData }
        );

        // Get updated user data (reusing the existing 'user' variable)
        const updatedUser = await collection.findOne({ _id: new ObjectId(String(id)) });
        const { password: _, ...userWithoutPassword } = updatedUser;
        
        return {
            statusCode: 200,
            body: userWithoutPassword
        };
    } catch (error) {
        console.error("Error updating user data:", error);
        return {
            statusCode: 500,
            body: { error: 'Internal server error' }
        };
    }
}