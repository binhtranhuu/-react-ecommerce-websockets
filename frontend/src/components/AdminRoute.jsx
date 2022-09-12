import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function AdminRoute({ component: Component }) {
  const userSignin = useSelector((state) => state.userSignin);
  const { userInfo } = userSignin;
  return userInfo && userInfo.isAdmin ? (
    <Component />
  ) : (
    <Navigate to="/signin" />
  );
}

export default AdminRoute;
