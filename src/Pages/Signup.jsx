import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import Loading from "../components/Loading";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log(auth.currentUser?.email);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
    } else if (username.includes(' ')) {
      alert("Username can't contain spaces");
    } else {
      try {
        setLoading(true)
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          userName: username,
          userEmail: email,
        });
        await updateProfile(userCredential.user, {
          displayName: username,
        });
        setLoading(false)
        alert("Signup successful!");
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setLoading(false)
        alert(err.message);
        console.error(err);
      }
    }
  };
  return (
    loading ? <Loading /> :
      <div className="flex items-center justify-center min-h-[100vh] bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 w-screen transition-colors duration-300">
        <form
          onSubmit={handleSignup}
          className="flex flex-col gap-5 px-6 md:px-10 py-8 md:py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl w-[90%] max-w-[420px] border border-green-100 dark:border-gray-700"
        >
          {/* Header Section */}
          <div className="text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Sign up to get started</p>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          {/* Username Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Username</label>
            <input
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
              type="text"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Confirm Password</label>
            <input
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
              type="password"
              placeholder="Re-enter your password"
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-600 text-white text-lg font-semibold py-3.5 rounded-xl mt-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link
              className="text-green-700 dark:text-green-400 font-semibold hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200 hover:underline"
              to={'/login'}
            >
              Sign In
            </Link>
          </p>
        </form>
      </div>
  );
}

export default Signup;