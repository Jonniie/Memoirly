import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "../lib/supabase";

export default function SharedMemory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .eq("id", id)
          .eq("is_public", true)
          .single();

        if (error) throw error;

        if (data) {
          const transformedMemory = {
            id: data.id,
            publicId: data.public_id,
            url: data.url,
            thumbnailUrl: data.url,
            type: data.type,
            title: data.caption || data.url.split("/").pop(),
            note: data.note || "",
            createdAt: data.created_at,
            tags: data.tags || [],
            emotion: data.emotion || "neutral",
            location: data.location || "",
          };

          setMemory(transformedMemory);
        } else {
          setError("This memory is not available for public viewing.");
        }
      } catch (err) {
        console.error("Error fetching memory:", err);
        // setError("Failed to load memory details. Please try again later.");
        setError("This memory is not available for public viewing.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  const handleGoBack = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button onClick={handleGoBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Memory not found</p>
          <button onClick={handleGoBack} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100vh] max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="lg:flex">
          {/* Media Section */}
          <div className="lg:w-7/12 bg-gray-100">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {memory.type === "image" ? (
                <img
                  src={memory.url}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                  style={{ maxHeight: "80vh" }}
                />
              ) : (
                <video
                  src={memory.url}
                  controls
                  className="w-full h-full object-cover"
                  style={{ maxHeight: "80vh" }}
                />
              )}
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="lg:w-5/12 p-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold text-gray-900">
                {memory.title}
              </h1>

              {memory.note && (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {memory.note}
                </p>
              )}

              <div className="space-y-4">
                <div className="flex items-center text-gray-500">
                  <span className="text-sm">
                    {format(new Date(memory.createdAt), "MMMM d, yyyy")}
                  </span>
                </div>

                {memory.location && (
                  <div className="flex items-center text-gray-500">
                    <span className="text-sm">{memory.location}</span>
                  </div>
                )}

                {memory.tags && memory.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    {memory.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
