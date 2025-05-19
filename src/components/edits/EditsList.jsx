import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Trash2, Image as ImageIcon, Video } from "lucide-react";
import { supabase } from "../../lib/supabase";
import CollageCreator from "./CollageCreator";
import ReelCreator from "./ReelCreator";

export default function EditsList({ edits, onEditDeleted }) {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const renderCollage = (edit) => {
    const images = edit.images.slice(0, 4);
    const template = edit.template || "grid-2x2";

    switch (template) {
      case "grid-2x2":
        return (
          <div
            id={`collage-${edit.id}`}
            className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 bg-white p-4 rounded-lg"
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="relative w-full h-full aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
              >
                {images[i] && (
                  <img
                    src={images[i]}
                    alt={`Collage image ${i + 1}`}
                    className="w-full h-full object-cover object-center"
                  />
                )}
              </div>
            ))}
          </div>
        );
      case "feature-1":
        return (
          <div
            id={`collage-${edit.id}`}
            className="w-full h-full bg-white p-4 rounded-lg"
          >
            <div className="w-full aspect-[4/2] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center mb-2">
              {images[0] && (
                <img
                  src={images[0]}
                  alt="Feature image"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center"
                >
                  {images[i] && (
                    <img
                      src={images[i]}
                      alt={`Collage image ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "masonry-3":
        return (
          <div
            id={`collage-${edit.id}`}
            className="w-full h-full grid grid-cols-3 gap-2 bg-white p-4 rounded-lg"
          >
            <div className="row-span-2 aspect-[2/3] bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[0] && (
                <img
                  src={images[0]}
                  alt="Masonry image 1"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[1] && (
                <img
                  src={images[1]}
                  alt="Masonry image 2"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[2] && (
                <img
                  src={images[2]}
                  alt="Masonry image 3"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[3] && (
                <img
                  src={images[3]}
                  alt="Masonry image 4"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
        );
      case "center-focus":
        return (
          <div
            id={`collage-${edit.id}`}
            className="w-full h-full grid grid-cols-3 grid-rows-2 gap-2 bg-white p-4 rounded-lg"
          >
            <div className="col-start-2 row-start-1 row-span-2 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[0] && (
                <img
                  src={images[0]}
                  alt="Center image"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="col-start-1 row-start-1 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[1] && (
                <img
                  src={images[1]}
                  alt="Side image 1"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="col-start-3 row-start-1 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[2] && (
                <img
                  src={images[2]}
                  alt="Side image 2"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
            <div className="col-start-1 row-start-2 aspect-square bg-gray-100 overflow-hidden rounded-lg flex items-center justify-center">
              {images[3] && (
                <img
                  src={images[3]}
                  alt="Side image 3"
                  className="w-full h-full object-cover object-center"
                />
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {edits.map((edit) => (
          <motion.div
            key={edit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div
              className={
                edit.type === "collage"
                  ? "bg-gray-100 relative"
                  : "aspect-video bg-gray-100 relative"
              }
            >
              {edit.type === "collage" ? (
                renderCollage(edit)
              ) : (
                <video
                  src={edit.videos[0]}
                  className="w-full h-full object-cover"
                  muted
                />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button
                  onClick={() => handleDownload(edit)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Download className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => handleEdit(edit)}
                  className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {edit.type === "collage" ? (
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                ) : (
                  <Video className="w-4 h-4 text-gray-500" />
                )}
                <h3 className="font-medium text-gray-900">{edit.title}</h3>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(edit.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {isCreatorOpen && selectedEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {selectedEdit.type === "collage" ? (
            <CollageCreator
              edit={selectedEdit}
              onComplete={handleCreatorComplete}
              onCancel={() => setIsCreatorOpen(false)}
            />
          ) : (
            <ReelCreator
              edit={selectedEdit}
              onComplete={handleCreatorComplete}
              onCancel={() => setIsCreatorOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
