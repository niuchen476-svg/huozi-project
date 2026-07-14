import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import apiRouter from "./routes/api.js";

const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // 同源请求 / curl 等无 Origin 头的请求放行，浏览器跨域请求只放行白名单
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

const imageDirectory = fileURLToPath(new URL("../storage/images/", import.meta.url));
app.use("/images", express.static(path.resolve(imageDirectory), {
  fallthrough: false,
  maxAge: "1h",
}));

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`backend listening on http://localhost:${port}`);
});
