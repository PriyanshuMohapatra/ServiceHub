import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import connectDB from "./config/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });
dotenv.config({ path: join(__dirname, "..", ".env") });

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Connect DB
connectDB();

const app = express();

// Allowed Frontend Domains
const allowedOrigins = [
  process.env.CLIENT_URL,        // Production (Netlify)
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
].filter(Boolean);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      origin === process.env.CLIENT_URL ||
      origin.endsWith(".netlify.app") ||
      origin.includes("localhost")
    ) {
      return callback(null, true);
    }

    console.log("❌ CORS BLOCKED:", origin);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};


// Apply CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // preflight support

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🌐 Allowed Origins:", allowedOrigins);
});
