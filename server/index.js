const morgan = require("morgan");
const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
const routers = require("./routers");
const { SERVER } = require("./config/variables");
const startServer = require("./config/server");

app.use(cors());
app.use(morgan("dev"));
app.use(express.static("./uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use(helmet());
app.use(hpp());
app.use(cors());
app.use(rateLimit(SERVER.API.RATE_LIMITS));
app.use("/api", routers);

startServer(app, routers);
