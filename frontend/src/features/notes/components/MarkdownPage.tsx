import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useParams } from "react-router-dom";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Crepe } from "@milkdown/crepe";
import NoteService from "../services/NoteService";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";
import "./MarkdownPage.css";

const DEFAULT_TITLE = "Nouvelle note";
const DEFAULT_CONTENT = `# Nouvelle note

Ecris ici en **Markdown**.

- Liste
- **Gras**
- \`code\`

## Exemple
- [x] Fait
- [ ] A faire
`;

type MilkdownEditorProps = {
  defaultValue: string;
  editorKey: number;
  readonly: boolean;
  onChange: (markdown: string) => void;
};

const MilkdownEditor = ({
  defaultValue,
  editorKey,
  readonly,
  onChange,
}: MilkdownEditorProps) => {
  const crepeRef = useRef<Crepe | null>(null);

  useEditor(
    (root) => {
      const crepe = new Crepe({
        root,
        defaultValue,
      });

      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          onChange(markdown);
        });
      });

      crepeRef.current = crepe;
      return crepe;
    },
    [editorKey]
  );

  useEffect(() => {
    crepeRef.current?.setReadonly(readonly);
  }, [readonly]);

  return <Milkdown />;
};

const MarkdownPage = () => {
  const titleId = useId();
  const { id } = useParams();

  const noteId = useMemo(() => {
    if (!id) return null;
    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  }, [id]);

  const [isEditing, setIsEditing] = useState(true);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState({
    title: DEFAULT_TITLE,
    content: DEFAULT_CONTENT,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorKey, setEditorKey] = useState(0);

  const titleRef = useRef(title);
  const savedSnapshotRef = useRef(savedSnapshot);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    savedSnapshotRef.current = savedSnapshot;
  }, [savedSnapshot]);

  const updateDirtyState = useCallback((nextTitle: string, nextContent: string) => {
    const snapshot = savedSnapshotRef.current;
    setHasUnsavedChanges(
      nextTitle !== snapshot.title || nextContent !== snapshot.content
    );
  }, []);

  useEffect(() => {
    if (!noteId) return;

    let isActive = true;
    setIsLoading(true);
    setErrorMessage(null);

    NoteService.getNoteById(noteId)
      .then((note) => {
        if (!isActive) return;
        const nextTitle = note.title ?? DEFAULT_TITLE;
        const nextContent = note.content ?? "";
        setTitle(nextTitle);
        setContent(nextContent);
        setSavedSnapshot({ title: nextTitle, content: nextContent });
        setHasUnsavedChanges(false);
        setEditorKey((value) => value + 1);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Impossible de charger la note."
        );
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [noteId]);

  const handleSave = useCallback(async () => {
    if (!noteId) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await NoteService.updateNote(noteId, title, content);
      setSavedSnapshot({ title, content });
      setHasUnsavedChanges(false);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible de sauvegarder la note."
      );
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title, content]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() !== "s") return;
      if (!noteId || isSaving || !hasUnsavedChanges) return;
      event.preventDefault();
      void handleSave();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave, hasUnsavedChanges, isSaving, noteId]);

  const statusLabel = isSaving
    ? "Sauvegarde..."
    : hasUnsavedChanges
      ? "Modifications non enregistrees"
      : "Sauvegarde";
  const statusClass = isSaving
    ? "status-saving"
    : hasUnsavedChanges
      ? "status-dirty"
      : "status-saved";

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    updateDirtyState(nextTitle, content);
  };

  const handleContentChange = useCallback(
    (nextContent: string) => {
      setContent(nextContent);
      updateDirtyState(titleRef.current, nextContent);
    },
    [updateDirtyState]
  );

  return (
    <div className="markdownPage">
      <header className="markdownHeader">
        <div className="headerLeft"></div>

        <span className={`saveStatus ${statusClass}`} aria-live="polite">
          {statusLabel}
        </span>

        <button
          type="button"
          className="saveBtn"
          onClick={handleSave}
          disabled={!noteId || isSaving || !hasUnsavedChanges}
        >
          Sauvegarder
        </button>

        <button
          type="button"
          className="toggleBtn"
          onClick={() => setIsEditing((value) => !value)}
        >
          {isEditing ? "Mode lecture" : "Mode edition"}
        </button>
      </header>

      {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}

      <label className="editorLabel" htmlFor={titleId}>
        Titre
      </label>
      <input
        id={titleId}
        className="titleInput"
        value={title}
        onChange={handleTitleChange}
        placeholder="Titre de la note"
        disabled={isLoading}
      />

      <div className="editorLabel">Contenu de la note</div>

      <div className="mdEditorShell" data-color-mode="dark">
        {isLoading ? (
          <p className="loadingText">Chargement...</p>
        ) : (
          <MilkdownProvider>
            <MilkdownEditor
              defaultValue={content}
              editorKey={editorKey}
              readonly={!isEditing}
              onChange={handleContentChange}
            />
          </MilkdownProvider>
        )}
      </div>
    </div>
  );
};

export default MarkdownPage;
