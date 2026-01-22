// React hooks for component lifecycle and DOM references
import { type ReactNode, useEffect, useRef } from "react";
import "./Modal.css";

/**
 * Props for the Modal component
 */
type ModalProps = {
  isOpen: boolean;        // Controls modal visibility
  onClose: () => void;    // Callback function to close the modal
  title: string;          // Title displayed in modal header
  children: ReactNode;    // Content to display in modal body
};

/**
 * Modal - Reusable modal dialog component
 * Features:
 * - Close on Escape key press
 * - Close when clicking outside the modal content
 * - Animated entrance with glassmorphism design
 */
export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  // Reference to modal content div for click-outside detection
  const modalRef = useRef<HTMLDivElement>(null);

  /**
   * Effect: Close modal when Escape key is pressed
   * Only active when modal is open
   */
  useEffect(() => {
    const escapeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape")
        onClose();
    };
    if (isOpen)
      window.addEventListener("keydown", escapeMenu);
    return () => window.removeEventListener("keydown", escapeMenu);
  }, [isOpen, onClose]);

  /**
   * Handler: Close modal when clicking on the dark overlay
   * Does not close if clicking inside the modal content
   */
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen)
    return null;

  return (
    // Semi-transparent overlay that covers the entire screen
    <div className="modal-overlay" onClick={handleOverlayClick}>
      {/* Modal content box with glassmorphism effect */}
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
