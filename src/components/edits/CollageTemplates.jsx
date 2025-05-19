import { motion } from "framer-motion";

const templates = [
  {
    id: "grid-2x2",
    name: "2x2 Grid",
    layout: "grid grid-cols-2 gap-2",
    preview: "grid-2x2-preview.jpg",
    description: "Perfect for 4 photos in a balanced grid",
  },
  {
    id: "feature-1",
    name: "Feature + 3",
    layout: "grid grid-cols-2 gap-2",
    preview: "feature-1-preview.jpg",
    description: "One large photo with > 2 smaller ones",
  },
  {
    id: "masonry-3",
    name: "Masonry 3",
    layout: "grid grid-cols-3 gap-2",
    preview: "masonry-3-preview.jpg",
    description: "Three columns with varying heights",
  },
  {
    id: "center-focus",
    name: "Center Focus",
    layout: "grid grid-cols-3 gap-2",
    preview: "center-focus-preview.jpg",
    description: "Center photo with supporting images",
  },
];

export default function CollageTemplates({ selectedTemplate, onSelect }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Choose a Layout</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
              selectedTemplate?.id === template.id
                ? "border-primary-500 ring-2 ring-primary-500"
                : "border-gray-200 hover:border-primary-300"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
              <h4 className="text-white font-medium">{template.name}</h4>
              <p className="text-white/80 text-xs">{template.description}</p>
            </div>
            <div className={`h-full ${template.layout}`}>
              {template.id === "grid-2x2" && (
                <>
                  <div className="bg-gray-200" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-200" />
                </>
              )}
              {template.id === "feature-1" && (
                <>
                  <div className="col-span-2 bg-gray-200" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                </>
              )}
              {template.id === "masonry-3" && (
                <>
                  <div className="row-span-2 bg-gray-200" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                </>
              )}
              {template.id === "center-focus" && (
                <>
                  <div className="bg-gray-300" />
                  <div className="bg-gray-200" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                  <div className="bg-gray-300" />
                </>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
