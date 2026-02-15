
import { NextApiRequest, NextApiResponse } from "next";
import { ConnectToDB } from "@/lib/db";
import { NotesNote } from "@/lib/models/Note";
import { verifyToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await ConnectToDB();

    const token = req.headers.authorization?.split(" ")[1]; 
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: "Invalid token" });

    const userId = user.userId;

    if (req.method === "GET") {
      const notes = await NotesNote.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    }

    
    if (req.method === "POST") {
      const { title, des, tag } = req.body;
      if (!title || !des) return res.status(400).json({ error: "Title and description required" });

      const newNote = await NotesNote.create({
        user: userId,
        title,
        des,
        tag: tag || "",
      });

      return res.status(201).json(newNote);
    }

    
    if (req.method === "PUT") {
      const { id, title, des, tag } = req.body;
      if (!id || !title || !des) return res.status(400).json({ error: "ID, title, description required" });

      const note = await NotesNote.findOne({ _id: id, user: userId });
      if (!note) return res.status(404).json({ error: "Note not found" });

      note.title = title;
      note.des = des;
      note.tag = tag || "";
      await note.save();

      return res.status(200).json(note);
    }

    
    if (req.method === "DELETE") {

  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body); 

  const { id } = body;
  if (!id) return res.status(400).json({ error: "ID required" });

  const note = await NotesNote.findOne({ _id: id, user: userId });
  if (!note) return res.status(404).json({ error: "Note not found" });

  await note.remove();
  return res.status(200).json({ success: true });
}

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
