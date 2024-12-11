import mongoose from 'mongoose';

export const connectToDatabase = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const connectionString = isProduction
    ? process.env.AZURE_COSMOS_CONNECTIONSTRING
    : process.env.MONGODB_CONNECTION_STRING;

  if (!connectionString) {
    console.error(
      `Error: ${
        isProduction ? 'AZURE_COSMOS_CONNECTIONSTRING' : 'MONGODB_CONNECTION_STRING string'
      } is not set in environment variables.`
    );
    process.exit(1);
  }

  mongoose
  .connect(connectionString, {})
  .then(() => {
    console.log(
      `Connected to ${isProduction ? 'CosmosDB' : 'local MongoDB'} successfully`
    );
  })
  .catch((err) => {
    console.error(`Error connecting to ${isProduction ? 'CosmosDB' : 'local MongoDB'}:`, err);
    process.exit(1);
  });
};
