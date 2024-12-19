import express, { Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import clientRoutes from './routes/clientRoutes';
import { connectToDatabase } from './config/dbConfig';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true })); 

connectToDatabase();

app.use('/api', clientRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send("Welcome to the Edgardo's Hair Salon!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});