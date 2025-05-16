import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import {
  Calendar,
  MapPin,
  Tag,
  Heart,
  Loader2,
  Image as ImageIcon,
  Video,
  Trash2,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

export default function GalleryGrid({
  memories,
  viewMode = "grid",
  onRemoveMedia,
  isAlbumView = false,
}) {
  const navigate = useNavigate();
  const [favoritingId, setFavoritingId] = useState(null);
  const [favorites, setFavorites] = useState({});
  const [removingId, setRemovingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState(null);
  const gridRef = useRef(null);

  // Fetch favorite status for all memories
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from("media")
          .select("id, favourite")
          .in(
            "id",
            memories.map((memory) => memory.id)
          );

        if (error) throw error;

        // Create a map of id -> favorite status
        const favoritesMap = data.reduce((acc, item) => {
          acc[item.id] = item.favourite;
          return acc;
        }, {});

        setFavorites(favoritesMap);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      }
    };

    if (memories.length > 0) {
      fetchFavorites();
    }
  }, [memories]);

  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 2,
    640: 1,
  };

  const handleMemoryClick = (memoryId) => {
    navigate(`/memory/${memoryId}`);
  };

  const handleToggleFavorite = async (e, memory) => {
    e.stopPropagation(); // Prevent navigation when clicking the heart
    try {
      setFavoritingId(memory.id);
      const newFavoriteState = !favorites[memory.id];

      const { error } = await supabase
        .from("media")
        .update({ favourite: newFavoriteState })
        .eq("id", memory.id);

      if (error) throw error;

      // Update local favorites state
      setFavorites((prev) => ({
        ...prev,
        [memory.id]: newFavoriteState,
      }));
    } catch (err) {
      console.error("Error updating favorite status:", err);
    } finally {
      setFavoritingId(null);
    }
  };

  const handleRemoveMedia = async (e, memory) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onRemoveMedia) return;

    setMediaToDelete(memory);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete || !onRemoveMedia) return;

    try {
      setRemovingId(mediaToDelete.id);
      await onRemoveMedia(mediaToDelete.id);
      setShowDeleteConfirm(false);
      setMediaToDelete(null);
    } catch (err) {
      console.error("Error removing media:", err);
    } finally {
      setRemovingId(null);
    }
  };

  const renderMemoryCard = (memory) => (
    <motion.div
      key={memory.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-4", viewMode === "list" && "w-full")}
    >
      <div
        onClick={() => handleMemoryClick(memory.id)}
        className={cn(
          "block group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer",
          viewMode === "list" && "flex"
        )}
      >
        {/* Memory Image/Video */}
        <div
          className={cn(
            "bg-gray-100 relative",
            viewMode === "list" && "w-48 flex-shrink-0 h-[150px] object"
          )}
        >
          {memory.type === "image" ? (
            <img
              src={memory.thumbnailUrl}
              alt={memory.title}
              className={cn(
                "object-cover w-full h-full group-hover:scale-105 transition-transform duration-300",
                viewMode === "list" && "object-top"
              )}
            />
          ) : (
            <video
              src={memory.url}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-2 z-50">
          {/* Favorite Button */}
          <button
            onClick={(e) => handleToggleFavorite(e, memory)}
            disabled={favoritingId === memory.id}
            className={cn(
              "p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors",
              favorites[memory.id]
                ? "text-primary-600"
                : "text-gray-600 hover:text-primary-600"
            )}
          >
            {favoritingId === memory.id ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Heart
                size={18}
                className={cn(favorites[memory.id] && "fill-current")}
              />
            )}
          </button>

          {/* Remove Button - Only show if onRemoveMedia is provided */}
          {onRemoveMedia && (
            <button
              onClick={(e) => handleRemoveMedia(e, memory)}
              disabled={removingId === memory.id}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors text-gray-600 hover:text-red-600"
            >
              {removingId === memory.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trash2 size={18} />
              )}
            </button>
          )}
        </div>

        {/* Memory Info */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
            viewMode === "list" && "relative opacity-100 bg-none"
          )}
        >
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-4 text-white",
              viewMode === "list" && "relative text-gray-900"
            )}
          >
            <h3 className="text-lg font-semibold mb-1">{memory.title}</h3>

            <div className="flex items-center text-sm text-white/80 space-x-4">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                <span>{format(new Date(memory.createdAt), "MMM d, yyyy")}</span>
              </div>

              {memory.location && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{memory.location}</span>
                </div>
              )}
            </div>

            {memory.tags && memory.tags.length > 0 && (
              <div className="flex items-center mt-2 flex-wrap gap-1">
                <Tag size={14} className="mr-1" />
                {memory.tags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      viewMode === "list"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-white/20"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (viewMode === "list") {
    return (
      <>
        <div ref={gridRef} className="space-y-4">
          {memories.map(renderMemoryCard)}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Remove Media?
                  </h3>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMediaToDelete(null);
                    }}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to remove this media from the album?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setMediaToDelete(null);
                    }}
                    className="btn-outline"
                    disabled={removingId === mediaToDelete?.id}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="btn-error flex items-center"
                    disabled={removingId === mediaToDelete?.id}
                  >
                    {removingId === mediaToDelete?.id ? (
                      <>
                        <Loader2 size={16} className="mr-1 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} className="mr-1" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {memories.map(renderMemoryCard)}
      </Masonry>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Remove Media?
                </h3>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMediaToDelete(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this media from the album? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setMediaToDelete(null);
                  }}
                  className="btn-outline"
                  disabled={removingId === mediaToDelete?.id}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn-error flex items-center"
                  disabled={removingId === mediaToDelete?.id}
                >
                  {removingId === mediaToDelete?.id ? (
                    <>
                      <Loader2 size={16} className="mr-1 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
