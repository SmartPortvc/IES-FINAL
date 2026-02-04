import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

/**
 * Security Middleware
 * Checks for a valid API Key in the X-API-Key header
 */
const authenticateAPI = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing API Key' });
    }
    next();
};

/**
 * GET /api/vessels
 * Returns all vessel details from Firestore
 */
app.get('/api/vessels', authenticateAPI, async (req, res) => {
    try {
        // 1. Fetch all ports to create a name map
        const portsCollection = collection(db, 'ports');
        const portsSnapshot = await getDocs(portsCollection);
        const portMap = {};
        portsSnapshot.docs.forEach(doc => {
            portMap[doc.id] = doc.data().portName;
        });

        // 2. Fetch all vessels
        const vesselsCollection = collection(db, 'vessels');
        const snapshot = await getDocs(vesselsCollection);

        const vessels = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                portName: portMap[data.portId] || 'Unknown Port',
                // Format timestamps/dates if they are Firestore Timestamps
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                entryDate: data.entryDate?.toDate ? data.entryDate.toDate() : data.entryDate,
                sailedOutDate: data.sailedOutDate?.toDate ? data.sailedOutDate.toDate() : data.sailedOutDate,
                arrivalDateTime: data.arrivalDateTime?.toDate ? data.arrivalDateTime.toDate() : data.arrivalDateTime,
                pobDateTime: data.pobDateTime?.toDate ? data.pobDateTime.toDate() : data.pobDateTime,
                berthingDateTime: data.berthingDateTime?.toDate ? data.berthingDateTime.toDate() : data.berthingDateTime,
                pobDepartureDateTime: data.pobDepartureDateTime?.toDate ? data.pobDepartureDateTime.toDate() : data.pobDepartureDateTime,
                clearanceIssuedOn: data.clearanceIssuedOn?.toDate ? data.clearanceIssuedOn.toDate() : data.clearanceIssuedOn,
            };
        });

        res.json({
            success: true,
            count: vessels.length,
            data: vessels
        });
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(port, () => {
    console.log(`Vessel API server running on port ${port}`);
    console.log(`Secure endpoint: http://localhost:${port}/api/vessels`);
});
