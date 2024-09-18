import { config } from "dotenv";
import path from "path";

config({
  path:
    path.basename(__dirname) === "config"
      ? path.join(__dirname, "..", "..", ".env")
      : path.join(__dirname, "..", ".env"),
});

function checkEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} not found`);
  }
  return value;
}

export class Config {
  static appPort: number;
  static pgHost: string;
  static pgPort: number;
  static pgUser: string;
  static pgPassword: string;
  static pgDatabase: string;

  static jwtExpiresIn: number;
  static secretKey: string;

  static init() {
    Config.appPort = +checkEnvVar("APP_PORT");
    Config.initDB();

    Config.jwtExpiresIn = +checkEnvVar("JWT_EXPIRES_IN_SECONDS");
    Config.secretKey = checkEnvVar("SECRET_KEY");
  }

  static initDB() {
    Config.pgHost = checkEnvVar("POSTGRES_HOST");
    Config.pgPort = +checkEnvVar("POSTGRES_PORT");
    Config.pgUser = checkEnvVar("POSTGRES_USER");
    Config.pgPassword = checkEnvVar("POSTGRES_PASSWORD");
    Config.pgDatabase = checkEnvVar("POSTGRES_DATABASE");
  }
}
