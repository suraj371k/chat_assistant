import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js';

//routes imports
import  userRoutes from './routes/user.routes.js'
import messageRoutes from './routes/message.routes.js'
import conversationRoutes from './routes/conversation.routes.js'


dotenv.config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({origin: 'http://localhost:3000' , credentials: true}))
app.use(cookieParser())

// health check
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

//routes
app.use('/api/user' , userRoutes)
app.use('/api/message' , messageRoutes)
app.use('/api/conversation' , conversationRoutes)


//database connection
connectDB()

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});