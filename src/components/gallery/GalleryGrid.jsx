import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";
import { Calendar, MapPin, Tag } from "lucide-react";
import { format } from "date-fns";

export default function GalleryGrid({ memories }) {
  const breakpointColumns = {
    default: 4,
    1280: 3,
    1024: 2,
    640: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {memories.map((memory) => (
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <Link
            to={`/memory/${memory.id}`}
            className="block group relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Memory Image/Video */}
            <div className="aspect-w-4 aspect-h-3 bg-gray-100">
              {memory.type === "image" ? (
                <img
                  src={memory.thumbnailUrl}
                  alt={memory.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <video
                  src={memory.url}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Memory Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-semibold mb-1">{memory.title}</h3>

                <div className="flex items-center text-sm text-white/80 space-x-4">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {format(new Date(memory.createdAt), "MMM d, yyyy")}
                    </span>
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
                        className="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </Masonry>
  );
}
