import express, { ErrorRequestHandler, RequestHandler } from "express";
const app = express();
const http = require("http");
const port = 8001;
const server = http.createServer(app);
import router from "./routes/routes";
const cors = require("cors");
const path = require("path");
import multer, { memoryStorage } from "multer";
import { centralError, notFound404 } from "./controllers/errors";
import { members } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      [key: string]: any;
      user: members;
    }
  }
  interface Error {
    statusCode: number;
    type?: string;
    header?: string;
    location?: string;
    modal?: boolean;
  }
}

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/images", express.static(path.join("images")));
const upload = multer({ storage: memoryStorage() });
app.use(upload.single("image"));

app.use("/api", router);

// Error Handling
app.use("/", notFound404);
app.use(centralError);

server.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
