import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionContext } from "@context/SessionContext";

const Profile = () => {
  const { user, logout } = useSessionContext();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No user information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </div>

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-name" className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p id="profile-name" className="text-lg">
                  {user.name || "Not specified"}
                </p>
              </div>

              <div>
                <label htmlFor="profile-email" className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p id="profile-email" className="text-lg">
                  {user.email}
                </p>
              </div>

              <div>
                <label htmlFor="profile-id" className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p id="profile-id" className="text-sm font-mono text-muted-foreground">
                  {user._id}
                </p>
              </div>

              <div>
                <label htmlFor="profile-created" className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p id="profile-created" className="text-sm">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Information */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profile-session-status" className="text-sm font-medium text-muted-foreground">
                  Session Status
                </label>
                <p id="profile-session-status" className="text-sm text-green-600">
                  Active
                </p>
              </div>

              <div>
                <label htmlFor="profile-last-update" className="text-sm font-medium text-muted-foreground">
                  Last Update
                </label>
                <p id="profile-last-update" className="text-sm">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not available"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
