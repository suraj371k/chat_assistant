import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

//routes imports
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Determine allowed frontend origin via environment (use the deployed frontend URL in production)
const CLIENT_URL = process.env.CLIENT_URL || "https://chat-assistant-liart.vercel.app";

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from Express + TypeScript!" });
});

//routes
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/conversation", conversationRoutes);

//database connection
connectDB();

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
