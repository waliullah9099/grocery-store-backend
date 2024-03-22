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

    const db = client.db("assignment6");
    const collection = db.collection("users");
    const postsCollection = db.collection("posts");
    const galleryCollection = db.collection("gallery");
    const communityCollection = db.collection("community");
    const testimonialCollection = db.collection("testimonials");
    const volunteerCollection = db.collection("volunteers");

    // supply post related api

    app.get("/api/v1/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    });
    app.get("/api/v1/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.findOne(query);
      res.send(result);
    });
    app.post("/api/v1/posts", async (req, res) => {
      const post = req.body;
      console.log(post);
      const result = await postsCollection.insertOne(post);
      res.send(result);
    });
    app.delete("/api/v1/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    });

    // Gallery relatd api
    app.get("/api/v1/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    // testimonial relatd api
    app.post("/api/v1/testimonials", async (req, res) => {
      const testimonial = req.body;
      console.log(testimonial);
      const result = await testimonialCollection.insertOne(testimonial);
      res.send(result);
    });
    app.get("/api/v1/testimonials", async (req, res) => {
      const result = await testimonialCollection.find().toArray();
      res.send(result);
    });

    // volunteer relatd api
    app.post("/api/v1/volunteers", async (req, res) => {
      const volunteer = req.body;
      console.log(volunteer);
      const result = await volunteerCollection.insertOne(volunteer);
      res.send(result);
    });
    app.get("/api/v1/volunteers", async (req, res) => {
      const result = await volunteerCollection.find().toArray();
      res.send(result);
    });

    // community relatd api
    app.post("/api/v1/community", async (req, res) => {
      const community = req.body;
      console.log(community);
      const result = await communityCollection.insertOne(community);
      res.send(result);
    });
    app.get("/api/v1/community", async (req, res) => {
      const result = await communityCollection.find().toArray();
      res.send(result);
    });

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

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
