import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
  Plus,
  Filter,
  GridIcon,
  LayoutList,
  Image as ImageIcon,
  X,
  Loader2,
  ChevronDown,
  Video,
} from "lucide-react";

import MediaUploader from "../components/upload/MediaUploader";
import GalleryGrid from "../components/gallery/GalleryGrid";
import SearchBar from "../components/search/SearchBar";
import { cn } from "../lib/utils";
import { getUserMedia } from "../lib/supabaseHelpers";
import {
  pageVariants,
  filterVariants,
  staggerContainer,
  staggerItem,
  modalVariants,
  overlayVariants,
} from "../lib/animations";
import ReelCreator from "../components/edits/ReelCreator";

export default function Dashboard() {
  const { user } = useUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [memories, setMemories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    emotion: "",
    tags: [],
    dateRange: { start: null, end: null },
    mediaType: "all",
    privacy: "all",
  });
  const filterRef = useRef(null);
  const pageRef = useRef(null);
  const filterPanelRef = useRef(null);
  const headerRef = useRef(null);
  const uploadModalRef = useRef(null);
  const [showReelCreator, setShowReelCreator] = useState(false);

  // Get unique emotions and tags from memories
  const uniqueEmotions = [...new Set(memories.map((m) => m.emotion))].filter(
    Boolean
  );
  const uniqueTags = [...new Set(memories.flatMap((m) => m.tags || []))].filter(
    Boolean
  );

  // Filter memories based on selected filters and search query
  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      // Search query filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch =
          memory.title?.toLowerCase().includes(searchLower) ||
          memory.note?.toLowerCase().includes(searchLower) ||
          memory.tags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          memory.emotion?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Emotion filter
      if (filters.emotion && memory.emotion !== filters.emotion) {
        return false;
      }

      // Tags filter
      if (Array.isArray(filters.tags) && filters.tags.length > 0) {
        const memoryTags = Array.isArray(memory.tags) ? memory.tags : [];
        const hasMatchingTag = filters.tags.some((tag) =>
          memoryTags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const memoryDate = new Date(memory.createdAt);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end day

        if (memoryDate < startDate || memoryDate > endDate) {
          return false;
        }
      }

      // Media type filter
      if (filters.mediaType !== "all" && memory.type !== filters.mediaType) {
        return false;
      }

      // Privacy filter
      if (filters.privacy !== "all") {
        const isPublic = memory.isPublic || false;
        if (filters.privacy === "public" && !isPublic) return false;
        if (filters.privacy === "private" && isPublic) return false;
      }

      return true;
    });
  }, [memories, filters, searchQuery]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      if (filterType === "tags") {
        // For tags, toggle the selected tag
        const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
        const newTags = currentTags.includes(value)
          ? currentTags.filter((tag) => tag !== value)
          : [...currentTags, value];

        return {
          ...prev,
          tags: newTags,
        };
      } else if (filterType === "dateRange") {
        // For date range, merge with existing range
        return {
          ...prev,
          dateRange: {
            ...prev.dateRange,
            ...value,
          },
        };
      } else {
        // For all other filters, just set the value
        return {
          ...prev,
          [filterType]: value,
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      emotion: "",
      tags: [],
      dateRange: {
        start: null,
        end: null,
      },
      mediaType: "all",
      privacy: "all",
    });
  };

  // Remove GSAP animation effects
  useEffect(() => {
    const fetchMemories = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
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

  const handleUploadComplete = (newMedia) => {
    // Add the new media to our memories
    const newMemories = newMedia.map((media) => ({
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl || media.url,
      type: media.type,
      title: media.caption || media.originalFilename,
      note: media.note || "",
      createdAt: media.created_at || new Date().toISOString(),
      tags: media.tags || [],
      emotion: media.emotion || "neutral",
      favourite: media.favourite || false,
      isPublic: media.is_public || false,
    }));

    setMemories((prev) => [...newMemories, ...prev]);
    setIsUploadModalOpen(false);
  };

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleReelComplete = (reel) => {
    setShowReelCreator(false);
    // Optionally refresh the media list or show a success message
  };

  return (
    <motion.div
      ref={pageRef}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header with welcome message */}
      <motion.div
        ref={headerRef}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
      >
        <motion.div variants={staggerItem}>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName || "Friend"}!
          </h1>
          <p className="text-gray-600">Your personal memory gallery</p>
        </motion.div>

        {memories.length > 0 && (
          <motion.div variants={staggerItem} className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add Memories
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Search Bar */}
      {memories.length > 0 && (
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {/* Filters and view toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn-outline flex items-center"
            >
              <Filter size={16} className="mr-2" />
              <span>Filter</span>
              <ChevronDown
                size={16}
                className={cn(
                  "ml-2 transition-transform duration-200",
                  isFilterOpen ? "rotate-180" : ""
                )}
              />
            </button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  ref={filterPanelRef}
                  variants={filterVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
                >
                  <div className="space-y-4">
                    {/* Media Type Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Media Type</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleFilterChange("mediaType", "image")
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm flex items-center",
                            filters.mediaType === "image"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <ImageIcon size={16} className="mr-1.5" />
                          Images
                        </button>
                        <button
                          onClick={() =>
                            handleFilterChange("mediaType", "video")
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-md text-sm flex items-center",
                            filters.mediaType === "video"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          <Video size={16} className="mr-1.5" />
                          Videos
                        </button>
                      </div>
                    </div>

                    {/* Emotions Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Emotions</h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueEmotions.map((emotion) => (
                          <button
                            key={emotion}
                            onClick={() =>
                              handleFilterChange("emotion", emotion)
                            }
                            className={cn(
                              "px-2 py-1 rounded-full text-sm",
                              filters.emotion === emotion
                                ? "bg-primary-100 text-primary-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {emotion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleFilterChange("tags", tag)}
                            className={cn(
                              "px-2 py-1 rounded-full text-sm",
                              filters.tags.includes(tag)
                                ? "bg-primary-100 text-primary-700"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Date Range</h3>
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={filters.dateRange.start || ""}
                          onChange={(e) =>
                            handleFilterChange("dateRange", {
                              start: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                        <input
                          type="date"
                          value={filters.dateRange.end || ""}
                          onChange={(e) =>
                            handleFilterChange("dateRange", {
                              end: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded"
                        />
                      </div>
                    </div>

                    {/* Privacy Filter */}
                    <div>
                      <h3 className="font-medium mb-2">Privacy</h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleFilterChange("privacy", "all")}
                          className={cn(
                            "px-2 py-1 rounded-full text-sm",
                            filters.privacy === "all"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          All
                        </button>
                        <button
                          onClick={() =>
                            handleFilterChange("privacy", "public")
                          }
                          className={cn(
                            "px-2 py-1 rounded-full text-sm",
                            filters.privacy === "public"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          Public
                        </button>
                        <button
                          onClick={() =>
                            handleFilterChange("privacy", "private")
                          }
                          className={cn(
                            "px-2 py-1 rounded-full text-sm",
                            filters.privacy === "private"
                              ? "bg-primary-100 text-primary-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          Private
                        </button>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(filters.emotion ||
                      filters.tags.length > 0 ||
                      filters.dateRange.start ||
                      filters.dateRange.end ||
                      filters.mediaType !== "all" ||
                      filters.privacy !== "all") && (
                      <button
                        onClick={clearFilters}
                        className="w-full btn-outline text-sm"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Filters Count */}
          {(filters.emotion ||
            filters.tags.length > 0 ||
            filters.dateRange.start ||
            filters.dateRange.end ||
            filters.mediaType !== "all" ||
            filters.privacy !== "all") && (
            <span className="text-sm text-gray-600">
              {[
                filters.emotion ? 1 : 0,
                filters.tags.length,
                filters.dateRange.start ? 1 : 0,
                filters.dateRange.end ? 1 : 0,
                filters.mediaType !== "all" ? 1 : 0,
                filters.privacy !== "all" ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}{" "}
              active filters
            </span>
          )}
        </div>

        <div className="flex items-center bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center p-1.5 rounded transition-colors",
              viewMode === "grid"
                ? "bg-white shadow-sm text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <GridIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center p-1.5 rounded transition-colors",
              viewMode === "list"
                ? "bg-white shadow-sm text-primary-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LayoutList size={18} />
          </button>
        </div>
      </div>

      {/* Gallery Section */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading your memories...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : filteredMemories.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GalleryGrid memories={filteredMemories} viewMode={viewMode} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-lg border border-gray-200"
        >
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No memories yet
          </h3>
          <p className="text-gray-500 mb-6">
            Upload your first memory to get started
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add Memories
          </button>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={overlayVariants}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              ref={uploadModalRef}
              variants={modalVariants}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upload Memories
                  </h2>
                  <button
                    onClick={handleCloseUploadModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                <MediaUploader onUploadComplete={handleUploadComplete} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReelCreator && (
          <ReelCreator
            onComplete={handleReelComplete}
            onCancel={() => setShowReelCreator(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
