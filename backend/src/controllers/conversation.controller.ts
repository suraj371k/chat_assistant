import { Request, Response } from "express";
import conversationModel from "../models/conversation.model.js";

export const getAllConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(403).json({ success: false, message: "Unauthorize" });
    }

    const conversations = await conversationModel
      .find({ userId })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "conversation fetch successfully",
      conversations,
    });
  } catch (error) {
    console.log("Error in get all conversation", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorize" });
    }

    const { id } = req.params;

    if(!id){
        return res.status(404).json({success: false , message: "conversation not found"})
    }

    await conversationModel.findByIdAndDelete(id)

    return res.status(200).json({success: true , message: "conversation deleted successfully"})
  } catch (error) {
    console.log("Error in delete conversation controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
