import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-mf-bg pb-[72px]">
      <Outlet />
      <BottomNav />
    </div>
  );
}
