import React, { useState, useMemo } from "react";
import { FiCheck, FiX, FiSearch } from "react-icons/fi";
// Institutional Selection Foundation v1.0
import { motion, AnimatePresence } from "framer-motion";

interface VenueOption {
  code: string;
  name: string;
}

interface RegistryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (venues: string[]) => void;
  availableVenues: VenueOption[];
  initialSelected?: string[];
  title?: string;
  placeholder?: string;
}

/**
 * VenueSlotSelector Component
 * Features:
 * - Search/filter venues (or any options) by code or name
 * - Multi-select checkboxes
 * - Scrollable list
 * - Visual selection indicators
 * - Confirm/Cancel buttons
 */
const RegistryPicker: React.FC<RegistryPickerProps> = ({
  isOpen,
  onClose,
  onConfirm,
  availableVenues,
  initialSelected = [],
  title = "Select Exam Venues",
  placeholder = "Search venues...",
}) => {
  const [selectedVenues, setSelectedVenues] =
    useState<string[]>(initialSelected);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter venues based on search query
  const filteredVenues = useMemo(() => {
    if (!searchQuery.trim()) return availableVenues;

    const query = searchQuery.toLowerCase();
    return availableVenues.filter(
      (venue) =>
        venue.code.toLowerCase().includes(query) ||
        venue.name.toLowerCase().includes(query),
    );
  }, [searchQuery, availableVenues]);

  // Sync internal state when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedVenues(initialSelected);
      setSearchQuery("");
    }
  }, [isOpen, initialSelected]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const toggleVenue = (venueCode: string) => {
    setSelectedVenues((prev) =>
      prev.includes(venueCode)
        ? prev.filter((v) => v !== venueCode)
        : [...prev, venueCode],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedVenues);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brick/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={handleCancel}
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
        aria-labelledby="venue-selector-title"
      >
        <div className="bg-surface rounded-institutional shadow-2xl border border-brick/10 pointer-events-auto w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-brick/10 flex items-center justify-between flex-shrink-0">
            <h2
              id="venue-selector-title"
              className="text-sm font-black text-institutional-primary tracking-wide uppercase"
            >
              {title}
            </h2>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-brick/10 rounded transition-colors"
              type="button"
              aria-label="Close"
            >
              <FiX className="w-4 h-4 text-institutional-muted" />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-6 py-4 border-b border-brick/10 flex-shrink-0">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-institutional-muted" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all font-mono"
                autoFocus
              />
            </div>
          </div>

          {/* Venues List */}
          <div className="flex-1 overflow-y-auto min-h-0 institutional-scroll">
            {filteredVenues.length > 0 ? (
              <div className="px-6 py-4 space-y-2">
                <AnimatePresence>
                  {filteredVenues.map((venue, idx) => (
                    <motion.label
                      key={venue.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: idx * 0.01 }}
                      className="flex items-start gap-3 p-3 rounded-institutional border border-brick/5 hover:bg-brick/5 hover:border-brick/20 cursor-pointer transition-all group"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedVenues.includes(venue.code)}
                          onChange={() => toggleVenue(venue.code)}
                          className="w-5 h-5 accent-brick rounded-[4px] cursor-pointer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-institutional-primary group-hover:text-brick transition-colors">
                          {venue.code}
                        </div>
                        <div className="text-[10px] text-institutional-muted font-bold uppercase tracking-tighter line-clamp-2 italic">
                          {venue.name}
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-xs text-institutional-muted italic text-center">
                  {searchQuery.trim()
                    ? `No matches found for "${searchQuery}"`
                    : "No options available"}
                </div>
              </div>
            )}
          </div>

          {/* Selected Count */}
          <div className="px-6 py-4 border-t border-brick/10 bg-brick/5 flex-shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-brick">
              Selected: {selectedVenues.length} Item
              {selectedVenues.length !== 1 ? "s" : ""}
            </p>
            {selectedVenues.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2 max-h-[60px] overflow-y-auto">
                {selectedVenues.map((code) => (
                  <span
                    key={code}
                    className="px-2 py-0.5 bg-brick text-white rounded text-[10px] font-black uppercase"
                  >
                    {code}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-brick/10 flex gap-3 justify-end flex-shrink-0 bg-surface">
            <button
              onClick={handleCancel}
              className="px-5 py-2 rounded-institutional border border-brick/20 text-institutional-primary text-[10px] font-black uppercase tracking-widest hover:bg-page transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedVenues.length === 0}
              className="px-8 py-2 rounded-institutional bg-brick text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brick/20"
              type="button"
            >
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default RegistryPicker;
