import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Tag,
  MapPin,
  Edit,
  Trash2,
  Heart,
  Download,
  Share2,
  ArrowLeft,
  Save,
  Loader2,
  Copy,
  Check,
  Lock,
  Unlock,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";
import AITagger from "../components/edits/AITagger";

// Animation variants
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const mediaVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const detailsVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export default function MemoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMemory, setEditedMemory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [showShareConfirm, setShowShareConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pageRef = useRef(null);
  const mediaRef = useRef(null);
  const detailsRef = useRef(null);
  const shareModalRef = useRef(null);
  const [showAITagger, setShowAITagger] = useState(false);

  const fetchMemory = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("media")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const transformedMemory = {
          id: data.id,
          publicId: data.public_id,
          url: data.url,
          thumbnailUrl: data.url,
          type: data.type,
          title: data.caption || data.url.split("/").pop(),
          note: data.note || "",
          createdAt: data.created_at,
          tags: data.tags || [],
          emotion: data.emotion || "neutral",
          location: data.location || "",
          favourite: data.favourite || false,
          isPublic: data.is_public || false,
        };

        setMemory(transformedMemory);
        setEditedMemory(transformedMemory);
      }
    } catch (err) {
      console.error("Error fetching memory:", err);
      setError("Failed to load memory details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Split tags only when saving and remove trailing commas
      const tagsArray = editedMemory.tags
        .replace(/,\s*$/, "") // Remove trailing comma
        .split(/,\s+|\n/)
        .map((tag) => tag.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("media")
        .update({
          caption: editedMemory.title,
          note: editedMemory.note,
          emotion: editedMemory.emotion,
          location: editedMemory.location,
          tags: tagsArray,
        })
        .eq("id", id);

      if (error) throw error;

      // Update the local state with the edited memory
      setMemory({ ...editedMemory, tags: tagsArray });
      setIsEditMode(false);
    } catch (err) {
      console.error("Error updating memory:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMemory((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e) => {
    const tagsString = e.target.value;
    setEditedMemory((prev) => ({ ...prev, tags: tagsString }));
  };

  const handleToggleFavorite = async () => {
    try {
      setIsFavoriting(true);
      setError(null);

      const newFavoriteState = !memory.favourite;

      const { error } = await supabase
        .from("media")
        .update({ favourite: newFavoriteState })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setMemory((prev) => ({ ...prev, favourite: newFavoriteState }));
      setEditedMemory((prev) => ({ ...prev, favourite: newFavoriteState }));
    } catch (err) {
      console.error("Error updating favorite status:", err);
      setError("Failed to update favorite status. Please try again.");
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError(null);

      // Fetch the file
      const response = await fetch(memory.url);
      if (!response.ok) throw new Error("Failed to fetch file");

      // Get the blob data
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Format the filename
      let filename = memory.title || `memory-${memory.id}`;

      // Check if filename already has an extension
      const hasExtension = /\.[^/.]+$/.test(filename);

      // Only add extension if it doesn't have one
      if (!hasExtension) {
        if (memory.type === "image") {
          filename += ".jpg";
        } else if (memory.type === "video") {
          // Get the extension from the URL or default to .mp4
          const urlExtension = memory.url.split(".").pop().toLowerCase();
          filename += `.${urlExtension || "mp4"}`;
        }
      }

      // Clean the filename (remove special characters and spaces)
      filename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

      // Create a temporary anchor element
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading memory:", err);
      setError("Failed to download memory. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTogglePublic = async () => {
    try {
      setIsTogglingPublic(true);
      setError(null);

      const newPublicState = !memory.isPublic;

      const { error } = await supabase
        .from("media")
        .update({ is_public: newPublicState })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setMemory((prev) => ({ ...prev, isPublic: newPublicState }));
      setEditedMemory((prev) => ({ ...prev, isPublic: newPublicState }));
    } catch (err) {
      console.error("Error updating public status:", err);
      setError("Failed to update public status. Please try again.");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setError(null);

      // If memory is not public, show confirmation modal
      if (!memory.isPublic) {
        setShowShareConfirm(true);
        return;
      }

      // Generate the shared memory URL
      const shareUrl = `${window.location.origin}/shared/${memory.id}`;

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: memory.title,
          text:
            memory.note ||
            `Check out this memory from ${format(
              new Date(memory.createdAt),
              "MMMM d, yyyy"
            )}`,
          url: shareUrl,
        });
      } else {
        // Show share options modal
        setShowShareConfirm(true);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing memory:", err);
        setError("Failed to share memory. Please try again.");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/shared/${memory.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
      setShowShareConfirm(false);
    } catch (err) {
      console.error("Error copying link:", err);
      setError("Failed to copy link. Please try again.");
    }
  };

  const handleMakePrivate = async () => {
    try {
      setIsTogglingPublic(true);
      setError(null);

      const { error } = await supabase
        .from("media")
        .update({ is_public: false })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setMemory((prev) => ({ ...prev, isPublic: false }));
      setEditedMemory((prev) => ({ ...prev, isPublic: false }));
      setShowShareConfirm(false);
    } catch (err) {
      console.error("Error updating public status:", err);
      setError("Failed to update public status. Please try again.");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleConfirmShare = async () => {
    try {
      setIsSharing(true);
      setError(null);

      // Make the memory public
      const { error: updateError } = await supabase
        .from("media")
        .update({ is_public: true })
        .eq("id", id);

      if (updateError) throw updateError;

      // Update local state
      setMemory((prev) => ({ ...prev, isPublic: true }));
      setEditedMemory((prev) => ({ ...prev, isPublic: true }));

      // Generate the shared memory URL
      const shareUrl = `${window.location.origin}/shared/${memory.id}`;

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: memory.title,
          text:
            memory.note ||
            `Check out this memory from ${format(
              new Date(memory.createdAt),
              "MMMM d, yyyy"
            )}`,
          url: shareUrl,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error sharing memory:", err);
        setError("Failed to share memory. Please try again.");
      }
    } finally {
      setIsSharing(false);
      setShowShareConfirm(false);
    }
  };

  const handleCancelShare = () => {
    setShowShareConfirm(false);
    setIsSharing(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      const { error } = await supabase.from("media").delete().eq("id", id);
      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting memory:", err);
      setError("Failed to delete memory. Please try again.");
      setIsDeleting(false);
    }
  };

  const handleZoom = (direction) => {
    setScale((prev) => {
      const newScale = direction === "in" ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newScale, 1), 4); // Limit zoom between 1x and 4x
    });
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading memory details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Memory not found</p>
          <button onClick={handleGoBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={handleGoBack}
            className="btn-outline flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAITagger(true)}
              className="btn-primary flex items-center"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Tags
            </button>
            <button
              onClick={handleEdit}
              className="btn-outline flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        <motion.div
          variants={contentVariants}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="lg:flex">
            {/* Media Section */}
            <motion.div
              variants={mediaVariants}
              className="lg:w-7/12 bg-gray-100"
            >
              <div className="relative">
                {memory.type === "image" ? (
                  <motion.img
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    src={memory.url}
                    alt={memory.title}
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "80vh" }}
                  />
                ) : (
                  <motion.video
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    src={memory.url}
                    controls
                    className="w-full h-full object-cover"
                    style={{ maxHeight: "80vh" }}
                  />
                )}
                <button
                  onClick={() => setIsFullScreen(true)}
                  className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <Maximize2 size={20} />
                </button>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div variants={detailsVariants} className="lg:w-5/12 p-6">
              {isEditMode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={editedMemory.title}
                      onChange={handleChange}
                      className="input"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Note
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={editedMemory.note}
                      onChange={handleChange}
                      rows={4}
                      className="input"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emotion"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Emotion
                    </label>
                    <input
                      type="text"
                      id="emotion"
                      name="emotion"
                      value={editedMemory.emotion}
                      onChange={handleChange}
                      className="input"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Location / Source
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={editedMemory.location}
                      onChange={handleChange}
                      className="input"
                      disabled={isSaving}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tags"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={
                        Array.isArray(editedMemory.tags)
                          ? editedMemory.tags.join(", ")
                          : editedMemory.tags
                      }
                      onChange={handleTagsChange}
                      className="input"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditMode(false)}
                      className="btn-outline mr-2"
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn-primary flex items-center"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-1" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl font-bold text-gray-900">
                        {memory.title.length > 12
                          ? memory.title.substring(0, 15) + "..."
                          : memory.title}
                      </h1>
                      <button
                        onClick={handleTogglePublic}
                        disabled={isTogglingPublic}
                        className={cn(
                          "text-gray-500 hover:text-primary-600 transition-colors",
                          memory.isPublic && "text-primary-600"
                        )}
                        title={memory.isPublic ? "Public" : "Private"}
                      >
                        {isTogglingPublic ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : memory.isPublic ? (
                          <Unlock size={18} />
                        ) : (
                          <Lock size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 text-sm space-x-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      <span>
                        {format(new Date(memory.createdAt), "MMMM d, yyyy")}
                      </span>
                    </div>

                    {memory.location && (
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-1" />
                        <span>{memory.location}</span>
                      </div>
                    )}
                  </div>

                  {memory.emotion && (
                    <div className="inline-block">
                      <span className="badge-accent">{memory.emotion}</span>
                    </div>
                  )}

                  {memory.note && (
                    <p className="text-gray-700 mt-4">{memory.note}</p>
                  )}

                  {memory.tags && memory.tags.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 pt-2">
                      <Tag size={16} className="text-gray-500" />
                      {memory.tags.map((tag) => (
                        <span key={tag} className="badge-secondary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-200 mt-6 flex-wrap sm:flex-nowrap gap-4">
                    <button
                      onClick={handleToggleFavorite}
                      disabled={isFavoriting}
                      className={cn(
                        "btn-ghost flex items-center",
                        memory.favourite && "text-primary-600"
                      )}
                    >
                      {isFavoriting ? (
                        <Loader2 size={18} className="mr-1 animate-spin" />
                      ) : (
                        <Heart
                          size={18}
                          className={cn(
                            "mr-1",
                            memory.favourite && "fill-current"
                          )}
                        />
                      )}
                      {memory.favourite ? "Favorited" : "Favorite"}
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="btn-outline flex items-center"
                      >
                        {isDownloading ? (
                          <Loader2 size={18} className="mr-1 animate-spin" />
                        ) : (
                          <Download size={18} className="mr-1" />
                        )}
                        Download
                      </button>
                      <button
                        onClick={handleShare}
                        disabled={isSharing}
                        className="btn-outline flex items-center"
                      >
                        {isSharing ? (
                          <Loader2 size={18} className="mr-1 animate-spin" />
                        ) : shareSuccess ? (
                          <Check size={18} className="mr-1" />
                        ) : (
                          <Share2 size={18} className="mr-1" />
                        )}
                        {shareSuccess ? "Copied!" : "Share"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Share Confirmation Modal */}
        <AnimatePresence>
          {showShareConfirm && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                variants={modalVariants}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {!memory.isPublic ? "Make Memory Public?" : "Share Options"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {!memory.isPublic
                    ? "This memory will be made public and accessible to anyone with the link. You can make it private again later."
                    : "Choose how you want to share this memory."}
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowShareConfirm(false)}
                    className="btn-outline"
                    disabled={isSharing || isTogglingPublic}
                  >
                    Cancel
                  </motion.button>
                  {!memory.isPublic ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmShare}
                      className="btn-primary"
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <>
                          <Loader2 size={16} className="mr-1 animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        "Make Public & Share"
                      )}
                    </motion.button>
                  ) : (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyLink}
                        className="btn-outline"
                        disabled={isSharing}
                      >
                        <Copy size={16} className="mr-1" />
                        Copy Link
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMakePrivate}
                        className="btn-error"
                        disabled={isTogglingPublic}
                      >
                        {isTogglingPublic ? (
                          <Loader2 size={16} className="mr-1 animate-spin" />
                        ) : (
                          <Lock size={16} className="mr-1" />
                        )}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                variants={modalVariants}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Delete Memory?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this memory? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-outline"
                    disabled={isDeleting}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    className="btn-error flex items-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={16} className="mr-1 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Screen Modal */}
        <AnimatePresence>
          {isFullScreen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50 flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <button
                onClick={() => setIsFullScreen(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={() => handleZoom("in")}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={() => handleZoom("out")}
                  className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <ZoomOut size={20} />
                </button>
              </div>
              <div
                className="cursor-move"
                onMouseDown={handleMouseDown}
                style={{
                  transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                  transition: isDragging ? "none" : "transform 0.1s ease-out",
                }}
              >
                {memory.type === "image" ? (
                  <img
                    src={memory.url}
                    alt={memory.title}
                    className="max-h-[90vh] max-w-[90vw] object-contain"
                    draggable={false}
                  />
                ) : (
                  <video
                    src={memory.url}
                    controls
                    className="max-h-[90vh] max-w-[90vw]"
                    autoPlay
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Tagger Modal */}
        <AnimatePresence>
          {showAITagger && memory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
              >
                <div className="p-4 border-b flex justify-between items-center">
                  <h2 className="text-lg font-semibold">AI Image Analysis</h2>
                  <button
                    onClick={() => setShowAITagger(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <AITagger
                  media={memory}
                  onComplete={() => {
                    setShowAITagger(false);
                    fetchMemory();
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
