import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiMapPin,
  FiSearch,
} from "react-icons/fi";
import { venueService } from "./services/api/venueService";
import { Venue } from "./types/institutional";

interface VenueListProps {
  onVenueList?: (val: string) => void;
}

/**
 * Institutional Infrastructure Asset Registry
 * Features: High-density data grid, unified branding, and refined administrative actions.
 */
export default function VenueList({ onVenueList }: VenueListProps) {
  const [formData, setFormData] = useState<Partial<Venue>>({
    venueCode: "",
    name: "",
    capacity: 0,
    actualCapacity: 0,
    type: 1,
    preference: 1,
    inUse: true,
  });

  const [venues, setVenues] = useState<Venue[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVenueData, setEditVenueData] = useState<Partial<Venue>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChangeForm = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      ...prev,
      [name]: ["capacity", "actualCapacity", "type", "preference"].includes(
        name,
      )
        ? parseInt(value)
        : name === "inUse"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const data = await venueService.getAll();
      setVenues(data);
    } catch (error: any) {
      toast.error(
        error.message || "Critical connection failure to venue ledger",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const filteredVenues = venues.filter((venue) => {
    const searchStr = searchQuery.toLowerCase();
    return (
      venue.venueCode?.toLowerCase().includes(searchStr) ||
      venue.name?.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleVenueSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.venueCode || !formData.name || !formData.capacity) {
      toast.warn("Verify all mandatory infrastructure asset fields");
      return;
    }

    try {
      await venueService.create(formData);
      toast.success("✅ Venue asset record committed");
      if (onVenueList) onVenueList("");
      setFormData({
        venueCode: "",
        name: "",
        capacity: 0,
        actualCapacity: 0,
        type: 1,
        preference: 1,
        inUse: true,
      });
      fetchVenues();
    } catch (error: any) {
      toast.error(error.message || "Critical failure during venue sync");
    }
  };

  const handleEditClick = (venue: Venue) => {
    setEditId(venue.id);
    setEditVenueData({ ...venue });
  };

  const handleSave = async (id: number) => {
    try {
      await venueService.update(id, editVenueData);
      toast.success("Venue record modified in ledger");
      setEditId(null);
      fetchVenues();
    } catch (error: any) {
      toast.error("Registry modification failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm("Purge venue record from infrastructure asset portfolio?")
    )
      return;
    try {
      await venueService.delete(id);
      toast.success("Venue record purged successfully");
      fetchVenues();
    } catch (error: any) {
      toast.error("Critical failure during venue purge");
    }
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Registration Section */}
      <section className="bg-surface p-8 rounded-institutional border border-brick/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-brick" />
        <div className="flex items-center gap-3 mb-8 border-b border-brick/5 pb-4">
          <FiMapPin className="text-brick text-xl" />
          <h2 className="text-lg font-black text-institutional-primary tracking-tight">
            Infrastructure Asset Enrollment
          </h2>
        </div>

        <form onSubmit={handleVenueSubmit} className="space-y-6">
          <div className="form-grid-institutional">
            {[
              {
                label: "Venue Code",
                name: "venueCode",
                placeholder: "e.g. HAL-101",
              },
              { label: "Official Name", name: "name" },
              { label: "Max Capacity", name: "capacity" },
              { label: "Actual Capacity", name: "actualCapacity" },
              { label: "Type ID", name: "type" },
              { label: "Allocation Pref.", name: "preference" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-institutional-muted">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  className="w-full px-4 py-2.5 bg-page border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all"
                  value={(formData as any)[field.name]}
                  onChange={handleInputChangeForm}
                />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-brick/5">
            <button
              type="submit"
              className="px-12 py-3.5 bg-brick text-white rounded-institutional text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brick/20 hover:scale-[1.02] transition-all"
            >
              Commit Asset Entry
            </button>
          </div>
        </form>
      </section>

      {/* Ledger Section */}
      <div className="institutional-table-container">
        <div className="p-4 border-b border-brick/10 bg-page/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-1 max-w-2xl gap-2">
            <div className="relative flex-1 group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brick group-focus-within:scale-110 transition-transform">
                <FiSearch size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by Code, Name, or Location..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface border border-brick/10 rounded-institutional text-sm font-bold text-institutional-primary focus:outline-none focus:ring-2 focus:ring-brick/20 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="text-[10px] font-black uppercase text-institutional-muted tracking-widest bg-brick/5 px-3 py-2 rounded-full border border-brick/10 inline-flex items-center self-start md:self-center">
            {isLoading
              ? "Synchronizing..."
              : `Portfolio: ${filteredVenues.length} assets`}
          </div>
        </div>

        <table className="institutional-table">
          <thead>
            <tr>
              <th>Venue Code</th>
              <th>Designation</th>
              <th className="text-center">Capacity (Max/Act)</th>
              <th className="text-center">Preference</th>
              <th className="text-center">Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brick/5">
            {paginatedVenues.map((venue) => (
              <tr
                key={venue.id}
                className="hover:bg-brick/5 transition-colors group"
              >
                {editId === venue.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editVenueData.venueCode}
                        onChange={(e) =>
                          setEditVenueData((p) => ({
                            ...p,
                            venueCode: e.target.value,
                          }))
                        }
                        className="w-24 bg-page border border-brick/20 px-2 py-1 rounded text-xs font-bold"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editVenueData.name}
                        onChange={(e) =>
                          setEditVenueData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-page border border-brick/20 px-2 py-1 rounded text-xs"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <input
                          value={editVenueData.capacity}
                          onChange={(e) =>
                            setEditVenueData((p) => ({
                              ...p,
                              capacity: parseInt(e.target.value),
                            }))
                          }
                          className="w-12 bg-page border border-brick/20 px-1 py-1 rounded text-xs text-center"
                          placeholder="Max"
                        />
                        <span className="text-institutional-muted">/</span>
                        <input
                          value={editVenueData.actualCapacity}
                          onChange={(e) =>
                            setEditVenueData((p) => ({
                              ...p,
                              actualCapacity: parseInt(e.target.value),
                            }))
                          }
                          className="w-12 bg-page border border-brick/20 px-1 py-1 rounded text-xs text-center"
                          placeholder="Act"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        value={editVenueData.preference}
                        onChange={(e) =>
                          setEditVenueData((p) => ({
                            ...p,
                            preference: parseInt(e.target.value),
                          }))
                        }
                        className="w-16 mx-auto bg-page border border-brick/20 px-2 py-1 rounded text-xs text-center"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editVenueData.inUse}
                        onChange={(e) =>
                          setEditVenueData((p) => ({
                            ...p,
                            inUse: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-brick rounded border-gray-300 focus:ring-brick"
                      />
                    </td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() => handleSave(venue.id)}
                        className="p-1.5 text-status-success hover:bg-status-success/10 rounded transition-colors"
                      >
                        <FiSave size={14} />
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="p-1.5 text-institutional-muted hover:bg-page rounded transition-colors"
                      >
                        <FiXCircle size={14} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-mono text-brick font-black tracking-tighter">
                      {venue.venueCode}
                    </td>
                    <td className="text-sm font-bold uppercase tracking-tight">
                      {venue.name}
                    </td>
                    <td className="text-center font-black opacity-80">
                      {venue.capacity}{" "}
                      <span className="text-[10px] opacity-40">
                        / {venue.actualCapacity}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="status-pill status-pill-info">
                        Rank {venue.preference}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          venue.inUse
                            ? "bg-status-success/10 text-status-success"
                            : "bg-status-error/10 text-status-error"
                        }`}
                      >
                        {venue.inUse ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-right space-x-1">
                      <button
                        onClick={() => handleEditClick(venue)}
                        className="p-2 text-brick opacity-0 group-hover:opacity-100 hover:bg-brick/10 rounded-full transition-all duration-300"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(venue.id)}
                        className="p-2 text-status-error opacity-0 group-hover:opacity-100 hover:bg-status-error/10 rounded-full transition-all duration-300"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-4 border-t border-brick/10 bg-page/30">
            <p className="text-[10px] uppercase font-bold text-institutional-muted tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px] font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-brick/10 rounded text-[10px] font-black uppercase disabled:opacity-50 hover:bg-brick/5 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
