import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Main API Router
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('AI Course Generator API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
