import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

export const UnProtectedRoutes = () => {
  const {currentUser} = useContext(AuthContext);
  return (!currentUser?<Outlet/>:<Navigate to={'/'} replace/>)
}
