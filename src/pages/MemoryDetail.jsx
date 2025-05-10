import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";
import { cn } from "../lib/utils";

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

  useEffect(() => {
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

    fetchMemory();
  }, [id]);

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

      const { error } = await supabase
        .from("media")
        .update({
          caption: editedMemory.title,
          note: editedMemory.note,
          emotion: editedMemory.emotion,
          location: editedMemory.location,
          tags: editedMemory.tags,
        })
        .eq("id", id);

      if (error) throw error;

      // Update the local state with the edited memory
      setMemory(editedMemory);
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
    // Just store the raw input value
    setEditedMemory((prev) => ({
      ...prev,
      tagsInput: e.target.value,
      tags: prev.tags, // Keep existing processed tags
    }));
  };

  const processTags = () => {
    const tagsString = editedMemory.tagsInput;
    const tagsArray = tagsString
      .split(/[,\s]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    setEditedMemory((prev) => ({
      ...prev,
      tags: tagsArray,
    }));
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

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setError(null);

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
          url: window.location.href,
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
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
    }
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Go back button */}
      <button
        onClick={handleGoBack}
        className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors"
      >
        <ArrowLeft size={20} className="mr-1" />
        <span>Back to Gallery</span>
      </button>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="lg:flex">
          {/* Media Section */}
          <div className="lg:w-7/12 bg-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {memory.type === "image" ? (
                <img
                  src={memory.url}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: "80vh" }}
                />
              ) : (
                <video
                  src={memory.url}
                  controls
                  className="w-full h-full object-cover"
                  style={{ maxHeight: "80vh" }}
                />
              )}
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="lg:w-5/12 p-6">
            {isEditMode ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
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
                      editedMemory.tagsInput || editedMemory.tags.join(", ")
                    }
                    onChange={handleTagsChange}
                    onBlur={processTags}
                    className="input"
                    disabled={isSaving}
                    placeholder="Add tags (separated by commas or spaces)"
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {memory.title}
                  </h1>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="text-gray-500 hover:text-primary-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button className="text-gray-500 hover:text-error-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <Trash2 size={18} />
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

                <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
