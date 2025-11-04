import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModel from "../models/user.model.js";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({ email, name, password: hashedPassword });

    user.save();

    return res
      .status(201)
      .json({ success: true, message: "Registration successfully", user });
  } catch (error) {
    console.log("error in register user controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Debug log: show incoming login attempt (do not log password in production)
    console.log(`Login attempt for email=${email} origin=${req.headers.origin} ip=${req.ip}`);

    const user = await userModel.findOne({ email });
    if (!user) {
      console.log(`Login failed: user not found for email=${email}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login failed: invalid password for email=${email}`);
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      // Allow cross-site cookie in production when frontend is on a different origin
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });


    return res
      .status(200)
      .json({ success: true, message: "Login successful", user});
  } catch (error) {
    console.log("error in login user controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Logout Controller
export const logoutUser = async (req: Request, res: Response) => {
  try {
    // Clear cookie with sameSite matching how it was set
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.log("error in logout user controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Profile Controller
export const getProfile = async (req: Request, res: Response) => {
  try {
    console.log(`Profile request origin=${req.headers.origin} cookies=${JSON.stringify(req.cookies)}`);
    if (!req.user) {
      console.log("Profile request: no req.user (unauthenticated)");
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("error in get profile controller", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
