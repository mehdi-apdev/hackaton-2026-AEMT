import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal } from "../components/Modal";

// 1. Mise à jour des types
type ModalType = "NONE" | "INPUT" | "CONFIRM" | "INFO"; // Ajout de INFO

interface ModalConfig {
  type: ModalType;
  title: string;
  message?: string;
  placeholder?: string;
  onConfirm: (inputValue?: string) => void | Promise<void>;
  onCloseCustom?: () => void; // Pour gérer une action après fermeture d'une info
}

interface ModalContextType {
  openInputModal: (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>, defaultValue?: string) => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void | Promise<void>) => void;
  openInfoModal: (title: string, message: string, onClose?: () => void) => void; // AJOUT
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
    if (config.type === "INFO" && config.onCloseCustom) {
      config.onCloseCustom();
    }
    setConfig((prev) => ({ ...prev, type: "NONE" }));
    setInputValue("");
  };

  const openInputModal = (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>, defaultValue: string = "") => {
    setInputValue(defaultValue);
    setConfig({
      type: "INPUT",
      title,
      placeholder,
      onConfirm: async (val) => {
        if (typeof val === 'string') await onConfirm(val);
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

  // 2. Implémentation de openInfoModal
  const openInfoModal = (title: string, message: string, onClose?: () => void) => {
    setConfig({
      type: "INFO",
      title,
      message,
      onCloseCustom: onClose,
      onConfirm: () => close(), // Sur une info, confirmer ne fait que fermer
    });
  };

  return (
    // 3. Ne pas oublier d'ajouter la fonction dans la value du Provider
    <ModalContext.Provider value={{ openInputModal, openConfirmModal, openInfoModal }}>
      {children}

      <Modal isOpen={config.type !== "NONE"} onClose={close} title={config.title}>
        
        {config.type === "INPUT" && (
          <form onSubmit={(e) => { e.preventDefault(); config.onConfirm(inputValue); }}>
            <input 
              autoFocus
              className="modal-input"
              type="text" 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.placeholder}
            />
            <div className="modal-footer">
              <button type="button" onClick={close} className="btn-modal-cancel">Annuler</button>
              <button type="submit" className="btn-modal-confirm">Valider</button>
            </div>
          </form>
        )}

        {config.type === "CONFIRM" && (
          <div className="confirm-modal-content">
            <p className="confirm-message">{config.message}</p>
            <div className="modal-footer">
              <button onClick={close} className="btn-modal-cancel">Annuler</button>
              <button onClick={() => config.onConfirm()} className="btn-modal-confirm">Confirmer</button>
            </div>
          </div>
        )}

        {/* 4. Rendu pour le type INFO */}
        {config.type === "INFO" && (
          <div className="info-modal-content">
            {/* whiteSpace: 'pre-wrap' est crucial pour tes raccourcis clavier \n */}
            <p className="info-message" style={{ whiteSpace: 'pre-wrap' }}>
                {config.message}
            </p>
            <div className="modal-footer">
              <button onClick={close} className="btn-modal-confirm">Ok</button>
            </div>
          </div>
        )}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal doit être utilisé à l'intérieur d'un ModalProvider");
  return context;
};