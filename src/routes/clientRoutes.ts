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

router.post('/clients/:clientId/treatments', async (req: Request<{ clientId: string }>, res: Response) => {
  try {
    const { clientId } = req.params;
    const { date, description, price } = req.body;

    // Ensure all fields are provided
    if ( !date || !description || !price) {
      return res.status(400).send({ error: 'Missing required treatment fields' });
    }

    const treatment: ITreatment = {
      date: new Date(date),
      description,
      price,
    };

    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).send({ error: 'Client not found' });
    }

    client.treatments.push(treatment);
    await client.save();

    res.status(200).send(client);
  } catch (err) {
    res.status(500).send({ error: 'Failed to add treatment', details: err });
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
