const express = require("express");
const app = express();
const cors = require("cors");
const { initializeConnection } = require("./database/db-connection");

app.use(express.json());
app.use(cors());
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
initializeConnection();

app.get("/", (req, res) => {
  res.send("Hello from cric-insta backend");
});

app.use("/auth", require("./routes/auth-router"));

const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`listening to port 8080`);
});
