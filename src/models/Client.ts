import mongoose, { Schema, Document } from 'mongoose';

export  interface ITreatment {
  date: Date;
  description: string;
  price: number;
}

interface IClient extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  treatments: ITreatment[];
}

const TreatmentSchema: Schema = new Schema({
  date: { type: Date, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const ClientSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  treatments: { type: [TreatmentSchema], default: [] },
});

const Client = mongoose.model<IClient>('Client', ClientSchema);
export default Client;
