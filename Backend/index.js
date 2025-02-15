import express from 'express';
import cors from 'cors';
import { handler as authHandler } from './Handlers/authHandler.mjs';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/auth/login', (req, res) => {
    const event = {
        path: '/auth/login',
        httpMethod: 'POST',
        body: JSON.stringify(req.body)
    };
    authHandler(event)
        .then(result => {
            res.status(result.statusCode).json(JSON.parse(result.body));
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.post('/auth/signup', (req, res) => {
    const event = {
        path: '/auth/signup',
        httpMethod: 'POST',
        body: JSON.stringify(req.body)
    };
    authHandler(event)
        .then(result => {
            res.status(result.statusCode).json(JSON.parse(result.body));
        })
        .catch(error => {
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
