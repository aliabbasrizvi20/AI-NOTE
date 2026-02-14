import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  des: { type: String, required: true },
  tag: { type: String, default: "" },
}, { timestamps: true });

export const NotesNote = mongoose.models.NotesNote || mongoose.model("NotesNote", NoteSchema);
