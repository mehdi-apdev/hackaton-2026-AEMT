import { useParams } from "react-router-dom";
import MarkdownPage from "../components/MarkdownPage";
import "./NotesPage.css";

export default function NotesPage() {
  const { id } = useParams();

  return (
    <div className="notesPage">

      <div className="notesBody">
        {id ? (
          <MarkdownPage />
        ) : (
          <div className="notesPlaceholder">
            <div className="magic-ring"></div>
            <div className="magic-ring-inner"></div>
            <span className="placeholder-icon">👻</span>
            <span className="placeholder-text">Choisissez une note pour commencer à écrire...</span>
          </div>
        )}
      </div>
    </div>
  );
}
