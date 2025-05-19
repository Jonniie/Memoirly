import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";
import EditsList from "../components/edits/EditsList";
import { Loader2 } from "lucide-react";

export default function Edits() {
  const { user } = useUser();
  const [edits, setEdits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEdits();
  }, [user]);

  const fetchEdits = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from("edits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setEdits(data || []);
    } catch (err) {
      console.error("Error fetching edits:", err);
      setError("Failed to load edits. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDeleted = (editId) => {
    setEdits((prev) => prev.filter((edit) => edit.id !== editId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Edits</h1>
        <p className="mt-2 text-gray-600">
          View and manage your collages and reels
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading your edits...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-error-600 mb-4">{error}</p>
          <button onClick={fetchEdits} className="btn-primary">
            Try Again
          </button>
        </div>
      ) : edits.length > 0 ? (
        <EditsList edits={edits} onEditDeleted={handleEditDeleted} />
      ) : (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No edits yet
          </h3>
          <p className="text-gray-500">
            Create your first collage or reel to get started
          </p>
        </div>
      )}
    </div>
  );
}
