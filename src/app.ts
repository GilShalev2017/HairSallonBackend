import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

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


const cosmosConnectionStr = process.env.MONGODB_CONNECTION_STRING;

if (cosmosConnectionStr != null) {
  mongoose
    .connect(cosmosConnectionStr, {
    })
    .then(() => {
      console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
      console.error('Error connecting to Cosmos DB:', err);
    });
}
// const client = new CosmosClient(cosmosConnectionStr);
// const database = client.database("hair-sallon-clients");
// const container = database.container("hair-sallon-clients-container");

// // Example query
// const { resources } = await container.items.query("SELECT * FROM c").fetchAll();
// console.log(resources);

// Define a simple route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from TypeScript Node.js API!');
});

// Define routes (could be in a separate file)
app.post('/clients', (req: Request, res: Response) => {
  res.send('Client data saved!');
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