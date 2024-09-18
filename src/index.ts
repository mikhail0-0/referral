import express from "express";
import studentRouter from "./routes/student-router";
import { Config } from "./config/config";
import transactionRouter from "./routes/transaction-router";
import path from "path";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";

Config.init();

const app = express();

app.use("/", express.static(path.join(__dirname, "..", "static")));
app.use(express.json());
app.use(morgan("combined"));

app.use("/students", studentRouter);
app.use("/transactions", transactionRouter);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.listen(Config.appPort, () => {
  console.log(`Running on port ${Config.appPort}`);
});
