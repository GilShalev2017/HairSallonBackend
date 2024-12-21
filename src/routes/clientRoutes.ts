import express, { Request, Response } from 'express';
import Client, { IClient, ITreatment } from '../models/Client';
import { FilterQuery } from 'mongoose';
import multer from 'multer';
import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Multer upload middleware setup
const upload = multer({
  dest: tempDir,  // Ensure multer uses the correct temp folder
});

// Azure Blob Storage Configuration
const AZURE_STORAGE_CONNECTION_STRING = 'DefaultEndpointsProtocol=https;AccountName=hairsalonstorage;AccountKey=W2slXtC0HhDmZv2qV/YXYcDxPFOPTdsLNXcAeEimidnaj9z5JWOdtL28QKAgWLt9JmQYNmKcoBJt+AStky96pQ==;EndpointSuffix=core.windows.net';

const CONTAINER_NAME = 'hairsalonconatainer';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage connection string not found.');
}
// Add a client
router.post('/clients', async (req: Request, res: Response) => {

  try {

    const client = new Client(req.body);

    console.log(`Received request to add client with fields: ${client}`);

    await client.save();

    console.log(`Successfully added client: ${client}`);

    res.status(201).send(client);

  } catch (err) {

    console.error(`Error: Client failed to save. details: ${err}`);

    res.status(400).send({ error: 'Failed to create client', details: err });
  }
});

//Searh for clients by first name and / or last name
router.get('/clients', async (req: Request, res: Response) => {
  const searchQuery = req.query.searchQuery as string;

  console.log(`Received request to search for client with searchQuery: ${searchQuery}`);

  const query: FilterQuery<IClient> = {};

  if (searchQuery) {
    const terms = searchQuery.trim().split(' ');

    console.log(`Found terms: ${terms}`);

    if (terms.length === 2) {
      query.$and = [
        { firstName: new RegExp(`^${terms[0]}`, 'i') },
        { lastName: new RegExp(`^${terms[1]}`, 'i') },
      ];
    } else if (terms.length === 1) {
      query.$or = [
        { firstName: new RegExp(`^${terms[0]}`, 'i') },
        { lastName: new RegExp(`^${terms[0]}`, 'i') },
      ];
    }
  }

  try {

    const clients = await Client.find(query);

    console.log(`Found clients: ${clients}`);

    res.send(clients);

  } catch (err) {

    res.status(500).send({ error: 'Failed to fetch clients', details: err });
  }
});

//Add treatment
router.post('/clients/:clientId/treatments', async (req: Request, res: Response) => {

  const { clientId } = req.params;

  const { date, remark, jobs, totalPrice } = req.body;

  console.log(`Received request to add treatment for client ID: ${clientId}`);

  console.log(`Request body: Date: ${date}, Remark: ${remark}, Jobs: ${JSON.stringify(jobs)},totalPrice: ${totalPrice}`);

  try {
    // Validate the presence of required fields
    if (!date || !Array.isArray(jobs) || jobs.length === 0) {

      console.error('Error: Missing required treatment fields or jobs array is empty');

      return res.status(400).send({ error: 'Missing required treatment fields or jobs array is empty' });
    }

    // Create a new treatment object
    const treatment = {
      date: new Date(date),
      remark: remark,
      totalPrice: totalPrice,
      jobs: jobs,
    };

    console.log('Created treatment object:', treatment);

    const client = await Client.findById(clientId);

    if (!client) {

      console.error(`Error: Client with ID ${clientId} not found`);

      return res.status(404).send({ error: 'Client not found' });
    }

    // Add the new treatment to the client's treatments array
    client.treatments.push(treatment);

    // Save the updated client document
    await client.save();

    // Log the success
    console.log(`Successfully added treatment for client ID: ${clientId}`);

    // Respond with the updated client data
    res.status(200).send(client);

  } catch (err: unknown) {

    if (err instanceof Error) {

      console.error('Error: Failed to add treatment', err.stack);

    } else {

      console.error('An unknown error occurred:', err);
    }
  }

});

//Delete a client
router.delete('/clients/:clientId', async (req: Request<{ clientId: string }>, res: Response) => {

  try {
    const { clientId } = req.params;

    console.log(`Received request to delete client for client ID: ${clientId}`);

    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(404).send({ error: 'Client not found' });
    }

    console.log(`Successfully deleted client with ID: ${clientId}`);

    res.status(200).send({ message: 'Client deleted successfully', client: deletedClient });

  } catch (err) {

    res.status(500).send({ error: 'Failed to delete client', details: err });

  }
});

//Update a client
router.put('/clients/:clientId', async (req: Request<{ clientId: string }>, res: Response) => {

  const { clientId } = req.params;

  try {

    const updateData = req.body;

    console.log(`Received request to update client with ID: ${clientId}`);

    const updatedClient = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true,       // Return the updated document
      runValidators: true, // Ensure the update adheres to the schema
    });

    if (!updatedClient) {
      return res.status(404).send({ error: 'Client not found' });
    }

    console.log(`Successfully updated client with ID: ${clientId}`);

    res.status(200).send({ message: 'Client updated successfully', client: updatedClient });

  } catch (err) {

    console.error(`Error updating client with ID: ${clientId}`, err);

    res.status(500).send({ error: 'Failed to update client', details: err });
  }
});

// Check client duplicity
router.get('/clients/check-duplicate', async (req, res) => {

  const { phone } = req.query;

  console.log(`Received request to check if client exist by phone: ${phone}`);

  const existingClient = await Client.findOne({ phone });

  if (existingClient) {

    console.log(`Found client with the same phone: ${phone}`);

    return res.status(200).json({ exists: true });
  }

  return res.status(200).json({ exists: false });

});

const uploadToAzureBlob = async (filePath: string, fileName: string): Promise<string> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  await containerClient.createIfNotExists();
  const blobClient = containerClient.getBlockBlobClient(fileName);

  try {
    await blobClient.uploadFile(filePath);  // Upload the file from the correct path
    console.log(`File uploaded successfully: ${fileName}`);
    return blobClient.url;
  } catch (err) {
    console.error('Error uploading file to Azure Blob Storage:', err);
    throw new Error('Failed to upload file');
  }
};

// Endpoint to upload a file to Azure Blob Storage
// router.post('/clients/upload', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     console.error('Error: No file uploaded.');
//     return res.status(400).send({ error: 'No file uploaded.' });
//   }

//   // Directly use req.file.path without joining __dirname
//   const tempFilePath = req.file.path;  // Multer already gives the relative path from the 'dest' directory
//   const fileName = req.file.originalname;

//   console.log(`Received request to upload file: ${fileName}`);
//   console.log(`Temp file path: ${tempFilePath}`);

//   try {
//     const blobUrl = await uploadToAzureBlob(tempFilePath, fileName);
//     console.log(`File uploaded successfully to Azure Blob Storage: ${blobUrl}`);

//     res.status(200).send({
//       message: 'File uploaded successfully.',
//       fileUrl: blobUrl,
//     });
//   } catch (err) {
//     console.error('Error uploading file to Azure Blob Storage:', err.stack || err);
//     res.status(500).send({
//       error: 'Error uploading file to Azure Blob Storage.',
//       details: err,
//     });
//   } finally {
//     try {
//       // Correctly delete the temp file with the full path
//       fs.unlinkSync(tempFilePath);
//       console.log(`Temporary file deleted: ${tempFilePath}`);
//     } catch (cleanupError) {
//       console.error(`Error deleting temporary file: ${cleanupError}`);
//     }
//   }
// });
router.post('/clients/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.error('Error: No file uploaded.');
    return res.status(400).send({ error: 'No file uploaded.' });
  }

  // Get the clientId from the request body
  const { clientId } = req.body;

  if (!clientId) {
    console.error('Error: No clientId provided.');
    return res.status(400).send({ error: 'No clientId provided.' });
  }

  // Directly use req.file.path without joining __dirname
  const tempFilePath = req.file.path;  // Multer already gives the relative path from the 'dest' directory
  const fileName = req.file.originalname;

  console.log(`Received request to upload file: ${fileName}`);
  console.log(`Temp file path: ${tempFilePath}`);

  try {
    // Upload the file to Azure Blob Storage
    const blobUrl = await uploadToAzureBlob(tempFilePath, fileName);
    console.log(`File uploaded successfully to Azure Blob Storage: ${blobUrl}`);

    // Find the client by its ID
    const client = await Client.findById(clientId);

    if (!client) {
      console.error(`Error: Client with ID ${clientId} not found`);
      return res.status(404).send({ error: 'Client not found' });
    }

    // Update the client's storage path (you can customize the field name)
    client.storagePath = blobUrl; // Assuming you have a field `storagePath` in your Client schema

    // Save the updated client document
    await client.save();
    console.log(`Updated client with new storage path: ${blobUrl}`);

    res.status(200).send({
      message: 'File uploaded successfully.',
      fileUrl: blobUrl,
      client: client,
    });
  } catch (err:any) {
    console.error('Error uploading file to Azure Blob Storage:', err.stack || err);
    res.status(500).send({
      error: 'Error uploading file to Azure Blob Storage.',
      details: err,
    });
  } finally {
    try {
      // Correctly delete the temp file with the full path
      fs.unlinkSync(tempFilePath);
      console.log(`Temporary file deleted: ${tempFilePath}`);
    } catch (cleanupError) {
      console.error(`Error deleting temporary file: ${cleanupError}`);
    }
  }
});



export default router;

//Searh for clients by first name and / or last name
// router.get('/clients', async (req: Request, res: Response) => {

//   const { firstName, lastName } = req.query;

//   const query: any = {};

//   if (firstName) query.firstName = new RegExp(firstName as string, 'i');

//   if (lastName) query.lastName = new RegExp(lastName as string, 'i');

//   try {

//     const clients = await Client.find(query);

//     res.send(clients);

//   } catch (err) {

//     res.status(500).send({ error: 'Failed to fetch clients', details: err });
//   }
// });