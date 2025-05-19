import { ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../ui/LoadingScreen";

export default function ProtectedRoute({ children, redirectTo = "/" }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded } = useUser();

  // Show loading indicator while authentication state is being determined
  if (!isLoaded || !isUserLoaded) {
    return <LoadingScreen />;
  }

  // Redirect to login if not signed in
  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if user is authenticated
  return <>{children}</>;
}
