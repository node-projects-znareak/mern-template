const { PORT, HOST, API } = require("@config/variables");
const { message, getLocalIP, table } = require("@helpers/index");
const { connectDb, closeDb } = require("@config/connection");
const wrapServerErrors = require("@middlewares/errorsHandling");

async function startServer(app, routers) {
  try {
    const ip = getLocalIP();
    const con = await connectDb();

    if (!con) return;

    wrapServerErrors(app);

    app.use("/api", routers);

    app.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Route not found",
        path: req.path,
      });
    });

    const server = app.listen(PORT, HOST, () => {
      console.log("");
      message.success(`> Local server has started on http://${HOST || "localhost"}:${PORT}/`);
      message.success(`> Remote server has started on http://${ip}:${PORT}/`);
      console.log("");

      message.success(`Enviroment: ${API.ENVIROMENT ?? "Not defined"}`);

      if (API.ENVIROMENT === "development") {
        message.success(
          `You can access the documentation on http://${HOST || ip || "localhost"}:${PORT}/api-docs`
        );
        const expressListEndpoints = require("express-list-endpoints");
        const endpoints = expressListEndpoints(app).map((endpoint) => {
          return Object.values(endpoint);
        });

        table.push(...endpoints);
        console.log(`\n${table.toString()}`);
      }
    });

    process.on("SIGINT", () => closeDb(server));
    process.on("SIGTERM", () => closeDb(server));
  } catch (err) {
    message.error("Error Ocurred while starting the server", err);
  }
}

module.exports = startServer;
