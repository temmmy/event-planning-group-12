import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";

dotenv.config(); // Load environment variables

// Connect to MongoDB
connectDB();

const app: Express = express();

// --- Middleware ---
// Enable CORS for all origins (adjust for production)
app.use(cors());

// Body parser middleware to handle JSON request bodies
app.use(express.json());

// Body parser middleware to handle URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
// Basic health check route
app.get("/", (req: Request, res: Response) => {
  res.send("Nikiplan API is running...");
});

// TODO: Define other API routes here (e.g., app.use('/api/users', userRoutes);)

// --- Server Start ---
const PORT = process.env.PORT || 5001; // Use port from .env or default to 5001

app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
