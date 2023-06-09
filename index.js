const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;
require("dotenv").config();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
app.use(express.json());

// db userpass SchoolProjects

const uri =
  "mongodb+srv://SchoolProjects:SchoolProjects@cluster0.jferds9.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("UserDB").collection("users");
    const classCollection = client.db("classDB").collection("classes");
    const selectedClassCollection = client
      .db("selectedClassDB")
      .collection("selectedClass");
    // selected class touter
    app.get("/selectedClass", async (req, res) => {
      const selectedClass = req.body;
      const result = await selectedClassCollection
        .find(selectedClass)
        .toArray();
      res.send(result);
    });
    app.post("/selectedClass", async (req, res) => {
      const body = req.body;
      const filter = { _id: body._id }; //body._id
      const existingClass = await selectedClassCollection.findOne(filter);
      if (existingClass) {
        res.send("you have already added this class");
      }
      const result = await selectedClassCollection.insertOne(body);
      res.send(result);
    });

    // allClass related touter
    app.get("/allClass", async (req, res) => {
      const allClass = {};
      const result = await classCollection.find(allClass).toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const allUser = {};
      const result = await usersCollection.find(allUser).toArray();
      res.send(result);
    });
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const existingUser = await usersCollection.findOne(filter);
      if (existingUser) {
        return res.send({ massage: "user already exist" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // user role route
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // delete user route
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(filter);
      res.send(result);
    });

    app.post("/addAClass", async (req, res) => {
      const body = req.body;
      const result = await classCollection.insertOne(body);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("sever is running");
});
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
