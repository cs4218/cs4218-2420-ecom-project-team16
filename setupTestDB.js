const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongodbServer;

export const startInMemoryMongoServer = async () => {
  // Create an in-memory MongoDB server instance
  mongodbServer = await MongoMemoryServer.create();
  const mongodbUri = mongodbServer.getUri();
  process.env.MONGO_URL = mongodbUri;
  await mongoose.connect(mongodbUri);
};

export const stopInMemoryMongoServer = async () => {
  // Drop the database and disconnect Mongoose
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  // Stop the in-memory MongoDB server
  if (mongodbServer) {
    await mongodbServer.stop();
  }
};
