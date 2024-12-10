import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB (replace with your connection string)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://<your-db-url>', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from TypeScript Node.js API!');
});

// Define routes (could be in a separate file)
app.post('/clients', (req: Request, res: Response) => {
  // Your database interaction logic here
  res.send('Client data saved!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
