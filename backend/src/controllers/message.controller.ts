import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Request, Response } from "express";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import conversationModel from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  maxOutputTokens: 2028,
  apiKey: process.env.GEMINI_API_KEY!,
});

export const askQuestion = async (req: Request, res: Response) => {
  try {
    const { message, conversationId } = req.body;
    const user = req.user;

    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!message)
      return res
        .status(400)
        .json({ success: false, message: "Message is required" });

    let conversation;

    if (conversationId) {
      conversation = await conversationModel.findById(conversationId);
    } else {
      conversation = await conversationModel.create({
        userId: user._id,
        title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
      });
    }

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // fetch last messages
    const prevMessages = await messageModel
      .find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(15);

    const history = prevMessages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    // 🧠 Personalize the AI with user data
    const userIntro = `The user chatting with you is named ${user.name}. Their email is ${user.email}. Use this info naturally if needed.`;

    const prompt = PromptTemplate.fromTemplate(`
You are a helpful AI assistant. Use the context to answer naturally.

${userIntro}

Here is the chat so far:
${history}

User: {question}
Assistant:
`);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({ question: message });

    // save user + assistant messages
    await messageModel.create([
      {
        conversationId: conversation._id,
        role: "user",
        content: message,
      },
      {
        conversationId: conversation._id,
        role: "assistant",
        content: response,
      },
    ]);

    return res.status(200).json({
      success: true,
      conversationId: conversation._id,
      message: response,
    });
  } catch (error) {
    console.error("Error in generating answer:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res
        .status(400)
        .json({ success: false, message: "conversationId required" });
    }

    const messages = await messageModel
      .find({ conversationId })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Fetched messages successfully",
      messages,
    });
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
