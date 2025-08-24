import { useContext } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "../Contexts/AuthContext";

export const ProtectedRoutes = () => {
  const {currentUser} = useContext(AuthContext);
  if(currentUser){
    <Outlet/>
  }else{
    <Navigate to={'/login'}/>
  }
}
