import { useParams } from "react-router-dom";

export default function NotesPage() {
  const { id } = useParams();

  return (
    <div>
      <h2>Note {id}</h2>
      <p>Contenu de la note (à charger depuis le backend)...</p>

      {/* Zone d'édition simple pour l'instant */}
      <textarea defaultValue={`Contenu Markdown de la note ${id}`} />
    </div>
  );
}
