import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const fetchAllVessels = async () => {
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

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            portName: portMap[data.portId] || 'Unknown Port',
            // Format timestamps/dates
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
};
