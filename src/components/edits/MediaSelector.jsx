import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImageIcon, Video } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-react";

export default function MediaSelector({
  onSelect,
  onClose,
  maxSelection = 1,
  type = "image",
}) {
  const { user } = useUser();
  const [media, setMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [type]);

  const fetchMedia = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("media")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setMedia(data || []);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Failed to load media. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (selectedMedia.find((m) => m.id === item.id)) {
      setSelectedMedia((prev) => prev.filter((m) => m.id !== item.id));
    } else {
      if (selectedMedia.length >= maxSelection) {
        setError(`You can only select up to ${maxSelection} items`);
        return;
      }
      setSelectedMedia((prev) => [...prev, item]);
    }
  };

  const handleConfirm = () => {
    onSelect(selectedMedia);
    onClose();
  };

  return (
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
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Select {type === "video" ? "Videos" : "Images"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-error-600 text-center py-8">{error}</div>
          ) : media.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No {type === "video" ? "videos" : "images"} found in your gallery
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative aspect-square rounded-lg overflow-hidden group ${
                    selectedMedia.find((m) => m.id === item.id)
                      ? "ring-2 ring-primary-500"
                      : ""
                  }`}
                >
                  {type === "video" ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.caption || ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {selectedMedia.find((m) => m.id === item.id) ? (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white rounded-sm" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedMedia.length} of {maxSelection} selected
            </div>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedMedia.length === 0}
                className="btn-primary"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
