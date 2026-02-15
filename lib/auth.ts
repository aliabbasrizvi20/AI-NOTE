
import jwt from "jsonwebtoken";
import { NoteUser } from "@/lib/models/User"; 

const JWT_SECRET = process.env.JWT_SECRET!;


export function generateToken(user: { _id: string; name: string; email: string }) {
  return jwt.sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}


export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      name: string;
      email: string;
    };
    return decoded;
  } catch (err) {
    return null;
  }
}

