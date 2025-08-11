import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/utils/session";

const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Home | TheShopping Admin";
    navigate(isAuthenticated() ? "/videos" : "/login", { replace: true });
  }, [navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">Redirecting...</div>
    </div>
  );
};

export default Index;
