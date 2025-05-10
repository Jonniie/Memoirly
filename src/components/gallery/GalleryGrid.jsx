import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Masonry from "react-masonry-css";
import { Calendar, MapPin, Tag, Heart, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { supabase } from "../../lib/supabase";

export default function GalleryGrid({ memories, viewMode = "grid" }) {
  const navigate = useNavigate();
  const [favoritingId, setFavoritingId] = useState(null);
  const [favorites, setFavorites] = useState({});

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
            " bg-gray-100",
            viewMode === "list" && "w-48 flex-shrink-0 h-[150px] object"
          )}
        >
          {memory.type === "image" ? (
            <img
              src={memory.thumbnailUrl}
              alt={memory.title}
              className={
                "object-cover  w-full h-full group-hover:scale-105 transition-transform duration-300" +
                (viewMode === "list" && " object-top")
              }
            />
          ) : (
            <video
              src={memory.url}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => handleToggleFavorite(e, memory)}
          disabled={favoritingId === memory.id}
          className={cn(
            "absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm transition-colors",
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
    return <div className="space-y-4">{memories.map(renderMemoryCard)}</div>;
  }

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {memories.map(renderMemoryCard)}
    </Masonry>
  );
}
