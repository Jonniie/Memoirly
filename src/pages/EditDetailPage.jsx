import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function EditDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [edit, setEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchEdit();
  }, [id]);

  const fetchEdit = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("edits")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEdit(data);
      setEditTitle(data.title);
    } catch (err) {
      console.error("Error fetching edit:", err);
      setError("Failed to load edit details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("edits").delete().eq("id", id);

      if (error) throw error;

      toast.success("Edit deleted successfully");
      navigate("/edits");
    } catch (err) {
      console.error("Error deleting edit:", err);
      toast.error("Failed to delete edit");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("edits")
        .update({
          title: editTitle,
          updated_at: now,
        })
        .eq("id", id);

      if (error) throw error;

      setEdit((prev) => ({ ...prev, title: editTitle, updated_at: now }));
      setIsEditing(false);
      toast.success("Title updated successfully");
    } catch (err) {
      console.error("Error updating title:", err);
      toast.error("Failed to update title");
    }
  };

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob
      const response = await fetch(edit.url);
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `${edit.title || "collage"}.png`;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (err) {
      console.error("Error downloading:", err);
      toast.error("Failed to download edit");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading edit details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <p className="text-error-600 mb-4">{error}</p>
          <button onClick={() => navigate("/edits")} className="btn-primary">
            Back to Edits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/edits")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Edits
        </button>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-error-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Edit
                </h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this edit? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="btn-danger flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-xl overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-2 text-green-600 hover:text-green-700"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(edit.title);
                  }}
                  className="p-2 text-gray-600 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {edit.title}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 size={20} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-4">
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
            {edit.type === "reel" ? (
              <div className="flex items-center justify-center h-full">
                <Film size={64} className="text-gray-400" />
              </div>
            ) : (
              <img
                src={edit.url}
                alt={edit.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="mt-6 text-sm text-gray-600">
            <p>
              Created on {new Date(edit.created_at).toLocaleDateString("en-GB")}
            </p>
            <p>
              {edit.updated_at === edit.created_at
                ? "Not modified since creation"
                : `Last updated on ${new Date(
                    edit.updated_at
                  ).toLocaleDateString("en-GB")}`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
