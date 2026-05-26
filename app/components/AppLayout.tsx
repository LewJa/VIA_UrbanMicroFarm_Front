import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";

export default function AppLayout() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  if (!token) return null;

  return <Outlet />;
}
