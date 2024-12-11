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

// const corsOptions = {
//   origin: 'http://localhost:4200', // Replace with your Angular app URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
//   allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
// };

// app.use(cors(corsOptions));

app.use(cors());

app.use(express.json());

// Connect to MongoDB
connectToDatabase();

// Routes
app.use('/api', clientRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send("Welcome to the Edgardo's Hair Salon!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


//const cosmosConnectionString = process.env.COSMOS_DB_CONNECTION_STRING;
// const USERNAME = 'hairsallonbacke-server';
// const HOST = 'hairsallonbacke-server.mongo.cosmos.azure.com';
// const PORT = 10255;
// const PASSWORD = 'DioKgt52Sax1DP1So09ea0yBrDGnmvwOLBFFGKgaCQcM1EM4NuPvWEsSLodSZec8ayqYkfsufEC2ACDbirSBJw==';
// const cosmosConnectionStr = `mongodb://${USERNAME}:${PASSWORD}@${HOST}:${PORT}/?ssl=true&replicaSet=globaldb&retrywrites=false`;
//const cosmosConnectionStr = 'mongodb://hairsallonbacke-server:DioKgt52Sax1DP1So09ea0yBrDGnmvwOLBFFGKgaCQcM1EM4NuPvWEsSLodSZec8ayqYkfsufEC2ACDbirSBJw==@hairsallonbacke-server.mongo.cosmos.azure.com:10255/hairsallonbacke-database?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@hairsallonbacke-server@';//process.env.MONGODB_CONNECTION_STRING;

// const client = new CosmosClient(cosmosConnectionStr);
// const database = client.database("hair-sallon-clients");
// const container = database.container("hair-sallon-clients-container");

// // Example query
// const { resources } = await container.items.query("SELECT * FROM c").fetchAll();
// console.log(resources);

// Define a simple route

// Connection string to your MongoDB database
// const connectionString = 'mongodb://localhost:27017';

// // Connect to MongoDB
// mongoose
//   .connect(connectionString, {
//   })
//   .then(() => {
//     console.log('Connected to MongoDB successfully');
//   })
//   .catch((err) => {
//     console.error('Error connecting to MongoDB:', err);
//   });