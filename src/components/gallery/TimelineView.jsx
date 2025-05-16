import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { ImageIcon, Video, Calendar } from "lucide-react";

const TimelineGroup = ({ date, memories, onMemoryClick, isMonthView }) => {
  // Format the date differently based on whether we're in month view or day view
  const formattedDate = isMonthView
    ? format(new Date(date), "MMMM yyyy")
    : format(new Date(date), "MMMM d, yyyy");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pl-8 pb-12 mb-8"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />

      {/* Date dot */}
      <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-primary-500 -translate-x-1/2 flex items-center justify-center">
        <Calendar className="w-3 h-3 text-white" />
      </div>

      {/* Date label */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900">{formattedDate}</h3>
        <p className="text-sm text-gray-500 mt-1">{memories.length} memories</p>
      </div>

      {/* Thumbnails grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {memories.map((memory) => (
            <motion.div
              key={memory.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMemoryClick(memory.id)}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer group shadow-sm border border-gray-100"
            >
              {memory.type === "image" ? (
                <div className="relative w-full h-full">
                  <img
                    src={memory.url}
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {memory.title}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                  <Video className="w-8 h-8 text-gray-400" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs font-medium truncate">
                      {memory.title}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function TimelineView({
  memories,
  onMemoryClick,
  groupBy = "date",
}) {
  // Group memories by date or month based on the groupBy prop
  const groupedMemories = memories.reduce((groups, memory) => {
    const date = new Date(memory.createdAt);

    // Use different grouping keys based on groupBy prop
    let groupKey;
    if (groupBy === "month") {
      // Group by month (format: "2023-01")
      groupKey = format(date, "yyyy-MM");
    } else {
      // Group by exact date
      groupKey = date.toDateString();
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(memory);
    return groups;
  }, {});

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedMemories).sort((a, b) => {
    if (groupBy === "month") {
      // For month grouping, parse the yyyy-MM format
      const [yearB, monthB] = b.split("-");
      const [yearA, monthA] = a.split("-");
      return new Date(yearB, monthB - 1) - new Date(yearA, monthA - 1);
    } else {
      // For date grouping, compare date strings
      return new Date(b) - new Date(a);
    }
  });

  if (sortedDates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No memories found for the selected time period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        {sortedDates.map((date) => (
          <TimelineGroup
            key={date}
            date={date}
            memories={groupedMemories[date]}
            onMemoryClick={onMemoryClick}
            isMonthView={groupBy === "month"}
          />
        ))}
      </motion.div>
    </div>
  );
}
