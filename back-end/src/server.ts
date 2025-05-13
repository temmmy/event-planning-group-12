import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose"; // Use mongoose connection for MongoStore
import session from "express-session";
import MongoStore from "connect-mongo";
import authRoutes from "./routes/authRoutes"; // Import the auth routes
import settingsRoutes from "./routes/settingsRoutes"; // Import the settings routes
// import connectDB from "./config/db"; // Assuming direct mongoose connection below

// Load environment variables
dotenv.config();

// --- Database Connection ---
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined.");
  process.exit(1);
}

// Connect to MongoDB using Mongoose
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected successfully via Mongoose."))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

const app: Express = express();

// --- Session Configuration ---
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined in .env file.");
  process.exit(1);
}

app.use(
  session({
    secret: sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: "sessions", // Optional: name of the sessions collection
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 * 24 * 7, // Session expiry time (e.g., 7 days)
      // sameSite: 'lax' // Consider 'lax' or 'strict' for CSRF protection
    },
  })
);

// --- Middleware ---
// Enable CORS - Adjust origins for production!
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Default to common Vite port
    credentials: true, // Allow cookies/session info to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
// Basic health check route
app.get("/", (req: Request, res: Response) => {
  res.send("Nikiplan API is running...");
});

// Mount Auth Routes
app.use("/api/auth", authRoutes); // Use the auth routes

// Mount Settings Routes
app.use("/api/settings", settingsRoutes); // Use the settings routes

// TODO: Define other API routes here (e.g., event routes, user routes)

// --- Server Start ---
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});
