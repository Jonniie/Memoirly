import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  format,
  parseISO,
  startOfMonth,
  startOfDay,
  subMonths,
  addMonths,
  isSameMonth,
} from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChevronRight,
  Loader2,
  CalendarDays,
  CalendarIcon,
  Grid,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
// @ts-expect-error - Missing type definitions for supabaseHelpers
import { getUserMedia } from "../lib/supabaseHelpers";
import TimelineView from "../components/gallery/TimelineView";

// Journal entry component
const JournalEntry = ({ date, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [entry, setEntry] = useState("");
  const [savedEntry, setSavedEntry] = useState("");

  const handleSave = () => {
    setSavedEntry(entry);
    setIsEditing(false);
    if (onSave) onSave(date, entry);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">Journal Entry</h3>
        <div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-1 text-primary-600 hover:bg-primary-50 rounded-md"
              >
                <Save size={18} />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-600 hover:bg-gray-50 rounded-md"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <Edit3 size={18} />
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your thoughts about this day..."
          className="w-full border border-gray-300 rounded-md p-3 h-32 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      ) : savedEntry ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700">{savedEntry}</p>
        </div>
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <BookOpen className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-sm text-gray-500">No journal entry yet</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Add entry
          </button>
        </div>
      )}
    </div>
  );
};

// Month navigation component
const MonthNavigation = ({ months, currentMonth, onSelectMonth }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-medium text-gray-900">Browse by Month</h3>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 max-h-64 overflow-y-auto">
          {months.map((month) => {
            const isActive = month === currentMonth;
            return (
              <div
                key={month}
                onClick={() => onSelectMonth(month)}
                className={`p-3 cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="font-medium">
                  {format(new Date(month), "MMMM yyyy")}
                </span>
                {isActive && (
                  <ChevronRight size={16} className="text-primary-600" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function TimelinePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState("date"); // "date" or "month"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableMonths, setAvailableMonths] = useState([]);
  const [journalEntries, setJournalEntries] = useState({});

  useEffect(() => {
    const fetchMemories = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch memories from Supabase
        const mediaData = await getUserMedia(user.id);

        // Transform the data to match our expected format
        const transformedMemories = mediaData.map((media) => ({
          id: media.id,
          publicId: media.public_id,
          url: media.url,
          thumbnailUrl: media.url,
          type: media.type,
          title: media.caption || media.url.split("/").pop(),
          createdAt: media.created_at,
          tags: media.tags || [],
          emotion: media.emotion || "neutral",
          isPublic: media.is_public || false,
        }));

        // Extract unique months from memories
        const months = [
          ...new Set(
            transformedMemories.map((memory) => {
              const date = parseISO(memory.createdAt);
              return format(startOfMonth(date), "yyyy-MM");
            })
          ),
        ].sort((a, b) => (new Date(b) > new Date(a) ? 1 : -1));

        setAvailableMonths(months);
        setMemories(transformedMemories);
      } catch (err) {
        console.error("Error fetching memories:", err);
        setError("Failed to load memories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemories();
  }, [user]);

  const handleMemoryClick = (memoryId) => {
    navigate(`/memory/${memoryId}`);
  };

  const handleSaveJournalEntry = (date, entry) => {
    setJournalEntries((prev) => ({
      ...prev,
      [date]: entry,
    }));
  };

  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  const handleSelectMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    setCurrentDate(new Date(parseInt(year), parseInt(month) - 1, 1));
  };

  // Filter memories based on current date when in month view
  const filteredMemories =
    groupBy === "month"
      ? memories.filter((memory) => {
          const memoryDate = parseISO(memory.createdAt);
          return isSameMonth(memoryDate, currentDate);
        })
      : memories;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar size={24} className="mr-2 text-primary-600" />
            Timeline
          </h1>
        </div>

        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-medium text-gray-700 mb-2">
            No memories yet
          </h2>
          <p className="text-gray-500 mb-6">
            Upload photos and videos to see them in your timeline
          </p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 inline-flex items-center"
          >
            Upload Memories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calendar size={24} className="mr-2 text-primary-600" />
          Timeline
        </h1>

        {/* Group by toggle */}
        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setGroupBy("date")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              groupBy === "date"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarIcon size={16} className="mr-1.5" />
            By Day
          </button>
          <button
            onClick={() => setGroupBy("month")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center ${
              groupBy === "month"
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <CalendarDays size={16} className="mr-1.5" />
            By Month
          </button>
        </div>
      </div>

      {groupBy === "month" && (
        <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight className="rotate-180" size={20} />
          </button>
          <h2 className="text-lg font-medium text-gray-900">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          {availableMonths.length > 0 && (
            <MonthNavigation
              months={availableMonths}
              currentMonth={format(currentDate, "yyyy-MM")}
              onSelectMonth={handleSelectMonth}
            />
          )}

          {groupBy === "month" && (
            <JournalEntry
              date={format(currentDate, "yyyy-MM")}
              onSave={handleSaveJournalEntry}
            />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1">
          <TimelineView
            memories={filteredMemories}
            onMemoryClick={handleMemoryClick}
            groupBy={groupBy}
          />
        </div>
      </div>
    </div>
  );
}
