import React from "react";
import useAuth from "../../hooks/useAuth";
import Loader from "../../pages/Shared/Loader/Loader";
import { Navigate, useLocation } from "react-router";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={location.pathname} />;
  }

  return children;
};

export default PrivateRoute;
