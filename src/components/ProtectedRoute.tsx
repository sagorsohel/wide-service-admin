import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/redux/store";

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
