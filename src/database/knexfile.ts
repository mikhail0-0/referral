import { Knex } from "knex";
import { Config } from "../config/config";

Config.initDB();
interface IKnexConfig {
  [key: string]: Knex.Config;
}

const configs: IKnexConfig = {
  development: {
    client: "pg",
    connection: {
      host: Config.pgHost,
      port: Config.pgPort,
      user: Config.pgUser,
      password: Config.pgPassword,
      database: Config.pgDatabase,
    },
  },
};

export default configs;
