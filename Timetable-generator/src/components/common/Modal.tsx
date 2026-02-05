import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Institutional Modal
 * Features: High-contrast backdrop, disciplined geometry, and academic contrast.
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with policy-allowed blur */}
      <div
        className="fixed inset-0 bg-brick/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="institutional-modal-title"
      >
        <div
          className={`bg-surface rounded-institutional shadow-2xl max-w-md w-full pointer-events-auto border border-brick/10 animate-fadeInUp ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Institutional Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-brick/5">
            <h2
              id="institutional-modal-title"
              className="text-lg font-black text-institutional-primary tracking-tight"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-institutional bg-page hover:bg-brick/5 text-institutional-muted hover:text-brick transition-all flex items-center justify-center"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Academic Payload */}
          <div className="px-8 py-8">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
