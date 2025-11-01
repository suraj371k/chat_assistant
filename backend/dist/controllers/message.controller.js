import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate, MessagesPlaceholder, } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import dotenv from "dotenv";
import conversationModel from "../models/conversation.model.js";
import messageModel from "../models/message.model.js";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
dotenv.config();
const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    maxOutputTokens: 2048,
    apiKey: process.env.GEMINI_API_KEY,
});
export const askQuestion = async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    try {
        const { message, conversationId } = req.body;
        const user = req.user;
        if (!user) {
            res.write(`data: ${JSON.stringify({ error: "Unauthorized" })}\n\n`);
            return res.end();
        }
        if (!message) {
            res.write(`data: ${JSON.stringify({ error: "Message is required" })}\n\n`);
            return res.end();
        }
        let conversation;
        if (conversationId) {
            conversation = await conversationModel.findById(conversationId);
            if (!conversation) {
                res.write(`data: ${JSON.stringify({ error: "Conversation not found" })}\n\n`);
                return res.end();
            }
        }
        else {
            conversation = await conversationModel.create({
                userId: user._id,
                title: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
            });
            res.write(`data: ${JSON.stringify({ conversationId: conversation._id })}\n\n`);
        }
        //Fetch previous messages and convert to LangChain format
        const prevMessages = await messageModel
            .find({ conversationId: conversation._id })
            .sort({ createdAt: 1 })
            .limit(20);
        // Convert to LangChain message format
        const chatHistory = prevMessages.map((msg) => msg.role === "user"
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content));
        // Use ChatPromptTemplate with message history
        const prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful AI assistant. The user's name is ${user.name} and their email is ${user.email}. 
Use this information naturally when relevant. Always maintain context from previous messages in the conversation.`,
            ],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
        ]);
        const chain = prompt.pipe(model).pipe(new StringOutputParser());
        let fullResponse = "";
        // Stream with proper message history
        const stream = await chain.stream({
            chat_history: chatHistory,
            input: message,
        });
        for await (const chunk of stream) {
            fullResponse += chunk;
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }
        // Save messages
        await messageModel.insertMany([
            {
                conversationId: conversation._id,
                role: "user",
                content: message,
            },
            {
                conversationId: conversation._id,
                role: "assistant",
                content: fullResponse,
            },
        ]);
        res.write(`data: [DONE]\n\n`);
        res.end();
    }
    catch (error) {
        console.error("Error in generating answer:", error);
        res.write(`data: ${JSON.stringify({ error: "Internal server error" })}\n\n`);
        res.end();
    }
};
export const getMessages = async (req, res) => {
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
    }
    catch (error) {
        console.error("Error in getMessages controller:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
