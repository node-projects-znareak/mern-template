import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useSessionContext } from "@context/SessionContext";

const Home = () => {
  const { user, logout } = useSessionContext();
  const navigate = useNavigate();
  // console.log({user})
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[60vh]">
        <Card>
          <CardHeader>
            <CardTitle>MERN Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">View and manage your personal information</p>
            {user ? (
              <>
                <Button asChild className="w-full">
                  <Link to="/profile">View Profile</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link to="/register">Sign up</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/login">Log in</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
