import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Loader2, Tag, Users, MapPin } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

// Common categories for better organization
const CATEGORIES = {
  nature: [
    "beach",
    "mountain",
    "forest",
    "ocean",
    "sky",
    "sunset",
    "landscape",
    "water",
    "tree",
    "flower",
    "lake",
    "river",
    "garden",
    "park",
    "field",
    "grass",
    "snow",
    "ice",
    "desert",
    "canyon",
  ],
  people: [
    "person",
    "people",
    "portrait",
    "family",
    "group",
    "face",
    "smile",
    "man",
    "woman",
    "child",
    "baby",
    "adult",
    "teen",
    "elderly",
    "crowd",
    "couple",
    "friends",
  ],
  activities: [
    "sports",
    "travel",
    "food",
    "party",
    "event",
    "celebration",
    "dance",
    "music",
    "concert",
    "wedding",
    "birthday",
    "graduation",
    "vacation",
    "hiking",
    "swimming",
    "running",
    "exercise",
  ],
  animals: [
    "animal",
    "pet",
    "dog",
    "cat",
    "bird",
    "wildlife",
    "mammal",
    "reptile",
    "fish",
    "insect",
    "horse",
    "cow",
    "sheep",
    "lion",
    "tiger",
    "elephant",
    "bear",
    "wolf",
    "fox",
    "deer",
  ],
  architecture: [
    "building",
    "house",
    "city",
    "street",
    "architecture",
    "interior",
    "home",
    "apartment",
    "office",
    "church",
    "temple",
    "castle",
    "bridge",
    "tower",
    "monument",
    "statue",
  ],
  weather: [
    "sunny",
    "rainy",
    "snowy",
    "cloudy",
    "storm",
    "foggy",
    "windy",
    "clear",
    "overcast",
    "thunder",
    "lightning",
    "rainbow",
    "sunrise",
    "sunset",
  ],
  time: [
    "day",
    "night",
    "morning",
    "evening",
    "dawn",
    "dusk",
    "noon",
    "midnight",
    "sunrise",
    "sunset",
  ],
  objects: [
    "car",
    "bicycle",
    "motorcycle",
    "airplane",
    "boat",
    "train",
    "bus",
    "truck",
    "furniture",
    "chair",
    "table",
    "bed",
    "sofa",
    "lamp",
    "clock",
    "phone",
    "computer",
    "camera",
  ],
  food: [
    "food",
    "meal",
    "dish",
    "restaurant",
    "cooking",
    "baking",
    "fruit",
    "vegetable",
    "meat",
    "dessert",
    "drink",
    "coffee",
    "tea",
    "wine",
    "beer",
  ],
};

export default function AITagger({ media, onComplete }) {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [tags, setTags] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [model, setModel] = useState(null);

  // Load the model when component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (error) {
        console.error("Error loading model:", error);
        toast.error("Failed to load AI model");
      }
    };
    loadModel();
  }, []);

  const analyzeImage = async (imageUrl) => {
    if (!model) throw new Error("Model not loaded");

    // Create an image element
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Wait for image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Get predictions
    const predictions = await model.classify(img);

    // Filter out irrelevant terms and low confidence predictions
    const irrelevantTerms = [
      "web site",
      "website",
      "internet site",
      "site",
      "screen",
      "monitor",
      "display",
      "computer",
      "text",
      "letter",
      "word",
      "font",
      "type",
      "background",
      "foreground",
      "border",
      "frame",
      "image",
      "picture",
      "photo",
      "photograph",
      "graphic",
      "illustration",
      "drawing",
      "painting",
      "art",
      "artwork",
      "design",
      "pattern",
      "object",
      "thing",
      "item",
      "stuff",
      "material",
      "device",
      "equipment",
      "tool",
      "instrument",
      "container",
      "box",
      "package",
      "wrapper",
      "surface",
      "texture",
      "pattern",
      "design",
      "color",
      "shape",
      "form",
      "structure",
    ];

    // Take only high confidence predictions and filter irrelevant terms
    const topPredictions = predictions
      .filter((pred) => pred.probability > 0.4) // Only keep predictions with >70% confidence
      .filter(
        (pred) =>
          !irrelevantTerms.some((term) =>
            pred.className.toLowerCase().includes(term)
          )
      )
      .slice(0, 3); // Take top 3 after filtering

    // Extract tags from top predictions and limit to top 3
    const detectedTags = topPredictions
      .flatMap((pred) => {
        // Split the className by commas and clean each tag
        return pred.className
          .toLowerCase()
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0 && tag.length > 2); // Filter out very short tags
      })
      .slice(0, 3); // Strictly limit to top 3 tags

    // Categorize tags (only for the top 3)
    const categorizedTags = detectedTags.reduce((acc, tag) => {
      for (const [category, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some((keyword) => tag.includes(keyword))) {
          acc.push(category);
        }
      }
      return acc;
    }, []);

    // Combine specific tags with categories and remove duplicates
    const finalTags = [...new Set([...detectedTags, ...categorizedTags])].slice(
      0,
      3
    );

    // Simple metadata based on predictions
    const metadata = {
      objectCount: topPredictions.length,
      hasPeople: finalTags.some(
        (tag) => tag.includes("person") || tag.includes("people")
      ),
      confidence: topPredictions[0]?.probability || 0,
    };

    return { tags: finalTags, metadata };
  };

  const handleTagging = async () => {
    if (!model) {
      toast.error("AI model is still loading. Please wait.");
      return;
    }

    setIsProcessing(true);
    try {
      // Get existing tags
      const { data: existingMedia } = await supabase
        .from("media")
        .select("tags")
        .eq("id", media.id)
        .single();

      const existingTags = existingMedia?.tags || [];

      // Analyze the image using TensorFlow.js
      const { tags: detectedTags, metadata: detectedMetadata } =
        await analyzeImage(media.url);

      // Combine existing and new tags, removing duplicates
      const combinedTags = [...new Set([...existingTags, ...detectedTags])];

      // Update the existing media record with combined tags
      const { error } = await supabase
        .from("media")
        .update({
          tags: combinedTags,
          metadata: detectedMetadata,
        })
        .eq("id", media.id);

      if (error) throw error;

      setTags(combinedTags);
      setMetadata(detectedMetadata);
      toast.success("Tags added successfully!");
      onComplete?.();
    } catch (error) {
      console.error("Error tagging media:", error);
      toast.error("Failed to add tags. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMetadata = () => {
    if (!metadata) return null;

    return (
      <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
        {metadata.hasPeople && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">People detected</span>
          </div>
        )}
        {metadata.objectCount > 0 && (
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {metadata.objectCount} objects
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {Math.round(metadata.confidence * 100)}% confidence
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">AI Image Analysis</h3>
      <div className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={media.url}
            alt="Media to tag"
            className="w-full h-full object-cover"
          />
        </div>

        {tags.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            {renderMetadata()}
          </div>
        ) : (
          <button
            onClick={handleTagging}
            disabled={isProcessing || !model}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : !model ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading AI Model...
              </>
            ) : (
              <>
                <Tag className="w-4 h-4" />
                Analyze Image
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
