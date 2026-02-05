import React from "react";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  icon?: "alert" | "check" | "none";
  details?: React.ReactNode;
}

/**
 * ConfirmModal Component
 * Features:
 * - Action confirmation dialog
 * - Optional icon display
 * - Danger mode for destructive actions (red button)
 * - Optional details section
 * - Smooth animations
 * - Institutional design system compliance
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  icon = "none",
  details,
}) => {
  if (!isOpen) return null;

  const getIconComponent = () => {
    switch (icon) {
      case "alert":
        return <FiAlertCircle className="w-6 h-6 text-status-error" />;
      case "check":
        return <FiCheckCircle className="w-6 h-6 text-brick" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brick/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onCancel}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="bg-surface rounded-institutional shadow-2xl border border-brick/10 pointer-events-auto w-full max-w-sm animate-fadeInUp">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onCancel}
              className="p-1 hover:bg-brick/10 rounded transition-colors"
              type="button"
              aria-label="Close"
            >
              <FiX className="w-4 h-4 text-institutional-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Icon */}
            {icon !== "none" && (
              <div className="flex justify-center mb-4">
                {getIconComponent()}
              </div>
            )}

            {/* Title */}
            <h2
              id="confirm-modal-title"
              className="text-lg font-black text-institutional-primary tracking-tight text-center mb-3"
            >
              {title}
            </h2>

            {/* Message */}
            <p className="text-sm text-institutional-primary text-center mb-4 leading-relaxed">
              {message}
            </p>

            {/* Details Section */}
            {details && (
              <div className="bg-brick/5 border border-brick/10 rounded-institutional p-4 mb-6">
                {details}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-brick/10 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-institutional border border-brick/20 text-institutional-primary text-xs font-black uppercase tracking-widest hover:bg-page transition-colors"
              type="button"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`
                px-5 py-2.5 rounded-institutional text-white text-xs font-black uppercase tracking-widest
                transition-all shadow-md
                ${
                  isDangerous
                    ? "bg-status-error hover:brightness-110 shadow-status-error/20"
                    : "bg-brick hover:brightness-110 shadow-brick/20"
                }
              `}
              type="button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ConfirmModal;
