const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");

const port = process.env.PORT || 5000;
require("dotenv").config();

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(402).send({ error: true, massage: "unauthorize access" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, massage: "unauthorize access" });
    }
    req.decoded = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jferds9.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const usersCollection = client.db("UserDB").collection("users");
    const classCollection = client.db("classDB").collection("classes");
    const paymentCollection = client.db("paymentDB").collection("payment");
    const selectedClassCollection = client
      .db("selectedClassDB")
      .collection("selectedClass");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.send(token);
    });
    // selected class router
    app.get("/selectedClass", async (req, res) => {
      const selectedClass = req.body;
      const result = await selectedClassCollection
        .find(selectedClass)
        .toArray();
      res.send(result);
    });
    app.get("/singleCls/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.findOne(body, filter);
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
    app.delete("/classDelete/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await selectedClassCollection.deleteOne(body, filter);
      res.send(result);
    });

    // payment related router
    app.get("/enrolledCls", async (req, res) => {
      const enrolledCls = {};
      const result = await paymentCollection.find(enrolledCls).toArray();
      res.send(result);
    });

    app.post("/payment", async (req, res) => {
      const body = req.body;
      const filter = { _id: body._id };
      const existingPayment = await paymentCollection.findOne(filter);
      if (existingPayment) {
        res.send("you have already parses this product");
      }
      const result = await paymentCollection.insertOne(body);
      res.send(result);
    });

    // allClass related touter
    app.get("/allClass", async (req, res) => {
      const allClass = {};
      const result = await classCollection.find(allClass).toArray();
      res.send(result);
    });
    // user related router
    app.get("/users", async (req, res) => {
      const allUser = {};
      // console.log(allUser);
      const result = await usersCollection.find(allUser).toArray();
      res.send(result);
    });
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });
    // get user base on role
    app.get("/instructor", async (req, res) => {
      const body = req.body;
      console.log(body);
    });

    // save user in db and save dublication
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
      // const email = req.params.email;
      // const filter = { email: email };
      // const options = { upsert: true }; na thakle add kore
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // const email = req.params.email;
      // const filter = { email: email };
      // const options = { upsert: true }; na thakle add kore
      const updateDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete user related route
    app.delete("/deleteUser/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(body, filter);
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
