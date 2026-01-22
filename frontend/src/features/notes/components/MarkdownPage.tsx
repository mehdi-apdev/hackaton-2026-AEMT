import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleNotch, faExclamationCircle} from "@fortawesome/free-solid-svg-icons";
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
import { jsPDF } from "jspdf";
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
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState({
    title: DEFAULT_TITLE,
    content: DEFAULT_CONTENT,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

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
        const noteRecord = note as Record<string, unknown>;
        const pickDate = (keys: string[]): string | null => {
          for (const key of keys) {
            const value = noteRecord[key];
            if (typeof value === "string" && value) return value;
          }
          return null;
        };
        const nextCreatedAt = pickDate(["createdAt", "created_at", "createdDate", "created_date"]);
        const nextUpdatedAt = pickDate(["updatedAt", "updated_at", "updatedDate", "updated_date"]);
        const fallbackCreatedAt = nextCreatedAt ?? nextUpdatedAt ?? new Date().toISOString();
        setTitle(nextTitle);
        setContent(nextContent);
        setCreatedAt(fallbackCreatedAt);
        setUpdatedAt(nextUpdatedAt ?? fallbackCreatedAt);
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

  useEffect(() => {
    const handleRename = (event: Event) => {
      if (!noteId) return;
      const detail = (event as CustomEvent<{ id: number; title: string }>).detail;
      if (!detail || detail.id !== noteId) return;
      setTitle(detail.title);
      setSavedSnapshot((prev) => ({ ...prev, title: detail.title }));
      setHasUnsavedChanges(false);
    };

    window.addEventListener("note:renamed", handleRename);
    return () => {
      window.removeEventListener("note:renamed", handleRename);
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
      window.dispatchEvent(new Event("notes:refresh"));
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible de sauvegarder la note!"
      );
    } finally {
      setIsSaving(false);
    }
  }, [noteId, title, content]);

  /**
   * Exports the current note as a PDF file.
   * Handles markdown stripping and formatting.
   * Sets error messages on failure.
   * Manages exporting state.
   */
  const handleExportPdf = useCallback(async () => {
    setIsExportingPdf(true);
    setErrorMessage(null);

    const stripMarkdown = (value: string) => {
      let result = value;
      result = result.replace(/```[\s\S]*?```/g, " ");
      result = result.replace(/`[^`]*`/g, " ");
      result = result.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
      result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
      result = result.replace(/^#{1,6}\s+/gm, "");
      result = result.replace(/^>\s?/gm, "");
      result = result.replace(/^(\s*[-*+]\s+|\s*\d+\.\s+)/gm, "");
      result = result.replace(/[*_~]/g, "");
      result = result.replace(/<[^>]+>/g, " ");
      return result;
    };

    const safeTitle = (title || "note").trim().replace(/[<>:"/\\|?*]+/g, "_");
    const plainText = stripMarkdown(content || "");

    /**
     * Generates a PDF from the note content.
     * Handles pagination and text wrapping.
     * Saves the PDF file with a safe filename.
     * Catches and sets error messages on failure.
     * Finally, resets the exporting state.
     */
    try {
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");
      doc.setTextColor(0, 0, 0);
      doc.setFont("times", "normal");

      const marginX = 15;
      let cursorY = 20;

      const titleText = title || "Note";
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      const titleLines = doc.splitTextToSize(titleText, 180);
      titleLines.forEach((line: string) => {
        doc.text(line, marginX, cursorY);
        cursorY += 7;
      });

      cursorY += 4;
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      const bodyLines = doc.splitTextToSize(plainText, 180);
      bodyLines.forEach((line: string) => {
        if (cursorY > 280) {
          doc.addPage();
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 210, 297, "F");
          cursorY = 20;
        }
        doc.text(line, marginX, cursorY);
        cursorY += 6;
      });

      doc.save(`${safeTitle || "note"}.pdf`);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible d'exporter le PDF."
      );
    } finally {
      setIsExportingPdf(false);
    }
  }, [title, content]);

  /**
   * Exports all notes as a ZIP archive.
   * Initiates download of the ZIP file.
   * Sets error messages on failure.
   * Manages exporting state.
   */
  const handleExportZip = useCallback(async () => {
    setIsExportingZip(true);
    setErrorMessage(null);
    try {
      const blob = await NoteService.exportArchive();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "notes-export.zip";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Impossible d'exporter l'archive."
      );
    } finally {
      setIsExportingZip(false);
    }
  }, []);

  /**
   * Auto-saves the note after a delay when there are unsaved changes (Delay is 800ms).
   * Skips saving if loading or already saving.
   * Also sets up a keyboard shortcut (Ctrl+S / Cmd+S) for manual saving.
   * Prevents default browser behavior on shortcut.
   * Skips saving if there are no unsaved changes.
   * Cleans up timeouts and event listeners appropriately.
   * Dependencies include noteId, isLoading, isSaving, hasUnsavedChanges, and handleSave.
   */
  useEffect(() => {
    if (!noteId || isLoading || isSaving || !hasUnsavedChanges) return;
    const timeoutId = window.setTimeout(() => {
      void handleSave();
    }, 800);
    return () => window.clearTimeout(timeoutId);
  }, [noteId, isLoading, isSaving, hasUnsavedChanges, handleSave]);

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
      ? "Modifications non enregistrées"
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
      setUpdatedAt(new Date().toISOString());
    },
    [updateDirtyState]
  );

  const metadata = useMemo(() => {
    const stripMarkdown = (value: string) => {
      let result = value;
      result = result.replace(/```[\s\S]*?```/g, " ");
      result = result.replace(/`[^`]*`/g, " ");
      result = result.replace(/!\[[^\]]*]\([^)]*\)/g, " ");
      result = result.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
      result = result.replace(/^#{1,6}\s+/gm, "");
      result = result.replace(/^>\s?/gm, "");
      result = result.replace(/^(\s*[-*+]\s+|\s*\d+\.\s+)/gm, "");
      result = result.replace(/[*_~]/g, "");
      result = result.replace(/<[^>]+>/g, " ");
      return result;
    };

    const cleaned = stripMarkdown(content);
    const normalized = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const trimmed = normalized.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = trimmed.length;
    const lines = normalized
      ? normalized.split("\n").filter((line) => line.trim().length > 0).length
      : 0;
    const bytes = new Blob([content]).size;

    return {
      words,
      characters,
      lines,
      bytes,
    };
  }, [content]);

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("fr-BE", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const statusIcon = isSaving ? faCircleNotch : hasUnsavedChanges ? faExclamationCircle : faCheck;

  return (
    <div className="markdownPage">
      <header className="markdownHeader">
        <div className="headerLeft">
          
          {/* Save status indicator */}
          <div className={`saveIndicator ${statusClass}`} title={statusLabel}>
            <FontAwesomeIcon icon={statusIcon} spin={isSaving} />
          </div>

        </div>

        <div className="headerActions">
          {/* Button to export the actual note as a PDF */}
          <button
            type="button"
            className="exportBtn"
            onClick={handleExportPdf}
            disabled={isLoading || isExportingPdf}
          >
            {isExportingPdf ? "Export PDF..." : "Export PDF"}
          </button>
          {/* Button to export the actual note as a ZIP archive */}
          <button
            type="button"
            className="exportBtn exportBtnSecondary"
            onClick={handleExportZip}
            disabled={isLoading || isExportingZip}
          >
            {isExportingZip ? "Export Archive..." : "Export Archive"}
          </button>

          {/* toggle switch to enable or disable edition mode */}
          <div className={`toggle-container ${isEditing ? "active" : ""}`}>
            <span>{isEditing ? "Édition" : "Lecture"}</span>
            <button
              type="button"
              className={`switch ${isEditing ? "on" : "off"}`}
              onClick={() => setIsEditing((prev) => !prev)} >
              <div className="handle" />
            </button>
          </div>

        </div>
      </header>

      {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}

      <input
        id={titleId}
        className="titleInput"
        value={title}
        onChange={handleTitleChange}
        placeholder="Titre de la note"
        disabled={isLoading || !isEditing}
      />

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

      <footer className="metadataPanel">
        <div className="metadataGroup">
          <span className="metadataLabel">Mots</span>
          <span className="metadataValue">{metadata.words}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Caractères</span>
          <span className="metadataValue">{metadata.characters}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Lignes</span>
          <span className="metadataValue">{metadata.lines}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Octets</span>
          <span className="metadataValue">{metadata.bytes}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Créé le</span>
          <span className="metadataValue">{formatDate(createdAt)}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Modifié le</span>
          <span className="metadataValue">{formatDate(updatedAt)}</span>
        </div>
      </footer>
    </div>
  );
};

export default MarkdownPage;
