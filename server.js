const express = require("express");
const app = express();
const http = require("http");
const port = 8000;
const server = http.createServer(app);
const controllers = require("./controllers");
const cors = require("cors");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/images", express.static(path.join("images")));

app.use("/api", controllers);

server.listen(port, () => {
  console.log(`Service listening on port ${port}`);
});
