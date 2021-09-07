const morgan = require("morgan");
const express = require("express");
const fileUpload = require("express-fileupload");
const helmet = require("helmet");
const hpp = require("hpp");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const routers = require("./routers");
const { SERVER } = require("./config/variables");
const startServer = require("./config/server");

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      if (SERVER.API.ALLOWED_DOMAINS.includes(origin)) {
        return cb(null, true);
      }
      cb(new Error("Su cliente no puede realizar peticiones al servidor"));
    },
  })
);
app.use(morgan("dev"));
app.use(express.static("./uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(helmet());
app.use(hpp());

app.use(rateLimit(SERVER.API.RATE_LIMITS));
app.use(
  cookieParser(SERVER.API.SECRET_TOKEN_COOKIE, {
    httpOnly: true,
    secure: true,
    expires: new Date(
      Date.now() + SERVER.API.COOKIE_EXPIRE_DAYS * 24 * 3600 * 1000
    ),
  })
);
app.use(
  session({
    secret: SERVER.API.SECRET_TOKEN_SESSION,
    resave: false,
    saveUninitialized: true,
  })
);
app.use("/api", routers);

startServer(app, routers);
