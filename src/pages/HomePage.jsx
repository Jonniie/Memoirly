import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Camera, Calendar, Film, Sun } from "lucide-react";

import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function HomePage() {
  const features = [
    {
      title: "Upload & Share Memories",
      description:
        "Easily upload photos and videos of your favorite moments to preserve them forever.",
      icon: <Camera className="w-6 h-6 text-primary-600" />,
    },
    {
      title: "Timeline View",
      description:
        "Browse your memories chronologically and see how they unfold through time.",
      icon: <Calendar className="w-6 h-6 text-primary-600" />,
    },
    {
      title: "Video Compilations",
      description:
        "Create beautiful video compilations from your photos and memories.",
      icon: <Film className="w-6 h-6 text-primary-600" />,
    },
  ];
  const { isSignedIn } = useAuth();
  return (
    <div className="h-screen w-full  flex items-center gap-16 justify-center px-6">
      <div className="text-center container">
        {/* Logo & Tagline */}
        <div className="">
          <div className="mb-4 sm-mb-16 flex items-center justify-center text-clamp font-extrabold text-gray-800 tracking-tight">
            <div className="relative">
              <Camera size={48} className="text-primary-600" />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-2 -right-2"
              >
                <Sun size={14} className="text-accent-500" />
              </motion.div>
            </div>
            <h1 className="ml-2  font-semibold text-gray-900">Memoirly</h1>
          </div>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            A smart, personal memory gallery that lets you preserve life’s most
            meaningful moments — with photos, videos, journals, and AI-generated
            story reels.
          </p>
        </div>
        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 ">
          <div className="mt-8 sm:mt-12">
            <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-1 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  className="rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white/20 backdrop-blur-sm"
                >
                  <div className="p-4 bg-primary-100 rounded-full inline-block mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="max-w-[80%] mx-auto mt-2 text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex justify-center gap-4 mt-16">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="btn-primary bg-white text-primary-700 hover:bg-gray-50 text-lg px-6 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <SignInButton redirectUrl="/dashboard">
              <button className="px-6 py-3 rounded-xl bg-white text-gray-800 font-medium shadow hover:shadow-lg transition">
                Sign In
              </button>
            </SignInButton>
          )}

          {!isSignedIn && (
            <SignUpButton redirectUrl="/dashboard">
              <button className="px-6 py-3 rounded-xl bg-gray-800 text-white font-medium shadow hover:shadow-lg transition">
                Get Started Free
              </button>
            </SignUpButton>
          )}
        </div>
        <p className="text-sm text-gray-500 pt-4">
          Your memories. Your story. Forever safe, beautifully told.
        </p>
      </div>
    </div>
  );
}
