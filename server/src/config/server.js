const { PORT, HOST, API } = require("@config/variables");
const { message, getLocalIP, table } = require("@helpers/index");
const { connectDb, closeDb } = require("@config/connection");
const wrapServerErrors = require("@middlewares/errorsHandling");

async function startServer(app, routers) {
  try {
    const con = await connectDb();

    if (!con) return;

    wrapServerErrors(app);

    app.use("/api", routers);

    app.get("/health", (req, res) => {
      res.status(200).json({ status: "OK" });
    });

    app.use((req, res) => {
      res.status(404).json({
        status: 404,
        message: "Route not found",
        path: req.path,
      });
    });

    const server = app.listen(PORT, HOST, () => {
      console.log("");

      const ip = getLocalIP();
      const { consola } = require("consola");

      consola.success(`Server running at http://${HOST || "localhost"}:${PORT}`);
      consola.success(`Remote server at http://${ip}:${PORT}`);
      consola.success(`Enviroment: ${API.ENVIROMENT ?? "Not defined"}`);

      if (API.ENVIROMENT === "development") {
        consola.warn("Development mode enabled, extras dependencies are loaded");
        consola.success(
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
