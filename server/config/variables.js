// ALL CONFIGURATION VARIABLES OF SERVER AND DATABASE
// WARNING: IT'S CAN VERY DANGER IF YOU DON'T KNOW

// MONGODB CONFIGURATION
require("dotenv").config();

const MONGO_DB = {
  URL: process.env.MONGODB_URL,
  DB_NAME: process.env.MONGO_DB,
};

const SERVER = {
  PORT: process.env.API_PORT || 6000,
  DEV: process.env.DEV || false,
  API: {
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    API_UPLOAD_IMAGES: process.env.API_UPLOAD_IMAGES,
    API_UPLOAD_IMAGES_KEY: process.env.API_UPLOAD_IMAGES_KEY,
  },
};

module.exports = {
  MONGO_DB,
  SERVER,
};
