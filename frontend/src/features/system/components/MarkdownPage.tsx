import { useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownPage.css";

const MarkdownPage = () => {
  const textareaId = useId();

  const [isEditing, setIsEditing] = useState<boolean>(true);
  const [content, setContent] = useState<string>(
`# Markdown editor

Ecrire ici en **Markdown**

- Liste
- **Gras**
- \`code\`

## Exemple
- [x] Fait
- [ ] À faire
`);

  return (
    <div className="markdownPage">
      <header className="markdownHeader">
        <h2 className="markdownTitle">Markdown</h2>

        <button
          type="button"
          className="toggleBtn"
          onClick={() => setIsEditing((v) => !v)}
        >
          {isEditing ? "Mode lecture" : "Mode édition"}
        </button>
      </header>

      {isEditing ? (
        <>
          <label className="editorLabel" htmlFor={textareaId}>
            Contenu Markdown
          </label>

          <textarea
            id={textareaId}
            className="editorTextarea"
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
            placeholder="Écris ton Markdown ici..."
          />
        </>
      ) : (
        <div className="previewBox">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default MarkdownPage;
