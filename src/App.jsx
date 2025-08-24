import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import Home from "./Pages/Home"
import { AuthContext } from "./Contexts/AuthContext"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"

function App() {
  const [currentUser, setCurrentUser] = useState();

  useEffect(()=>{
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  },[])
  return (
    <AuthContext.Provider value={{currentUser}}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/" element={<Home/>} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export default App
