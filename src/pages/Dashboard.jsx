import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import {
  Plus,
  Filter,
  GridIcon,
  LayoutList,
  Image as ImageIcon,
  X,
} from "lucide-react";

import MediaUploader from "../components/upload/MediaUploader";
import GalleryGrid from "../components/gallery/GalleryGrid";
import { cn } from "../lib/utils";

// Mock data for now
const mockMemories = [
  {
    id: "1",
    publicId: "sample1",
    url: "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "Beach Day",
    createdAt: new Date("2025-06-15").toISOString(),
    tags: ["beach", "summer", "friends"],
    emotion: "joyful",
  },
  {
    id: "2",
    publicId: "sample2",
    url: "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "Mountain Hike",
    createdAt: new Date("2025-07-05").toISOString(),
    tags: ["hiking", "mountains", "nature"],
    emotion: "peaceful",
  },
  {
    id: "3",
    publicId: "sample3",
    url: "https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/1040473/pexels-photo-1040473.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "BBQ with Friends",
    createdAt: new Date("2025-07-10").toISOString(),
    tags: ["food", "friends", "bbq"],
    emotion: "happy",
  },
  {
    id: "4",
    publicId: "sample4",
    url: "https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/315938/pexels-photo-315938.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "Sunset at the Lake",
    createdAt: new Date("2025-07-15").toISOString(),
    tags: ["sunset", "lake", "nature"],
    emotion: "peaceful",
  },
  {
    id: "5",
    publicId: "sample5",
    url: "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/1164985/pexels-photo-1164985.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "City Lights",
    createdAt: new Date("2025-07-20").toISOString(),
    tags: ["city", "night", "lights"],
    emotion: "excited",
  },
  {
    id: "6",
    publicId: "sample6",
    url: "https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg",
    thumbnailUrl:
      "https://images.pexels.com/photos/69817/pexels-photo-69817.jpeg?auto=compress&cs=tinysrgb&w=600",
    type: "image",
    title: "Dog at the Park",
    createdAt: new Date("2025-07-25").toISOString(),
    tags: ["dog", "pet", "park"],
    emotion: "happy",
  },
];

export default function Dashboard() {
  const { user } = useUser();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [memories, setMemories] = useState(mockMemories);
  const [viewMode, setViewMode] = useState("grid");

  const handleUploadComplete = (newMedia) => {
    // In a real app, we would save these to a database
    console.log("Uploaded media:", newMedia);

    // For now, just close the modal
    setIsUploadModalOpen(false);

    // Add the new media to our memories
    const newMemories = newMedia.map((media) => ({
      id: media.id,
      publicId: media.publicId,
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      type: media.type,
      title: media.originalFilename,
      createdAt: new Date().toISOString(),
      tags: [],
      emotion: "happy",
    }));

    setMemories((prev) => [...newMemories, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with welcome message */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.firstName || "Friend"}!
          </h1>
          <p className="text-gray-600">Your personal memory gallery</p>
        </div>

        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add Memories
          </button>
        </div>
      </div>

      {/* Filters and view toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          <button className="btn-outline flex items-center">
            <Filter size={16} className="mr-2" />
            <span>Filter</span>
          </button>
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
      {memories.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <GalleryGrid memories={memories} />
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
                  onClick={() => setIsUploadModalOpen(false)}
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
