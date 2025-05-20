import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Camera, Calendar, Film, Sun, Sparkles, Share2 } from "lucide-react";

import { SignInButton, SignUpButton } from "@clerk/clerk-react";

export default function HomePage() {
  const features = [
    {
      title: "Upload & Organize",
      description:
        "Easily upload photos and videos with automatic organization by date and smart tagging.",
      icon: <Camera className="w-6 h-6 text-primary-600" />,
    },
    {
      title: "AI-Powered Tagging",
      description:
        "Automatic content analysis and tagging using TensorFlow for better organization.",
      icon: <Sparkles className="w-6 h-6 text-primary-600" />,
    },
    {
      title: "Secure Sharing",
      description:
        "Share your memories with granular privacy controls and secure authentication.",
      icon: <Share2 className="w-6 h-6 text-primary-600" />,
    },
  ];
  const { isSignedIn } = useAuth();
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center w-full max-w-7xl mx-auto">
        {/* Logo & Tagline */}
        <div className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6 flex items-center justify-center">
            <div className="relative">
              <Camera size={40} className="text-primary-600 sm:w-12 sm:h-12" />
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute -top-2 -right-2"
              >
                <Sun size={12} className="text-accent-500 sm:w-4 sm:h-4" />
              </motion.div>
            </div>
            <h1 className="ml-2 text-2xl sm:text-3xl font-bold text-gray-900">
              Memoirly
            </h1>
          </div>

          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            A smart, personal memory gallery that lets you preserve life's most
            meaningful moments — with photos, videos, journals, and AI-generated
            story reels.
          </p>
        </div>

        {/* Features Section */}
        <div className="w-full px-4 sm:px-6">
          <div className="mt-8 sm:mt-12">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
                  className="rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white/20 backdrop-blur-sm"
                >
                  <div className="p-3 sm:p-4 bg-primary-100 rounded-full inline-block mb-3 sm:mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12 sm:mt-16 px-4">
          {isSignedIn ? (
            <Link
              to="/dashboard"
              className="btn-primary bg-white text-primary-700 hover:bg-gray-50 text-base sm:text-lg px-6 py-3 w-full sm:w-auto"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <SignInButton redirectUrl="/dashboard">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-gray-800 font-medium shadow hover:shadow-lg transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton redirectUrl="/dashboard">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-800 text-white font-medium shadow hover:shadow-lg transition">
                  Get Started Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500 pt-4 px-4">
          Your memories. Your story. Forever safe, beautifully told.
        </p>
      </div>
    </div>
  );
}
