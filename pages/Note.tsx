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
  const [searchNote, setSearchNote] = useState("");

  const [aiLoadingIndex, setAiLoadingIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [statusMsg, setStatusMsg] = useState(""); 
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedName = localStorage.getItem("userName");

    if (storedToken) {
      setToken(storedToken);
      setUserName(storedName);
      fetchNotes(storedToken);
    }
  }, []);

  const fetchNotes = async (token?: string) => {
    try {
      const res = await fetch("/api/notes", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setShowAllNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle || !noteDes) return setStatusMsg("Please fill all fields");

    if (editIndex !== null) {
     
      const note = showAllNotes[editIndex];

      if (token) {
        const res = await fetch("/api/notes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: note._id,
            title: noteTitle,
            des: noteDes,
            tag: noteTag,
          }),
        });
        const updatedNote = await res.json();
        const updatedNotes = [...showAllNotes];
        updatedNotes[editIndex] = updatedNote;
        setShowAllNotes(updatedNotes);
      } else {
        
        const updatedNotes = [...showAllNotes];
        updatedNotes[editIndex] = { ...updatedNotes[editIndex], title: noteTitle, des: noteDes, tag: noteTag };
        setShowAllNotes(updatedNotes);
      }
      setEditIndex(null);
    } else {
      
      if (token) {
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
      } else {
      
        const tempNote: Note = {
          _id: `temp-${Date.now()}`,
          title: noteTitle,
          des: noteDes,
          tag: noteTag,
        };
        setShowAllNotes([tempNote, ...showAllNotes]);
      }
    }

    setNoteTitle("");
    setNoteDes("");
    setNoteTag("");
    setShowNotePad(false);
    setStatusMsg("");
  };

  const handleDeleteNote = async (realIndex: number) => {
    const note = showAllNotes[realIndex];

    if (token && !note._id?.startsWith("temp")) {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: note._id }),
      });
    }

    setShowAllNotes(showAllNotes.filter((_, i) => i !== realIndex));
  };

  const handleAI = async (index: number, action: string) => {
    try {
      setAiLoadingIndex(index);
      const note = showAllNotes[index];

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, prompt: note.des }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg(data.error || "AI failed");
        return;
      }

      const updatedNotes = [...showAllNotes];
      if (action === "tags") updatedNotes[index].tag = data.text;
      else updatedNotes[index].des = data.text;

      setShowAllNotes(updatedNotes);
    } catch (error: any) {
      console.error(error);
      setStatusMsg("AI error occurred");
    } finally {
      setAiLoadingIndex(null);
    }
  };

  const handleLogout = () => {
    setLogoutLoading(true);
    setStatusMsg("Logging out...");
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      setToken(null);
      setUserName(null);
      setShowAllNotes([]);
      setLogoutLoading(false);
      setStatusMsg("Logged out successfully!");
      router.push("/login");
    }, 1000); 
  };

  const filteredNotes = showAllNotes.filter((note) =>
    note.title.toLowerCase().includes(searchNote.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {userName || token ? (
          <>
            <span>Hello, <b>{userName || "Guest"}</b></span>
            <button
              className={`${styles.buttonPrimary} ${styles.buttonRed}`}
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.buttonPrimary} ${styles.buttonBlue}`}
              onClick={() => router.push("/login")}
            >
              Login
            </button>
            <button
              className={`${styles.buttonPrimary} ${styles.buttonGreen}`}
              onClick={() => router.push("/register")}
            >
              Register
            </button>
          </>
        )}
      </header>

      {statusMsg && (
        <p style={{ textAlign: "center", margin: "10px 0", color: "#333" }}>
          {statusMsg}
        </p>
      )}

      <input
        className={styles.input}
        type="text"
        placeholder="Search notes..."
        value={searchNote}
        onChange={(e) => setSearchNote(e.target.value)}
      />

      <button
        className={`${styles.buttonPrimary} ${styles.buttonBlue}`}
        onClick={() => {
          setShowNotePad(!showNotePad);
          setEditIndex(null);
        }}
      >
        {showNotePad ? "Close NotePad" : "Add Note"}
      </button>

      {showNotePad && (
        <div className={styles.noteForm}>
          <input
            className={styles.input}
            type="text"
            placeholder="Title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <textarea
            className={styles.textarea}
            placeholder="Description"
            value={noteDes}
            onChange={(e) => setNoteDes(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="#Tags"
            value={noteTag}
            onChange={(e) => setNoteTag(e.target.value)}
          />
          <button
            className={`${styles.buttonPrimary} ${styles.buttonGreen}`}
            onClick={handleSaveNote}
          >
            {editIndex !== null ? "Update Note" : "Save Note"}
          </button>
        </div>
      )}

      <div>
        {filteredNotes.length > 0 ? (
          filteredNotes.map((note) => {
            const realIndex = showAllNotes.findIndex((n) => n._id === note._id);

            return (
              <div key={note._id || `temp-${realIndex}`} className={styles.noteCard}>
                <h4>{note.title}</h4>
                <p>{note.des}</p>
                <p><b>Tags:</b> {note.tag}</p>

                <div className={styles.noteButtons}>
                  <button
                    className={`${styles.buttonPrimary} ${styles.buttonBlue}`}
                    onClick={() => {
                      setNoteTitle(note.title);
                      setNoteDes(note.des);
                      setNoteTag(note.tag);
                      setEditIndex(realIndex);
                      setShowNotePad(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className={`${styles.buttonPrimary} ${styles.buttonRed}`}
                    onClick={() => handleDeleteNote(realIndex)}
                  >
                    Delete
                  </button>

                  <div className={styles.aiFeatures}>
                    <button
                      style={{
                        backgroundColor: "rgb(255, 183, 77)",
                        cursor: "pointer",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        margin: "5px 5px 5px 0",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        transition: "all 0.3s",
                      }}
                      disabled={aiLoadingIndex === realIndex}
                      onClick={() => handleAI(realIndex, "summary")}
                    >
                      {aiLoadingIndex === realIndex ? "..." : " Summary"}
                    </button>

                    <button
                      //  backgroundColor: "#4fc3f7"
                      style={{
                        backgroundColor: "#4fc3f7",
                        cursor: "pointer",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        margin: "5px 5px 5px 0",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        transition: "all 0.3s",
                      }}
                      disabled={aiLoadingIndex === realIndex}
                      onClick={() => handleAI(realIndex, "improve")}
                    >
                      {aiLoadingIndex === realIndex ? "..." : " Improve"}
                    </button>

                    <button
                      // backgroundColor: "#26a69a"
                      style={{
                        backgroundColor: "#26a69a",
                        cursor: "pointer",
                        color: "#fff",
                        border: "none",
                        borderRadius: "10px",
                        margin: "5px 5px 5px 0",
                        padding: "8px 16px",
                        fontSize: "14px",
                        fontWeight: 600,
                        transition: "all 0.3s",
                      }}
                      disabled={aiLoadingIndex === realIndex}
                      onClick={() => handleAI(realIndex, "tags")}
                    >
                      {aiLoadingIndex === realIndex ? "..." : " Tags"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#333", marginTop: "20px" }}>No notes found.</p>
        )}
      </div>
    </div>
  );
}
