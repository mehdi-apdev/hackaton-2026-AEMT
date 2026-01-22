import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MarkdownPage from "../components/MarkdownPage";
import  NoteService  from "../services/NoteService"; // Named import
import "./NotesPage.css";

export default function NotesPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Handles the 'notes:create' event sent by the sidebar.
     * This ensures the link is active as soon as the user is on the notes page.
     */
    const handleCreateNote = async (event: any) => {
      const { title, folderId } = event.detail;

      try {
        // Create the note (folderId will be null for root notes)
        const newNote = await NoteService.createNote(title, "", folderId);
        
        // Refresh sidebar tree
        window.dispatchEvent(new CustomEvent("notes:refresh"));
        
        // Navigate immediately to the new note
        navigate(`/notes/${newNote.id}`);
      } catch (error) {
        console.error("Error creating note from event:", error);
      }
    };

    window.addEventListener("notes:create", handleCreateNote);
    
    return () => {
      window.removeEventListener("notes:create", handleCreateNote);
    };
  }, [navigate]); // navigate is stable, this effect runs once on mount

  return (
    <div className="notesPage">
      <div className="notesBody">
        {id ? (
          <MarkdownPage key={id} /> // Key ensures component refreshes on ID change
        ) : (
          <div className="notesPlaceholder">
            <div className="magic-ring"></div>
            <div className="magic-ring-inner"></div>
            <span className="placeholder-icon">👻</span>
            <span className="placeholder-text">Choose a note to start writing...</span>
          </div>
        )}
      </div>
    </div>
  );
}