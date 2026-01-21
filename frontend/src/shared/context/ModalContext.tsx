import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal } from "../components/Modal";

// Types d'actions possibles
type ModalType = "NONE" | "INPUT" | "CONFIRM";

interface ModalConfig {
  type: ModalType;
  title: string;
  message?: string;       // Pour la suppression
  placeholder?: string;   // Pour la création
  onConfirm: (inputValue?: string) => void | Promise<void>;
}

interface ModalContextType {
  openInputModal: (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>) => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ModalConfig>({
    type: "NONE",
    title: "",
    onConfirm: () => {},
  });
  const [inputValue, setInputValue] = useState("");

  const close = () => {
    setConfig((prev) => ({ ...prev, type: "NONE" }));
    setInputValue("");
  };

  const openInputModal = (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>) => {
    setInputValue("");
    setConfig({
      type: "INPUT",
      title,
      placeholder,
      onConfirm: async (val) => {
        await onConfirm(val!);
        close();
      },
    });
  };

  const openConfirmModal = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfig({
      type: "CONFIRM",
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        close();
      },
    });
  };

  return (
    <ModalContext.Provider value={{ openInputModal, openConfirmModal }}>
      {children}

      {/* --- LE COMPOSANT MODAL GLOBAL --- */}
      <Modal 
        isOpen={config.type !== "NONE"} 
        onClose={close} 
        title={config.title}
      >
        {config.type === "INPUT" && (
          <form onSubmit={(e) => { e.preventDefault(); config.onConfirm(inputValue); }}>
            <input 
              autoFocus
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder}
              style={{
                width: '100%', padding: '10px', 
                background: 'rgba(0,0,0,0.5)', border: '1px solid #ff6600', 
                borderRadius: '8px', color: 'white', outline: 'none',
              }}
            />
            <div className="modal-footer">
              <button type="button" onClick={close} className="btn-modal-cancel">Annuler</button>
              <button type="submit" className="btn-modal-confirm">Valider</button>
            </div>
          </form>
        )}

        {config.type === "CONFIRM" && (
          <div>
            <div style={{color: '#ccc', marginBottom: '1.5rem', textAlign: 'center'}}>
              {config.message}
            </div>
            <div className="modal-footer">
              <button onClick={close} className="btn-modal-cancel">Annuler</button>
              <button onClick={() => config.onConfirm()} className="btn-modal-confirm" style={{background: '#ff4444'}}>
                Confirmer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};