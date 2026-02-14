import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ConnectToDB } from "@/lib/db"; // Your DB connection helper
import { NoteUser } from "@/lib/models/User"; // Your Mongoose user model
import { generateToken } from "@/lib/auth"; // Your token generator

// Response type
interface RegisterResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Connect to MongoDB
    await ConnectToDB();

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await NoteUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in DB
    const user = await NoteUser.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = generateToken(user._id.toString());

    // Return token
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Registration failed" });
  }
}
