import { useParams } from "react-router-dom";
import MarkdownPage from "../components/MarkdownPage";
import "./NotesPage.css";

export default function NotesPage() {
  const { id } = useParams();

  return (
    <div className="notesPage">
      <header className="notesHeader">
        <h2 className="notesTitle">Notes</h2>
      </header>

      <div className="notesBody">
        {id ? (
          <MarkdownPage />
        ) : (
          <div className="notesPlaceholder">
            Sélectionne une note pour commencer à écrire.
          </div>
        )}
      </div>
    </div>
  );
}
