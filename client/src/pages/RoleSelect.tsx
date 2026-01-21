import { useAuth } from "@/_core/hooks/useAuth";
import { useGameRole } from "@/hooks/useGameRole";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, LogOut, Loader2 } from "lucide-react";

export default function RoleSelect() {
  const { user, logout, loading } = useAuth();
  const { selectRole } = useGameRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSelectRole = (role: "owner" | "player") => {
    selectRole(role);
    if (role === "owner") {
      setLocation("/room/create");
    } else {
      setLocation("/room/join");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">K-Quiz</h1>
          <p className="text-xl text-gray-600 mb-4">Welcome, {user.name}!</p>
          <Button variant="outline" onClick={handleLogout} className="mb-8">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Room Owner Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectRole("owner")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>Room Owner</CardTitle>
              <CardDescription>Host a game</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Create a room, invite players, and control the game flow. Display questions and manage the leaderboard.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </CardContent>
          </Card>

          {/* Player Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleSelectRole("player")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <Gamepad2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle>Player</CardTitle>
              <CardDescription>Join a game</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Join an existing room with a code and compete with other players. Answer questions and climb the leaderboard.
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700">Get Started</Button>
            </CardContent>
          </Card>

          {/* Solo Card */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setLocation("/solo")}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-purple-100 p-4 rounded-full">
                  <Gamepad2 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <CardTitle>Solo Mode</CardTitle>
              <CardDescription>Play alone</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Create your own questions and play at your own pace. Perfect for practice and learning.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600">
          <p>Choose your role to begin</p>
        </div>
      </div>
    </div>
  );
}
