import express, { Request, Response } from 'express';
import Client, { ITreatment } from '../models/Client';

const router = express.Router();

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

  const { firstName, lastName } = req.query;

  const query: any = {};

  if (firstName) query.firstName = new RegExp(firstName as string, 'i');

  if (lastName) query.lastName = new RegExp(lastName as string, 'i');

  try {

    const clients = await Client.find(query);

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


export default router;

