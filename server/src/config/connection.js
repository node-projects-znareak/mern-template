const Mongoose = require("mongoose");
const retry = require("retry");
const connection = Mongoose.connection;
const { MONGO_DB_URL } = require("@config/variables").API;
const { message } = require("@helpers/index");

connection.on("open", () => {
  message.success(`Connected to mongo host: ${connection.host}`);
  message.success(`Connected on port: ${connection.port}`);
  message.success(`Database name: ${connection.name}`);
});

connection.on("error", (err) => {
  message.error("Error connecting to MongoDB", err);
});

async function closeDb(server) {
  try {
    await Mongoose.disconnect();
    message.success("MongoDB disconnected successfully");
    server.close();
    message.success("The server has stopped successfully");
  } catch (err) {
    message.error("Error disconnecting from MongoDB", err);
  }
}

function connectDb() {
  return new Promise((resolve, reject) => {
    const operation = retry.operation({
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
      randomize: true,
    });

    operation.attempt(async (currentAttempt) => {
      try {
        console.log("");
        message.success(`Connecting to MongoDB... (Attempt ${currentAttempt})`);
        const con = await Mongoose.connect(MONGO_DB_URL, { ignoreUndefined: true });
        resolve(con);
      } catch (err) {
        if (operation.retry(err)) {
          message.error(`Connection attempt ${currentAttempt} failed, retrying...`, err.message);
          return;
        }

        const finalError = operation.mainError() ?? err;
        message.error("Failed to connect to MongoDB after all retries", finalError);
        reject(finalError);
      }
    });
  });
}

module.exports = { connectDb, closeDb };
