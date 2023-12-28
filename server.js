const express = require("express");
const app = express();
const cors = require("cors");
const { initializeConnection } = require("./database/db-connection");

app.use(express.json());
app.use(cors());
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = 8080;
initializeConnection();

app.get("/", (req, res) => {
  res.send("CricInsta backend is working correctly");
});

app.use("/auth", require("./routes/auth-router"));

const server = app.listen(process.env.PORT || PORT, () => {
  console.log(`listening to port 8080`);
});
