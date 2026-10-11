import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/app/entities/*.ts",
  out: "./drizzle",
});
