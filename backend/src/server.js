const app = require("./app");
const env = require("./config/env");
const { sequelize } = require("./models");

async function start() {
  try {
    await sequelize.authenticate();
    if (env.dbSync) {
      await sequelize.sync({ alter: true });
      // eslint-disable-next-line no-console
      console.log("Database synchronized");
    }

    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
}

start();
