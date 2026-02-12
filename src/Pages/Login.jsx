import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../config/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("logged in successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[100vh] bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 w-screen transition-colors duration-300">
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-5 px-6 md:px-10 py-8 md:py-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl rounded-3xl w-[90%] max-w-[420px] border border-green-100 dark:border-gray-700"
      >
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-700 to-green-900 dark:from-green-400 dark:to-green-200 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Sign in to continue to your account</p>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
          <input
            required
            onChange={(e) => setEmail(e.target.value)}
            className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
            type="email"
            placeholder="Enter your email"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
          <input
            required
            onChange={(e) => setPassword(e.target.value)}
            className="px-5 py-3 border-2 border-green-600 rounded-xl focus:border-green-800 dark:bg-gray-700 dark:border-green-500 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-all duration-300 placeholder:text-gray-400"
            type="password"
            placeholder="Enter your password"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="bg-green-800 hover:bg-green-900 dark:bg-green-700 dark:hover:bg-green-600 text-white text-lg font-semibold py-3.5 rounded-xl mt-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          Sign In
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

        {/* Signup Link */}
        <p className="text-center text-gray-600 dark:text-gray-300">
          Don't have an account?{' '}
          <Link
            className="text-green-700 dark:text-green-400 font-semibold hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200 hover:underline"
            to={'/signup'}
          >
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;