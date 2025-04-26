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
export async function getUserPoints(id) {
    try {
        const db = await getDb();
        const collection = db.collection('users');
        await usersCollection.updateOne(
            { _id: new ObjectId(String(id)), points: { $exists: false } },
            { $set: { points: 0, challengesCompleted: 0} }
        );
        const user = await collection.findOne({ _id: new ObjectId(String(id)) },  { projection: { points: 1, challengesCompleted: 1}});
        console.log("User found: ", user);
        if (!user) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }
        return {
            statusCode: 200,
            body: user
        };
    }
    catch (error) {
        console.error("Error getting user points:", error);
        return {
            statusCode: 500,
            body: { error: 'Getting user points failed' }
        };
    }
}
export async function addUserPoints(id, pointAmount) {
    try {
        const db = await getDb();
        const collection = db.collection('users');
        const user = await collection.findOne({ _id: new ObjectId(String(id)) });
        console.log("User found: ", user);
        if (!user) {
            return {
                statusCode: 404,
                body: { error: 'User not found' }
            };
        }
        await usersCollection.updateOne(
            { _id: new ObjectId(String(id)), points: { $exists: false } },
            { $set: { points: 0, challengesCompleted: 0} }
        );
        await usersCollection.updateOne(
            { _id: new ObjectId(String(id)) },
            {
                $inc: {
                    points: parseInt(pointAmount.points),
                    challengesCompleted: 1 
                }
            }
        );
        return {
            statusCode: 200,
            body: pointAmount
        };
    }
    catch (error) {
        console.error("Error updating user points:", error);
        return {
            statusCode: 500,
            body: { error: 'User Points failed' }
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

export async function getUserChallenges(userId) {
    try {
        const db = await getDb();
        
        // Verify user exists in users collection
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw new Error('User not found');
        }
        
        const challengesCollection = db.collection('users_challenges');
        const query = { userId: new ObjectId(userId) };
        // Get recipes
        const challenges = await challengesCollection
            .find(query)
            .toArray();
            
        return {
            statusCode: 200,
            body: {challenges: challenges}
        };
    }
    catch {
        return {
            statusCode: 400,
            body: {error: "Failed to get user challenges"}
        };
    }
}
export async function addUserChallenges(userId, challenges) {
    try {
        const db = await getDb();
        
        // Verify user exists in users collection
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!user) {
            throw new Error('User not found');
        }
        
        const challengesCollection = db.collection('users_challenges');

            
        const formattedChallenges = challenges.map(challenge => ({
            userId: new ObjectId(userId),
            text: challenge.text,
            condition: challenge.condition,
            amountRemaining: challenge.amountRemaining,
            amountCompleted: challenge.amountCompleted,
            completed: Boolean(challenge.completed),
            type: parseInt(challenge.type)
        }));

        // Insert challenges into the collection
        const result = await challengesCollection.insertMany(formattedChallenges);

        return {
            statusCode: 200,
            body: { insertedCount: result.insertedCount, insertedIds: result.insertedIds }
        };
    }
    catch {
        return {
            statusCode: 400,
            body: {error: "Failed to add user challenges"}
        };
    }
}
export async function updateUserChallenge(challengeId) {
    try {
        const db = await getDb();
        
        // Verify user exists in users collection
        
        const challengesCollection = db.collection('users_challenges');
        const challenge = await challengesCollection.findOne({ _id: new ObjectId(challengeId) });
        if (!challenge) {
        throw new Error("Challenge not found");
        }


        // Insert challenges into the collection
        const newAmountCompleted = challenge.amountCompleted + 1;
        const isCompleted = newAmountCompleted >= challenge.amountRemaining;

    
        const result = await challengesCollection.updateOne(
        { _id: new ObjectId(challengeId) },
        {
            $set: { completed: isCompleted },
            $inc: { amountCompleted: 1 }
        }
        );

        return {
            statusCode: 200,
            body: { isCompleted: isCompleted}
        };
    }
    catch {
        return {
            statusCode: 400,
            body: {error: "Failed to add user challenges"}
        };
    }
}

export async function getLeaderboard(limit = 5) {
    try {
        const db = await getDb();
        const collection = db.collection('users');
        
        // Find top users sorted by points in descending order
        // Only retrieve necessary fields (name and points)
        const leaderboard = await collection
            .find(
                { points: { $exists: true } }, // Only include users who have points
                { projection: { name: 1, points: 1 } } // Only return name and points fields
            )
            .sort({ points: -1 }) // Sort by points in descending order
            .limit(limit) // Limit to specified number of results (default 5)
            .toArray();
        
        return {
            statusCode: 200,
            body: { leaderboard }
        };
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        return {
            statusCode: 500,
            body: { error: 'Failed to retrieve leaderboard' }
        };
    }
}