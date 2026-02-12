import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import Home from "./Pages/Home"
import { AuthContext } from "./Contexts/AuthContext"
import { ThemeContextProvider } from "./Contexts/ThemeContext.jsx"
import Settings from "./Pages/Settings"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./config/firebase"
import { ProtectedRoutes } from "./utils/ProtectedRoutes"
import { UnProtectedRoutes } from "./utils/UnProtectedRoutes"
import Loading from "./components/Loading"

function App() {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false)
    });
    return unsubscribe;
  }, [])
  return (
    <AuthContext.Provider value={{ currentUser }}>
      <ThemeContextProvider>
        {loading ? <Loading /> : <BrowserRouter>
          <Routes>
            <Route element={<UnProtectedRoutes />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Home />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>}
      </ThemeContextProvider>
    </AuthContext.Provider>
  )
}

export default App
