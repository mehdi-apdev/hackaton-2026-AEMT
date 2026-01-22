import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal } from "../components/Modal";

// Actions types for modals. Every type we can use 
type ModalType = "NONE" | "INPUT" | "CONFIRM";

interface ModalConfig {
  type: ModalType;
  title: string;
  message?: string;       // For deletion
  placeholder?: string;   // For creation
  onConfirm: (inputValue?: string) => void | Promise<void>;
}

// first step : here, we configure the functions to open different modals
interface ModalContextType {
  openInputModal: (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>, defaultValue?: string) => void;
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

  // Then we define the functions to open specific modals
  // Here is the function to open an input modal
  const openInputModal = (title: string, placeholder: string, onConfirm: (val: string) => void | Promise<void>, defaultValue: string = "") => {
    setInputValue(defaultValue);
    setConfig({
      type: "INPUT",
      title,
      placeholder,
      onConfirm: async (val) => {
        if (typeof val === 'string') {
            await onConfirm(val);
        }
        close();
      },
    });
  };
  // Same here, we define the function to open a confirmation modal
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

  // Finally, we render the provider with the modal and its content
  return (
    <ModalContext.Provider value={{ openInputModal, openConfirmModal }}>
      {children}

      {/* Modal component */}
      <Modal isOpen={config.type !== "NONE"} onClose={close} title={config.title}>
        {/* Modal content based on type */}
        {/* It's either an input modal or a confirmation modal
        Depend of what we choose when calling it in other classes 
        Is it a input modal or a confirmation modal?
        For example if it's an input modal, we render an input field. */}
        {config.type === "INPUT" && (
          <form onSubmit={(e) => { e.preventDefault(); config.onConfirm(inputValue); }}>
            <input 
              autoFocus
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

        {/* If the type is CONFIRM, then we render a confirmation message and buttons */}
        {config.type === "CONFIRM" && (
          <div className="confirm-modal-content">
            <p className="confirm-message">{config.message}</p>
            <div className="modal-footer">
              <button onClick={close} className="btn-modal-cancel">Annuler</button>
              <button onClick={() => config.onConfirm()} className="btn-modal-confirm">Confirmer</button>
            </div>
          </div>
        )}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) 
    throw new Error("useModal doit être utilisé à l'intérieur d'un ModalProvider");
  return context;
};


/**
 * I want to explain this briefly and clearly.
 * 
 * Basically, this code is the orchestra conductor for modals in our website.
 * We create a special context (like a backstage pass) that allows any component
 * in our React app to open different types of modals (pop-up windows) without
 * needing to know the details of how those modals are implemented.
 * 
 * Here's how it works:
 * In the ModalProvider component, we define two main functions:
 * 1. openInputModal: This function opens a modal with an input field.
 *   You can specify the title, placeholder text, and what to do when the user submits the input.
 * 2. openConfirmModal: This function opens a confirmation modal.
 *  You provide a title, a message, and an action to perform if the user confirms.
 * 
 * Ok but where do we use it?
 * Any component that needs to show a modal. For example in LeftSidebar.tsx,
 * we import the useModal hook and call openInputModal when the user wants to
 * create a new folder or note. This keeps our code clean.
 * ----------------------------------------------------------------
 * Modal.tsx is the actual modal component that displays the content. It's an empty shell
 * that gets filled based on what the ModalProvider tells it to show.
 */