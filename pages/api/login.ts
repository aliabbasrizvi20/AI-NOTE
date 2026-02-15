// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import { NoteUser } from "@/lib/models/User";
import { generateToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = await NoteUser.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });


    const token = generateToken({ _id: user._id.toString(), name: user.name, email: user.email });

    
    res.status(200).json({ token, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
