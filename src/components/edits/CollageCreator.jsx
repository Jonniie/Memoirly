import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import {
  Image as ImageIcon,
  X,
  Loader2,
  Save,
  FolderOpen,
  Download,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import MediaSelector from "./MediaSelector";
import CollageTemplates from "./CollageTemplates";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useNavigate } from "react-router-dom";

const DraggableImage = ({ image, index, moveImage, removeImage }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: "IMAGE",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: "IMAGE",
    hover: (item, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      moveImage(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`relative aspect-square ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="w-full h-full rounded-lg overflow-hidden shadow-md">
        <img
          src={image.url}
          alt={`Collage image ${index + 1}`}
          className="w-full h-full object-cover object-center"
        />
        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
        >
          <X size={16} />
        </button>
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {index + 1}
        </div>
      </div>
    </div>
  );
};

export default function CollageCreator({ onComplete, onCancel, edit = null }) {
  const { user } = useUser();
  const [title, setTitle] = useState(edit?.title || "");
  const [selectedImages, setSelectedImages] = useState(edit?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [step, setStep] = useState(1);
  const collageRef = useRef(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleImageSelect = useCallback(
    async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      if (selectedImages.length + files.length > 4) {
        setError("You can only add up to 4 images to a collage");
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const newImages = await Promise.all(
          files.map(async (file) => {
            // Upload to Cloudinary first
            const uploadResult = await uploadToCloudinary({ file });

            // Save to Supabase media table
            const { data: mediaData, error: mediaError } = await supabase
              .from("media")
              .insert({
                user_id: user.id,
                url: uploadResult.secureUrl,
                public_id: uploadResult.public_id,
                type: "image",
                created_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (mediaError) {
              console.error("Error saving to media table:", mediaError);
              throw mediaError;
            }

            return {
              url: uploadResult.secureUrl,
              path: uploadResult.public_id,
              name: file.name,
              media_id: mediaData.id,
            };
          })
        );

        setSelectedImages((prev) => [...prev, ...newImages]);
      } catch (err) {
        console.error("Error uploading images:", err);
        setError("Failed to upload images. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [user, selectedImages]
  );

  const handleGallerySelect = useCallback(
    (selectedMedia) => {
      const newImages = selectedMedia
        .filter(
          (media) => !selectedImages.some((img) => img.path === media.public_id)
        )
        .map((media) => ({
          url: media.url,
          path: media.public_id,
          name: media.caption || media.url.split("/").pop(),
        }));

      setSelectedImages((prev) => {
        const combined = [...prev, ...newImages];
        return combined.slice(0, 4);
      });
    },
    [selectedImages]
  );

  const removeImage = useCallback((index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setSelectedImages((prevImages) => {
      const newImages = [...prevImages];
      const [removed] = newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, removed);
      return newImages;
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title for your collage");
      return;
    }

    if (selectedImages.length === 0) {
      setError("Please add at least one image to your collage");
      return;
    }

    if (!selectedTemplate) {
      setError("Please select a template");
      return;
    }

    setStep(2);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleCollageImg = async () => {
    if (!collageRef.current) return;

    try {
      return await toPng(collageRef.current, {
        cacheBust: true,
        useCORS: true,
        backgroundColor: "#fff",
        pixelRatio: 1,
        skipFonts: true,
        skipAutoScale: true,
        quality: 0.8,
        style: {
          transform: "none",
        },
      });
    } catch (err) {
      console.error("Error generating collage:", err);
      throw err;
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      toast.loading("Preparing download...", { id: "download" });

      const dataUrl = await handleCollageImg();
      if (!dataUrl) throw new Error("Failed to generate collage");

      const link = document.createElement("a");
      link.download = `${title || "collage"}.png`;
      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(dataUrl);

      setCloudinaryUrl(dataUrl);
      toast.success("Download started!", { id: "download" });
    } catch (err) {
      console.error("Error downloading collage:", err);
      toast.error("Failed to download collage. Please try again.", {
        id: "download",
      });
      setError("Failed to download collage. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToEdits = async () => {
    setIsSaving(true);
    try {
      toast.loading("Generating collage...", { id: "save" });
      const dataUrl = await handleCollageImg();

      if (!dataUrl) throw new Error("Could not generate collage image.");

      toast.loading("Uploading to cloud...", { id: "save" });
      const uploadResult = await uploadToCloudinary({ file: dataUrl });

      toast.loading("Saving to your edits...", { id: "save" });
      const { data: newEdit, error: insertError } = await supabase
        .from("edits")
        .insert({
          user_id: user.id,
          title: title.trim(),
          type: "collage",
          url: uploadResult.secureUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      URL.revokeObjectURL(dataUrl);

      toast.success("Collage saved to your edits!", { id: "save" });
      onComplete(newEdit);
    } catch (err) {
      console.error("Error saving collage to edits:", err);
      toast.error("Failed to save collage. Please try again.", { id: "save" });
      setError("Failed to save collage. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderCollage = () => {
    if (!selectedTemplate || selectedImages.length === 0) return null;

    // Helper for grid placement and aspect
    switch (selectedTemplate.id) {
      case "grid-2x2":
        return (
          <div
            ref={collageRef}
            className="grid grid-cols-2 grid-rows-2 gap-2 bg-white p-4 rounded-lg shadow-lg w-full h-full"
            style={{ minHeight: 320 }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative w-full h-full aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
              >
                {selectedImages[i] ? (
                  <img
                    src={selectedImages[i].url}
                    alt={`Collage image ${i + 1}`}
                    className="w-full h-full object-cover object-top"
                    crossOrigin="anonymous"
                  />
                ) : null}
              </div>
            ))}
          </div>
        );
      case "feature-1": {
        if (selectedImages.length === 3) {
          // 1 on top, 2 below
          return (
            <div
              ref={collageRef}
              className="bg-white p-4 rounded-lg shadow-lg w-full h-full"
              style={{ minHeight: 320 }}
            >
              <div className="w-full aspect-[4/2] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center mb-2">
                <img
                  src={selectedImages[0].url}
                  alt="Feature image"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
                  >
                    {selectedImages[i] && (
                      <img
                        src={selectedImages[i].url}
                        alt={`Collage image ${i + 1}`}
                        className="w-full h-full object-cover object-top"
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        } else if (selectedImages.length === 4) {
          // 1 on top, 3 below
          return (
            <div
              ref={collageRef}
              className="bg-white p-4 rounded-lg shadow-lg w-full h-full"
              style={{ minHeight: 320 }}
            >
              <div className="w-full aspect-[4/2] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center mb-2">
                <img
                  src={selectedImages[0].url}
                  alt="Feature image"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
                  >
                    {selectedImages[i] && (
                      <img
                        src={selectedImages[i].url}
                        alt={`Collage image ${i + 1}`}
                        className="w-full h-full object-cover object-top"
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        } else {
          // fallback to previous logic for 1 or 2 images
          return (
            <div
              ref={collageRef}
              className="bg-white p-4 rounded-lg shadow-lg w-full h-full"
              style={{ minHeight: 320 }}
            >
              <div className="w-full aspect-[4/2] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center mb-2">
                {selectedImages[0] && (
                  <img
                    src={selectedImages[0].url}
                    alt="Feature image"
                    className="w-full h-full object-cover object-top"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
              <div
                className={`grid gap-2 ${
                  selectedImages.length === 2 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {[1, 2].map((i) =>
                  selectedImages[i] ? (
                    <div
                      key={i}
                      className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
                    >
                      <img
                        src={selectedImages[i].url}
                        alt={`Collage image ${i + 1}`}
                        className="w-full h-full object-cover object-top"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : null
                )}
              </div>
            </div>
          );
        }
      }
      case "masonry-3":
        return (
          <div
            ref={collageRef}
            className="grid grid-cols-3 gap-2 bg-white p-4 rounded-lg shadow-lg w-full h-full"
            style={{ minHeight: 320 }}
          >
            <div className="row-span-2 aspect-[2/3] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[0] && (
                <img
                  src={selectedImages[0].url}
                  alt="Masonry image 1"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[1] && (
                <img
                  src={selectedImages[1].url}
                  alt="Masonry image 2"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[2] && (
                <img
                  src={selectedImages[2].url}
                  alt="Masonry image 3"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[3] && (
                <img
                  src={selectedImages[3].url}
                  alt="Masonry image 4"
                  className="w-full h-full object-cover object-top"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>
        );
      case "center-focus":
        return (
          <div
            ref={collageRef}
            className="grid grid-cols-3 grid-rows-2 gap-2 bg-white p-4 rounded-lg shadow-lg w-full h-full"
            style={{ minHeight: 320 }}
          >
            <div className="col-start-2 row-start-1 row-span-2 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[0] && (
                <img
                  src={selectedImages[0].url}
                  alt="Center image"
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="col-start-1 row-start-1 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[1] && (
                <img
                  src={selectedImages[1].url}
                  alt="Side image 1"
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="col-start-3 row-start-1 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[2] && (
                <img
                  src={selectedImages[2].url}
                  alt="Side image 2"
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="col-start-1 row-start-2 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {selectedImages[3] && (
                <img
                  src={selectedImages[3].url}
                  alt="Side image 3"
                  className="w-full h-full object-cover object-center"
                  crossOrigin="anonymous"
                />
              )}
            </div>
            <div className="col-start-3 row-start-2 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {/* If there are 4 images, fill this spot, else leave empty */}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-500"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 1 ? "Create Photo Collage" : "Preview & Download"}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <X size={24} />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Collage Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter a title for your collage"
              />
            </div>

            <CollageTemplates
              selectedTemplate={selectedTemplate}
              onSelect={handleTemplateSelect}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (up to 4)
              </label>
              <DndProvider backend={HTML5Backend}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {selectedImages.map((image, index) => (
                    <DraggableImage
                      key={`${image.url}-${index}`}
                      image={image}
                      index={index}
                      moveImage={moveImage}
                      removeImage={removeImage}
                    />
                  ))}
                  {selectedImages.length < 4 && (
                    <div className="grid grid-cols-2 gap-4">
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          multiple
                        />
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Upload Images
                          </span>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMediaSelector(true)}
                        className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-gray-50"
                      >
                        <div className="text-center">
                          <FolderOpen className="mx-auto h-8 w-8 text-gray-400" />
                          <span className="mt-2 block text-sm text-gray-600">
                            Choose from Gallery
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </DndProvider>
            </div>

            {error && <div className="text-error-600 text-sm">{error}</div>}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedTemplate}
                className="btn-primary flex items-center"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Continue to Preview
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                Preview
              </h3>
              {renderCollage()}
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-primary flex items-center"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Collage
                  </>
                )}
              </button>
              <button
                onClick={handleSaveToEdits}
                className="btn-primary flex items-center"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save to My Edits</>
                )}
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showMediaSelector && (
            <MediaSelector
              onSelect={handleGallerySelect}
              onClose={() => setShowMediaSelector(false)}
              maxSelection={4 - selectedImages.length}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
