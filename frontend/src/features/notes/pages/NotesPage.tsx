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
            <span className="placeholder-icon">👻</span>
            Choisissez un grimoire pour commencer l'incantation...
          </div>
        )}
      </div>
    </div>
  );
}
