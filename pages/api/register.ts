import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { ConnectToDB } from "@/lib/db"; 
import { NoteUser } from "@/lib/models/User"; 
import { generateToken } from "@/lib/auth"; 


interface RegisterResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RegisterResponse>
) {
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
   
    await ConnectToDB();

    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

  
    const existingUser = await NoteUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = await NoteUser.create({
      name,
      email,
      password: hashedPassword,
    });

  
    const token = generateToken(user._id.toString());

  
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Registration failed" });
  }
}
