import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Film,
  Plus,
  Trash2,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Edit3,
  Save,
  Play,
  Download,
  Loader2,
  Music,
  Type,
  Settings,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { getUserMedia } from "../lib/supabaseHelpers";
import { supabase } from "../lib/supabase";

export default function MemoryReelPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editType = searchParams.get("type") || "reel";
  const { user } = useUser();
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Select, 2: Edit, 3: Preview
  const [editTitle, setEditTitle] = useState(
    editType === "reel" ? "My Memory Reel" : "My Photo Collage"
  );
  const [journalNotes, setJournalNotes] = useState({});
  const [editSettings, setEditSettings] = useState({
    duration: 3, // seconds per image
    transitionType: "fade",
    music: null,
    theme: "minimal",
    layout: editType === "collage" ? "grid" : null,
    gridSize: editType === "collage" ? "2x2" : null,
  });

  useEffect(() => {
    fetchUserMedia();
  }, [user]);

  const fetchUserMedia = async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      const mediaData = await getUserMedia(user.id);

      // Transform the data to match our expected format
      const transformedMedia = mediaData.map((media) => ({
        id: media.id,
        publicId: media.public_id,
        url: media.url,
        thumbnailUrl: media.url,
        type: media.type,
        title: media.caption || media.url.split("/").pop(),
        createdAt: media.created_at,
        tags: media.tags || [],
        emotion: media.emotion || "neutral",
        note: media.note || "",
      }));

      setAvailableMedia(transformedMedia);
    } catch (err) {
      console.error("Error fetching media:", err);
      setError("Failed to load your media. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (media) => {
    setSelectedMedia((prev) => {
      // If already selected, remove it
      if (prev.some((m) => m.id === media.id)) {
        return prev.filter((m) => m.id !== media.id);
      }
      // Otherwise add it
      return [...prev, media];
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(selectedMedia);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedMedia(items);
  };

  const handleJournalNoteChange = (mediaId, note) => {
    setJournalNotes((prev) => ({
      ...prev,
      [mediaId]: note,
    }));
  };

  const handleRemoveMedia = (mediaId) => {
    setSelectedMedia((prev) => prev.filter((m) => m.id !== mediaId));
    // Also remove any journal notes for this media
    setJournalNotes((prev) => {
      const newNotes = { ...prev };
      delete newNotes[mediaId];
      return newNotes;
    });
  };

  const handleCreateEdit = async () => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase
        .from("edits")
        .insert([
          {
            user_id: user.id,
            title: editTitle,
            type: editType,
            media_items: selectedMedia.map((media) => ({
              id: media.id,
              url: media.url,
              type: media.type,
              note: journalNotes[media.id] || "",
            })),
            settings: editSettings,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Success message
      alert(
        `${editType === "reel" ? "Reel" : "Collage"} created successfully!`
      );
      navigate("/edits");
    } catch (error) {
      console.error("Error creating edit:", error);
      setError(`Failed to create ${editType}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Select Media</h2>
        <button
          onClick={() => setIsSelectModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Add Media
        </button>
      </div>

      {selectedMedia.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          {editType === "reel" ? (
            <Film size={48} className="mx-auto text-gray-400 mb-4" />
          ) : (
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No media selected
          </h3>
          <p className="text-gray-500 mb-6">
            Add photos and videos to create your{" "}
            {editType === "reel" ? "memory reel" : "photo collage"}
          </p>
          <button
            onClick={() => setIsSelectModalOpen(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add Media
          </button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="edit-media" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-wrap gap-4"
              >
                {selectedMedia.map((media, index) => (
                  <Draggable
                    key={media.id}
                    draggableId={media.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm"
                      >
                        {media.type === "image" ? (
                          <img
                            src={media.url}
                            alt={media.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Video size={32} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleRemoveMedia(media.id)}
                            className="p-1 rounded-full bg-white/80 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                          {index + 1}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="flex justify-between pt-4">
        <button
          onClick={() => navigate(-1)}
          className="btn-outline flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Cancel
        </button>
        <button
          onClick={() => setCurrentStep(2)}
          className="btn-primary flex items-center"
          disabled={selectedMedia.length === 0}
        >
          Next
          <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );

  const renderEditStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Add Journal Notes
        </h2>
        <div>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input mr-2"
            placeholder={editType === "reel" ? "Reel Title" : "Collage Title"}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedMedia.map((media, index) => (
          <div
            key={media.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">{`${index + 1}. ${media.title}`}</h3>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 aspect-square">
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt={media.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Video size={32} className="text-gray-400" />
                  </div>
                )}
              </div>
              <div className="p-4 flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journal Note
                </label>
                <textarea
                  value={journalNotes[media.id] || media.note || ""}
                  onChange={(e) =>
                    handleJournalNoteChange(media.id, e.target.value)
                  }
                  className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Add a note to display with this media..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="btn-outline flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="btn-primary flex items-center"
        >
          Next
          <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {editType === "reel" ? "Reel Settings" : "Collage Settings"}
        </h2>
        <div>
          <h3 className="text-lg font-medium">{editTitle}</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Preview</h3>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              {editType === "reel" ? (
                <Play size={48} className="text-white opacity-50" />
              ) : (
                <ImageIcon size={48} className="text-white opacity-50" />
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Settings</h3>
            <div className="space-y-4">
              {editType === "reel" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration per slide (seconds)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editSettings.duration}
                      onChange={(e) =>
                        setEditSettings((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value),
                        }))
                      }
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transition Type
                    </label>
                    <select
                      value={editSettings.transitionType}
                      onChange={(e) =>
                        setEditSettings((prev) => ({
                          ...prev,
                          transitionType: e.target.value,
                        }))
                      }
                      className="input w-full"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="zoom">Zoom</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout
                    </label>
                    <select
                      value={editSettings.layout}
                      onChange={(e) =>
                        setEditSettings((prev) => ({
                          ...prev,
                          layout: e.target.value,
                        }))
                      }
                      className="input w-full"
                    >
                      <option value="grid">Grid</option>
                      <option value="masonry">Masonry</option>
                      <option value="carousel">Carousel</option>
                    </select>
                  </div>

                  {editSettings.layout === "grid" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grid Size
                      </label>
                      <select
                        value={editSettings.gridSize}
                        onChange={(e) =>
                          setEditSettings((prev) => ({
                            ...prev,
                            gridSize: e.target.value,
                          }))
                        }
                        className="input w-full"
                      >
                        <option value="2x2">2x2</option>
                        <option value="3x3">3x3</option>
                        <option value="4x4">4x4</option>
                      </select>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={editSettings.theme}
                  onChange={(e) =>
                    setEditSettings((prev) => ({
                      ...prev,
                      theme: e.target.value,
                    }))
                  }
                  className="input w-full"
                >
                  <option value="minimal">Minimal</option>
                  <option value="vintage">Vintage</option>
                  <option value="modern">Modern</option>
                  <option value="bold">Bold</option>
                </select>
              </div>

              {editType === "reel" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Music (Coming Soon)
                  </label>
                  <button
                    className="btn-outline w-full flex items-center justify-center opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <Music size={16} className="mr-1" />
                    Add Music
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="btn-outline flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back
        </button>
        <button
          onClick={handleCreateEdit}
          className="btn-primary flex items-center"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {editType === "reel" ? (
                <Film size={16} className="mr-1" />
              ) : (
                <ImageIcon size={16} className="mr-1" />
              )}
              Create {editType === "reel" ? "Reel" : "Collage"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          {editType === "reel" ? (
            <Film size={24} className="mr-2 text-primary-600" />
          ) : (
            <ImageIcon size={24} className="mr-2 text-primary-600" />
          )}
          Create {editType === "reel" ? "Memory Reel" : "Photo Collage"}
        </h1>

        <div className="flex items-center">
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                currentStep === 1
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              1. Select
            </button>
            <button
              onClick={() => selectedMedia.length > 0 && setCurrentStep(2)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                currentStep === 2
                  ? "bg-white text-primary-600 shadow-sm"
                  : selectedMedia.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600"
              }`}
              disabled={selectedMedia.length === 0}
            >
              2. Edit
            </button>
            <button
              onClick={() => selectedMedia.length > 0 && setCurrentStep(3)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                currentStep === 3
                  ? "bg-white text-primary-600 shadow-sm"
                  : selectedMedia.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600"
              }`}
              disabled={selectedMedia.length === 0}
            >
              3. Create
            </button>
          </div>
        </div>
      </div>

      {currentStep === 1 && renderSelectStep()}
      {currentStep === 2 && renderEditStep()}
      {currentStep === 3 && renderPreviewStep()}

      {/* Media Selection Modal */}
      <AnimatePresence>
        {isSelectModalOpen && (
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
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Select Media for {editType === "reel" ? "Reel" : "Collage"}
                  </h2>
                  <button
                    onClick={() => setIsSelectModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableMedia.map((media) => (
                    <div
                      key={media.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer ${
                        selectedMedia.some((m) => m.id === media.id)
                          ? "ring-2 ring-primary-600"
                          : ""
                      }`}
                      onClick={() => handleMediaSelect(media)}
                    >
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={media.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Video size={32} className="text-gray-400" />
                        </div>
                      )}
                      {selectedMedia.some((m) => m.id === media.id) && (
                        <div className="absolute inset-0 bg-primary-600/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1">
                            <Check size={20} className="text-primary-600" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {selectedMedia.length} items selected
                  </span>
                  <div className="space-x-3">
                    <button
                      onClick={() => setIsSelectModalOpen(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setIsSelectModalOpen(false)}
                      className="btn-primary"
                      disabled={selectedMedia.length === 0}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
