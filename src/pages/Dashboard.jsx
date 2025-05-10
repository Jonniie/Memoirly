import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
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
import { gsap } from "gsap";

import MediaUploader from "../components/upload/MediaUploader";
import GalleryGrid from "../components/gallery/GalleryGrid";
import { cn } from "../lib/utils";
import { getUserMedia } from "../lib/supabaseHelpers";
import {
  pageEnter,
  filterEnter,
  filterExit,
  staggerChildren,
  modalEnter,
  modalExit,
} from "../lib/animations";

// Mock data for now
// const mockMemories = [
//   {
//     id: "1",
//     publicId: "sample1",
//     url: "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "Beach Day",
//     createdAt: new Date("2025-06-15").toISOString(),
//     tags: ["beach", "summer", "friends"],
//     emotion: "joyful",
//   },
//   {
//     id: "2",
//     publicId: "sample2",
//     url: "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "Mountain Hike",
//     createdAt: new Date("2025-07-05").toISOString(),
//     tags: ["hiking", "mountains", "nature"],
//     emotion: "peaceful",
//   },
//   {
//     id: "3",
//     publicId: "sample3",
//     url: "https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "BBQ with Friends",
//     createdAt: new Date("2025-07-10").toISOString(),
//     tags: ["food", "friends", "bbq"],
//     emotion: "happy",
//   },
//   {
//     id: "4",
//     publicId: "sample4",
//     url: "https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "Sunset at the Lake",
//     createdAt: new Date("2025-07-15").toISOString(),
//     tags: ["sunset", "lake", "nature"],
//     emotion: "peaceful",
//   },
//   {
//     id: "5",
//     publicId: "sample5",
//     url: "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "City Lights",
//     createdAt: new Date("2025-07-20").toISOString(),
//     tags: ["city", "night", "lights"],
//     emotion: "excited",
//   },
//   {
//     id: "6",
//     publicId: "sample6",
//     url: "https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg",
//     thumbnailUrl:
//       "https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg?auto=compress&cs=tinysrgb&w=600",
//     type: "image",
//     title: "Dog at the Park",
//     createdAt: new Date("2025-07-25").toISOString(),
//     tags: ["dog", "pet", "park"],
//     emotion: "happy",
//   },
// ];

export default function Dashboard() {
  const { user } = useUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [memories, setMemories] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  // Get unique emotions and tags from memories
  const uniqueEmotions = [...new Set(memories.map((m) => m.emotion))].filter(
    Boolean
  );
  const uniqueTags = [...new Set(memories.flatMap((m) => m.tags || []))].filter(
    Boolean
  );

  // Filter memories based on selected filters
  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      // Emotion filter
      if (filters.emotion && memory.emotion !== filters.emotion) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          memory.tags.includes(tag)
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
  }, [memories, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
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
          thumbnailUrl: media.url, // You might want to generate a thumbnail URL
          type: media.type,
          title: media.caption || media.url.split("/").pop(),
          createdAt: media.created_at,
          tags: media.tags || [],
          emotion: media.emotion || "neutral",
          isPublic: media.is_public || false, // Add isPublic field from database
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
      thumbnailUrl: media.thumbnailUrl || media.url, // Use thumbnailUrl if available, fallback to url
      type: media.type,
      title: media.caption || media.originalFilename,
      note: media.note || "",
      createdAt: media.created_at || new Date().toISOString(),
      tags: media.tags || [],
      emotion: media.emotion || "neutral",
      favourite: media.favourite || false,
      isPublic: media.is_public || false, // Add isPublic field for new uploads
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

  // Initialize animations
  useEffect(() => {
    if (pageRef.current) {
      pageEnter(pageRef.current);
    }
  }, []);

  // Animate filter panel
  useEffect(() => {
    if (filterPanelRef.current) {
      if (isFilterOpen) {
        filterEnter(filterPanelRef.current);
      } else {
        filterExit(filterPanelRef.current);
      }
    }
  }, [isFilterOpen]);

  // Animate header
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current.children,
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    }
  }, []);

  // Animate upload modal
  useEffect(() => {
    if (isUploadModalOpen && uploadModalRef.current) {
      modalEnter(uploadModalRef.current);
    }
  }, [isUploadModalOpen]);

  const handleCloseUploadModal = () => {
    if (uploadModalRef.current) {
      modalExit(uploadModalRef.current).then(() => {
        setIsUploadModalOpen(false);
      });
    } else {
      setIsUploadModalOpen(false);
    }
  };

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with welcome message */}
      <div
        ref={headerRef}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName || "Friend"}!
          </h1>
          <p className="text-gray-600">Your personal memory gallery</p>
        </div>

        {memories.length > 0 && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <Plus size={18} className="mr-1" />
              Add Memories
            </button>
          </div>
        )}
      </div>

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

            {isFilterOpen && (
              <div
                ref={filterPanelRef}
                className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10"
              >
                <div className="space-y-4">
                  {/* Media Type Filter */}
                  <div>
                    <h3 className="font-medium mb-2">Media Type</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFilterChange("mediaType", "image")}
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
                        onClick={() => handleFilterChange("mediaType", "video")}
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
                          onClick={() => handleFilterChange("emotion", emotion)}
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
                        onClick={() => handleFilterChange("privacy", "public")}
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
                        onClick={() => handleFilterChange("privacy", "private")}
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
              </div>
            )}
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
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            ref={uploadModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
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
        </div>
      )}
    </div>
  );
}
