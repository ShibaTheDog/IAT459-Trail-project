require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const trailRoutes = require("./routes/trails");

const app = express();
const PORT = 5000;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
}

connectDB();

app.get("/", (req, res) => {
  res.send("Vancouver Hiking App Backend is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/trails", trailRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});