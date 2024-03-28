const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    // origin: "https://food-distribution2.netlify.app",
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("grocery-store");
    const ProductCollection = db.collection("products");

    // supply post related api

    app.get("/api/v1/products", async (req, res) => {
      const queryUrl = req.query;
      let modifyQuery = {};
      if (queryUrl.category) {
        modifyQuery.category = queryUrl.category;
      }
      if (queryUrl.rating) {
        modifyQuery.rating = { $gte: Number(queryUrl.rating) };
      }
      if (queryUrl.price) {
        modifyQuery.price = {
          $lte: Number(queryUrl.price),
        };
      }

      console.log(modifyQuery);

      const result = await ProductCollection.find(modifyQuery)
        .sort({ createdAt: 1 })
        .toArray();
      res.send(result);
    });
    app.get("/api/v1/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.findOne(query);
      res.send(result);
    });
    app.post("/api/v1/products", async (req, res) => {
      const post = req.body;
      console.log(post);
      const result = await ProductCollection.insertOne(post);
      res.send(result);
    });
    app.delete("/api/v1/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ProductCollection.deleteOne(query);
      res.send(result);
    });

    // app.get("/flash-sale", async (req, res) => {
    //   const falseSale = await ProductCollection.find()
    //     .sort({ createdAt: 1 })
    //     .toArray();

    //   const filter = falseSale.filter((flash) => flash.isFlash == true);
    //   res.send(filter);
    // });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
