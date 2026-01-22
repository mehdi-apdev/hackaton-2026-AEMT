import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCircleNotch, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/core";
import type { EditorView } from "@milkdown/prose/view";
import { jsPDF } from "jspdf";
import NoteService from "../services/NoteService";
import FolderService from "../services/FolderService";
import type { Folder } from "../models/Folder";
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

type LinkNote = {
  id: number;
  title: string;
};

type MilkdownEditorProps = {
  defaultValue: string;
  editorKey: number;
  readonly: boolean;
  onChange: (markdown: string) => void;
  onReady?: (crepe: Crepe) => void;
};

const MilkdownEditor = ({
  defaultValue,
  editorKey,
  readonly,
  onChange,
  onReady,
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

  useEffect(() => {
    if (crepeRef.current) {
      onReady?.(crepeRef.current);
    }
  }, [editorKey, onReady]);

  return <Milkdown />;
};

const MarkdownPage = () => {
  const titleId = useId();
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [linkNotes, setLinkNotes] = useState<LinkNote[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextFilter, setContextFilter] = useState("");

  const titleRef = useRef(title);
  const savedSnapshotRef = useRef(savedSnapshot);
  const crepeRef = useRef<Crepe | null>(null);
  const editorCleanupRef = useRef<(() => void) | null>(null);
  const isEditingRef = useRef(isEditing);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    savedSnapshotRef.current = savedSnapshot;
  }, [savedSnapshot]);

  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("contextmenu", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("contextmenu", closeMenu);
    };
  }, [contextMenu]);

  const loadLinkNotes = useCallback(async () => {
    try {
      const tree = await FolderService.getTree();
      const collected: LinkNote[] = [];
      const seen = new Set<number>();

      const walk = (nodes: Folder[]) => {
        nodes.forEach((folder) => {
          folder.notes?.forEach((note) => {
            if (!note || !Number.isFinite(note.id) || seen.has(note.id)) return;
            seen.add(note.id);
            collected.push({ id: note.id, title: note.title || `Note ${note.id}` });
          });
          if (folder.children?.length) walk(folder.children);
        });
      };

      walk(tree);
      collected.sort((a, b) => a.title.localeCompare(b.title));
      setLinkNotes(collected);
    } catch {
      setLinkNotes([]);
    }
  }, []);

  useEffect(() => {
    void loadLinkNotes();
  }, [loadLinkNotes]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadLinkNotes();
    };
    window.addEventListener("notes:refresh", handleRefresh);
    return () => {
      window.removeEventListener("notes:refresh", handleRefresh);
    };
  }, [loadLinkNotes]);

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
      setUpdatedAt(new Date().toISOString());
    },
    [updateDirtyState]
  );

  const resolveInternalNoteId = useCallback((href: string) => {
    const trimmed = href.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("note://")) {
      const rawId = trimmed.slice("note://".length);
      const parsed = Number(rawId.split(/[?#]/)[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }

    if (trimmed.startsWith("note:")) {
      const rawId = trimmed.slice("note:".length);
      const parsed = Number(rawId.split(/[?#]/)[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }

    try {
      const url = new URL(trimmed, window.location.origin);
      if (!url.pathname.startsWith("/note/")) return null;
      const rawId = url.pathname.slice("/note/".length);
      const parsed = Number(rawId.split(/[?#]/)[0]);
      return Number.isFinite(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, []);

  const handleInternalLinkClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const internalId = resolveInternalNoteId(href);
      if (!internalId) return;
      event.preventDefault();
      event.stopPropagation();
      navigate(`/note/${internalId}`);
    },
    [navigate, resolveInternalNoteId]
  );

  const handleEditorContextMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!isEditingRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      setContextFilter("");
      setContextMenu({ x: event.clientX, y: event.clientY });
    },
    []
  );

  const insertNoteLink = useCallback(
    (note: LinkNote) => {
      if (!isEditingRef.current) return;
      setContent((prev) => {
        const spacer = prev.endsWith("\n") || prev.length === 0 ? "" : "\n";
        const next = `${prev}${spacer}[${note.title}](note:${note.id})`;
        updateDirtyState(titleRef.current, next);
        return next;
      });
      setUpdatedAt(new Date().toISOString());
      setEditorKey((value) => value + 1);
      setContextMenu(null);
    },
    [updateDirtyState]
  );

  const attachEditorHandlers = useCallback(
    (view: EditorView) => {
      editorCleanupRef.current?.();
      const handleContextMenu = (event: globalThis.MouseEvent) => {
        if (!isEditingRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        setContextFilter("");
        setContextMenu({ x: event.clientX, y: event.clientY });
      };

      const handleLinkClick = (event: globalThis.MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const link = target?.closest("a");
        if (!link) return;
        const href = link.getAttribute("href") ?? "";
        const internalId = resolveInternalNoteId(href);
        if (!internalId) return;
        event.preventDefault();
        event.stopPropagation();
        navigate(`/note/${internalId}`);
      };

      view.dom.addEventListener("contextmenu", handleContextMenu, true);
      view.dom.addEventListener("click", handleLinkClick, true);
      editorCleanupRef.current = () => {
        view.dom.removeEventListener("contextmenu", handleContextMenu, true);
        view.dom.removeEventListener("click", handleLinkClick, true);
      };
    },
    [navigate, resolveInternalNoteId]
  );

  const handleEditorReady = useCallback(
    (crepe: Crepe) => {
      crepeRef.current = crepe;
      crepe.on((listener) => {
        listener.mounted((ctx) => {
          try {
            const view = ctx.get(editorViewCtx);
            attachEditorHandlers(view);
          } catch {
            // Editor view not ready yet.
          }
        });
      });
    },
    [attachEditorHandlers]
  );

  useEffect(() => {
    return () => {
      editorCleanupRef.current?.();
    };
  }, []);

  const filteredContextNotes = useMemo(() => {
    const query = contextFilter.trim().toLowerCase();
    const list = query
      ? linkNotes.filter((note) => note.title.toLowerCase().includes(query))
      : linkNotes;
    return list.slice(0, 20);
  }, [contextFilter, linkNotes]);

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
          <div className={`saveIndicator ${statusClass}`} title={statusLabel}>
            <FontAwesomeIcon icon={statusIcon} spin={isSaving} />
          </div>
        </div>

        <div className="headerActions">
          <button
            type="button"
            className="exportBtn"
            onClick={handleExportPdf}
            disabled={isLoading || isExportingPdf}
          >
            {isExportingPdf ? "Export PDF..." : "Export PDF"}
          </button>
          <button
            type="button"
            className="exportBtn exportBtnSecondary"
            onClick={handleExportZip}
            disabled={isLoading || isExportingZip}
          >
            {isExportingZip ? "Export Archive..." : "Export Archive"}
          </button>
          <div className={`toggle-container ${isEditing ? "active" : ""}`}>
            <span>{isEditing ? "Edition" : "Lecture"}</span>
            <button
              type="button"
              className={`switch ${isEditing ? "on" : "off"}`}
              onClick={() => setIsEditing((prev) => !prev)}
            >
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

      <div
        className="mdEditorShell"
        data-color-mode="dark"
        onClickCapture={handleInternalLinkClick}
        onContextMenu={handleEditorContextMenu}
        onContextMenuCapture={handleEditorContextMenu}
      >
        {isLoading ? (
          <p className="loadingText">Chargement...</p>
        ) : (
          <MilkdownProvider>
            <MilkdownEditor
              defaultValue={content}
              editorKey={editorKey}
              readonly={!isEditing}
              onChange={handleContentChange}
              onReady={handleEditorReady}
            />
          </MilkdownProvider>
        )}
      </div>

      {contextMenu ? (
        <div
          className="noteContextMenu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="noteContextMenuHeader">Inserer un lien vers une note</div>
          <input
            className="noteContextMenuInput"
            placeholder="Filtrer..."
            value={contextFilter}
            onChange={(event) => setContextFilter(event.target.value)}
          />
          <div className="noteContextMenuList">
            {filteredContextNotes.length ? (
              filteredContextNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className="noteContextMenuItem"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    insertNoteLink(note);
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    insertNoteLink(note);
                  }}
                >
                  {note.title}
                </button>
              ))
            ) : (
              <div className="noteContextMenuEmpty">Aucune note</div>
            )}
          </div>
        </div>
      ) : null}

      <footer className="metadataPanel">
        <div className="metadataGroup">
          <span className="metadataLabel">Mots</span>
          <span className="metadataValue">{metadata.words}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Caracteres</span>
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
          <span className="metadataLabel">Cree le</span>
          <span className="metadataValue">{formatDate(createdAt)}</span>
        </div>
        <div className="metadataGroup">
          <span className="metadataLabel">Modifie le</span>
          <span className="metadataValue">{formatDate(updatedAt)}</span>
        </div>
      </footer>
    </div>
  );
};

export default MarkdownPage;
