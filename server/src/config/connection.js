const Mongoose = require("mongoose");
const retry = require("retry");
const connection = Mongoose.connection;
const { MONGO_DB_URL } = require("@config/variables").API;
const { message } = require("@helpers/index");
const operation = retry.operation({
  retries: 10,
});

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
    operation.attempt(async () => {
      try {
        console.log("");
        message.success("Connecting to MongoDB...");
        const con = await Mongoose.connect(MONGO_DB_URL, { ignoreUndefined: true });
        resolve(con);
      } catch (err) {
        if (operation.retry(err)) {
          message.error("Error connecting to MongoDB", err);
          return;
        }
        message.error(operation.mainError() ?? err);
        reject(err);
        process.exit(1);
      }
    });
  });
}

module.exports = { connectDb, closeDb };
