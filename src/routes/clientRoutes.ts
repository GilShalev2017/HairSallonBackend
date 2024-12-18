import express, { Request, Response } from 'express';
import Client, { ITreatment } from '../models/Client';

const router = express.Router();

router.post('/clients', async (req: Request, res: Response) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.status(201).send(client);
  } catch (err) {
    res.status(400).send({ error: 'Failed to create client', details: err });
  }
});

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

router.post('/clients/:clientId/treatments', async (req: Request, res: Response) => {
  const { clientId } = req.params;
  const { date, remark, jobs, totalPrice } = req.body;

  // Log the incoming request parameters
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
      remark : remark,
      totalPrice: totalPrice,
      jobs : jobs,
    };

    // Log the treatment object
    console.log('Created treatment object:', treatment);

    // Find the client by ID
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

router.delete('/clients/:clientId', async (req: Request<{ clientId: string }>, res: Response) => {
  try {
    const { clientId } = req.params;

    const deletedClient = await Client.findByIdAndDelete(clientId);

    if (!deletedClient) {
      return res.status(404).send({ error: 'Client not found' });
    }

    res.status(200).send({ message: 'Client deleted successfully', client: deletedClient });
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete client', details: err });
  }
});

export default router;
