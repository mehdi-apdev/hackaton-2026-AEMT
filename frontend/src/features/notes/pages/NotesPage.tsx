import { MOCK_FOLDERS } from "../mockData";
import { FolderTree } from "../components/FolderTree";
import "./NotesPage.css";

export default function NotesPage() {
  return (
    <div className="notesPage">
      <h2 className="notesTitle">🎃 Test Navigation - Mehdi</h2>

      <div className="notesPanel">
        {MOCK_FOLDERS.map((folder) => (
          <FolderTree key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
}
