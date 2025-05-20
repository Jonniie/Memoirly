import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import CollageCreator from "../components/edits/CollageCreator";
import ReelCreator from "../components/edits/ReelCreator";

export default function EditsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [edits, setEdits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingCollage, setIsCreatingCollage] = useState(false);
  const [isCreatingReel, setIsCreatingReel] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "collage") {
      setIsCreatingCollage(true);
    }
    if (type === "reel") {
      setIsCreatingReel(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchEdits();
  }, [user]);

  const fetchEdits = async () => {
    try {
      setIsLoading(true);
      if (!user) return;

      const { data, error } = await supabase
        .from("edits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEdits(data);
    } catch (err) {
      console.error("Error fetching edits:", err);
      setError("Failed to load your edits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEdit = (type) => {
    navigate(`/edits?type=${type}`);
  };

  const handleCollageComplete = async (newCollage) => {
    setEdits((prev) => [newCollage, ...prev]);
    setIsCreatingCollage(false);
    navigate("/edits");
  };

  const handleCollageCancel = () => {
    setIsCreatingCollage(false);
    navigate("/edits");
  };

  const handleCollageReel = () => {
    setIsCreatingReel(false);
    navigate("/edits");
  };

  const handleEditClick = (edit) => {
    navigate(`/edits/${edit.id}`);
  };

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

  if (isCreatingCollage) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CollageCreator
          onComplete={handleCollageComplete}
          onCancel={handleCollageCancel}
        />
      </div>
    );
  }

  if (isCreatingReel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReelCreator onCancel={handleCollageReel} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Film size={24} className="mr-2 text-primary-600" />
          My Edits
        </h1>

        {edits.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCreateEdit("reel")}
              className="btn-primary flex items-center"
            >
              <Film size={18} className="mr-1" />
              Create Reel
            </button>
            <button
              onClick={() => handleCreateEdit("collage")}
              className="btn-primary flex items-center"
            >
              <ImageIcon size={18} className="mr-1" />
              Create Collage
            </button>
          </div>
        )}
      </div>

      {edits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <Film size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No edits yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first reel or collage to get started
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => handleCreateEdit("reel")}
              className="btn-primary flex items-center"
            >
              <Film size={18} className="mr-1" />
              Create Reel
            </button>
            <button
              onClick={() => handleCreateEdit("collage")}
              className="btn-primary flex items-center"
            >
              <ImageIcon size={18} className="mr-1" />
              Create Collage
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {edits.map((edit, index) => (
            <motion.div
              key={edit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card card-hover overflow-hidden cursor-pointer"
              onClick={() => handleEditClick(edit)}
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                {edit.type === "reel" ? (
                  <div className="flex items-center justify-center h-full">
                    <Film size={48} className="text-gray-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1 h-full">
                    {edit.images?.slice(0, 4).map((image, i) => (
                      <div key={i} className="relative">
                        <img
                          src={image.url}
                          alt={`Collage image ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 pb-2">
                  {edit.title}
                </h3>
                <img src={edit.url} alt={edit.title} />
                <p className="text-sm text-gray-600 mt-1">
                  {edit.type === "reel" ? "Video Reel" : "Photo Collage"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Created{" "}
                  {new Date(edit.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
