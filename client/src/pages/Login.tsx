import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Gamepad2, Loader2 } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to role select if user is authenticated
  useEffect(() => {
    if (user && !loading) {
      setLocation("/role-select");
    }
  }, [user, loading, setLocation]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Don't render login form if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <Gamepad2 className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">K-Quiz</h1>
          <p className="text-xl text-gray-600">Multiplayer Quiz Game</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to play K-Quiz with others or play solo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
            >
              Sign In with Manus
            </Button>


          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Sign in to host or join multiplayer games</p>
        </div>
      </div>
    </div>
  );
}
