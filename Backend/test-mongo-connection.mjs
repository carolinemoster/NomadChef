import { db } from './Utils/mongodb.mjs';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        // Test 1: Basic Connection
        const ping = await db.command({ ping: 1 });
        console.log('MongoDB Connection successful:', ping);

        // Test 2: Create a test user
        const testUser = {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: await bcrypt.hash('password123', 12),
            createdAt: new Date()
        };

        const result = await db.collection('users').insertOne(testUser);
        console.log('Test user created:', result.insertedId);

        // Test 3: Find the user
        const foundUser = await db.collection('users').findOne({ _id: result.insertedId });
        console.log('Found user:', foundUser.email);

        // Test 4: Delete the test user
        await db.collection('users').deleteOne({ _id: result.insertedId });
        console.log('Test user deleted');

        //Delete all users
        //await db.collection('users').deleteMany({});
        //console.log('All users deleted');

    } catch (error) {
        console.error('Error during connection test:', error);

    } finally {
        const client = db.client;
        await client.close();
        console.log('Connection closed');
    } 
}


testConnection();
