import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";
import { Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";

type Memory = {
  id: string;
  publicId: string;
  url: string;
  thumbnailUrl: string;
  type: "image" | "video";
  title?: string;
  createdAt: string;
  tags?: string[];
  emotion?: string;
  location?: string;
};

interface GalleryGridProps {
  memories: Memory[];
}

export default function GalleryGrid({ memories }: GalleryGridProps) {
  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  // Animation variants for staggered children
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {memories.map((memory) => (
          <motion.div
            key={memory.id}
            className="masonry-grid_item"
            variants={item}
          >
            <Link to={`/memory/${memory.id}`}>
              <div className="card card-hover group relative overflow-hidden rounded-lg">
                <div className="aspect-w-3 aspect-h-4 bg-gray-200 relative overflow-hidden">
                  {memory.type === "image" ? (
                    <img
                      src={memory.thumbnailUrl}
                      alt={memory.title || "Memory"}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={memory.url}
                      className="object-cover w-full h-full"
                      muted
                      playsInline
                    />
                  )}

                  {/* Overlay with details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {memory.title && (
                      <h3 className="text-white font-medium text-lg mb-2">
                        {memory.title}
                      </h3>
                    )}

                    <div className="flex items-center text-white/80 text-sm mb-2">
                      <Calendar size={14} className="mr-1" />
                      <span>
                        {format(new Date(memory.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>

                    {memory.location && (
                      <div className="flex items-center text-white/80 text-sm mb-2">
                        <MapPin size={14} className="mr-1" />
                        <span>{memory.location}</span>
                      </div>
                    )}

                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex items-center text-white/80 text-sm">
                        <Tag size={14} className="mr-1" />
                        <span>
                          {memory.tags.slice(0, 2).join(", ")}
                          {memory.tags.length > 2 && "..."}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Emotion badge */}
                  {memory.emotion && (
                    <div className="absolute top-3 right-3">
                      <span className="badge-accent">{memory.emotion}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </Masonry>
    </motion.div>
  );
}
