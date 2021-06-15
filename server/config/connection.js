const Mongoose = require("mongoose");
const connection = Mongoose.connection;
const { MONGODB_URL, OPTIONS, MONGO_DB } = require("./mongodb");
const { message } = require("../helpers/utils");
const CONNECTION_TOTAL_TRIES = 4;
let connectionTries = 1;

connection.on("open", () => {
  message.success("Connect to database in " + MONGODB_URL + MONGO_DB);
});

async function closeDb(app) {
  try {
    await Mongoose.disconnect();
    message.success("Mongodb disconnect successfully");
    app.close();
    message.success("The server has stopped successfully");
  } catch (err) {
    message.error("Error in disconnet to mongodb", err);
  }
}

async function connectDb() {
  try {
    return await Mongoose.connect(MONGODB_URL + MONGO_DB, OPTIONS);
  } catch (err) {
    message.error("Error in connect to mongodb", err);
    const id = setTimeout(() => {
      if (connectionTries === CONNECTION_TOTAL_TRIES) return clearTimeout(id);
      message.warn(`Reconnecting to mongodb server {${connectionTries}}...`);
      connectionTries++;
      connectDb();
    }, 4000);
  }
}

module.exports = { connectDb, closeDb };