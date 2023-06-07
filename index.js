const express = require("express");
const cors = require("cors");

const app = express();

const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("sever is running");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
