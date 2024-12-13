import mongoose, { Schema, Document } from 'mongoose';

export interface IColor {
  colorNumber: string;
  colorAmount: number;
}

export interface IJob {
  jobType: string;
  price: number;
  colors?: IColor[];
}

export interface ITreatment {
  date: Date;
  remark?: string;
  totalPrice: number;
  jobs: IJob[];
}

interface IClient extends Document {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  treatments: ITreatment[];
}

const ColorSchema: Schema = new Schema({
  colorNumber: { type: String, required: true },
  colorAmount: { type: Number, required: true },
});

const JobSchema: Schema = new Schema({
  jobType: { type: String, required: true },
  price: { type: Number, required: true },
  colors: { type: [ColorSchema], default: [] },
});

const TreatmentSchema: Schema = new Schema({
  date: { type: Date, required: true },
  remark: { type: String, enum: [null, ''], required: false },
  totalPrice: { type: Number, required: true },
  jobs: { type: [JobSchema], default: [] },
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
