"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/MyNote.module.css";

type Note = {
  _id?: string;
  title: string;
  des: string;
  tag: string;
};

export default function MyNote() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showNotePad, setShowNotePad] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDes, setNoteDes] = useState("");
  const [noteTag, setNoteTag] = useState("");
  const [showAllNotes, setShowAllNotes] = useState<Note[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [updateNoteTitle, setUpdateNoteTitle] = useState("");
  const [updateNoteDes, setUpdateNoteDes] = useState("");
  const [updateNoteTag, setUpdateNoteTag] = useState("");
  const [editPad, setEditPad] = useState(false);
  const [searchNote, setSearchNote] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");
    if (!storedToken) {
    //   router.push("/login");
      return;
    }
    setToken(storedToken);
    setUserName(storedName);
    fetchNotes(storedToken);
  }, []);

  const fetchNotes = async (token: string) => {
    try {
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setShowAllNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle || !noteDes) return alert("Fill all fields");
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: noteTitle, des: noteDes, tag: noteTag }),
    });
    const newNote = await res.json();
    setShowAllNotes([newNote, ...showAllNotes]);
    setNoteTitle("");
    setNoteDes("");
    setNoteTag("");
    setShowNotePad(false);
  };

  const handleEditNote = (index: number) => {
    const note = showAllNotes[index];
    setUpdateNoteTitle(note.title);
    setUpdateNoteDes(note.des);
    setUpdateNoteTag(note.tag);
    setEditIndex(index);
    setEditPad(true);
  };

  const handleSaveEditedNote = async () => {
    if (editIndex === null || !token) return;
    const noteToUpdate = showAllNotes[editIndex];
    try {
      const res = await fetch("/api/notes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: noteToUpdate._id,
          title: updateNoteTitle,
          des: updateNoteDes,
          tag: updateNoteTag,
        }),
      });
      const updated = await res.json();
      const updatedNotes = [...showAllNotes];
      updatedNotes[editIndex] = updated;
      setShowAllNotes(updatedNotes);
      setEditPad(false);
      setEditIndex(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (index: number) => {
    const note = showAllNotes[index];
    await fetch("/api/notes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: note._id }),
    });
    setShowAllNotes(showAllNotes.filter((_, i) => i !== index));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setToken(null);
    setUserName(null);
    setShowAllNotes([]);
    router.push("/login");
  };

  const filteredNotes = showAllNotes.filter((note) =>
    note.title.toLowerCase().includes(searchNote.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {token && userName ? (
          <>
            <span>Hello, <b>{userName}</b></span>
            <button className={`${styles.buttonPrimary} ${styles.buttonRed}`} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className={`${styles.buttonPrimary} ${styles.buttonBlue}`} onClick={() => router.push("/login")}>Login</button>
            <button className={`${styles.buttonPrimary} ${styles.buttonGreen}`} onClick={() => router.push("/register")}>Register</button>
          </>
        )}
      </header>

      <input className={styles.input} type="text" placeholder="Search notes..." value={searchNote} onChange={(e) => setSearchNote(e.target.value)} />

      {token && <button className={`${styles.buttonPrimary} ${styles.buttonBlue}`} onClick={() => setShowNotePad(!showNotePad)}>{showNotePad ? "Close NotePad" : "Add Note"}</button>}

      {showNotePad && token && (
        <div className={styles.noteForm}>
          <input className={styles.input} type="text" placeholder="Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} />
          <textarea className={styles.textarea} placeholder="Description" value={noteDes} onChange={(e) => setNoteDes(e.target.value)} />
          <input className={styles.input} placeholder="#Tags" value={noteTag} onChange={(e) => setNoteTag(e.target.value)} />
          <button className={`${styles.buttonPrimary} ${styles.buttonGreen}`} onClick={handleSaveNote}>Save Note</button>
        </div>
      )}

      {editPad && (
        <div className={styles.noteForm}>
          <input className={styles.input} value={updateNoteTitle} onChange={(e) => setUpdateNoteTitle(e.target.value)} />
          <textarea className={styles.textarea} value={updateNoteDes} onChange={(e) => setUpdateNoteDes(e.target.value)} />
          <input className={styles.input} value={updateNoteTag} onChange={(e) => setUpdateNoteTag(e.target.value)} />
          <button className={`${styles.buttonPrimary} ${styles.buttonBlue}`} onClick={handleSaveEditedNote}>Save Edit</button>
        </div>
      )}

      <div>
        {filteredNotes.length > 0 ? filteredNotes.map((note, index) => (
          <div key={index} className={styles.noteCard}>
            <h4>{note.title}</h4>
            <p>{note.des}</p>
            <p>Tags: {note.tag}</p>
            <div className={styles.noteButtons}>
              <button className={`${styles.buttonPrimary} ${styles.buttonBlue}`} onClick={() => handleEditNote(index)}>Edit Note</button>
              <button className={`${styles.buttonPrimary} ${styles.buttonRed}`} onClick={() => handleDeleteNote(index)}>Delete Note</button>
            </div>
          </div>
        )) : <p>No notes found.</p>}
      </div>
    </div>
  );
}
