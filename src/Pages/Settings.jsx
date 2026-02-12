import React, { useContext, useState } from "react";
import { ThemeContext } from "../Contexts/ThemeContext.jsx";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const Settings = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const navigate = useNavigate();

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match." });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: "error", text: "Password must be at least 6 characters." });
            return;
        }

        setLoading(true);
        setMessage({ type: "", text: "" });

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setMessage({ type: "success", text: "Password updated successfully." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Error updating password:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
                setMessage({ type: "error", text: "Incorrect current password." });
            } else if (error.code === 'auth/too-many-requests') {
                setMessage({ type: "error", text: "Too many failed attempts. Please try again later." });
            } else {
                setMessage({ type: "error", text: "Failed to update password. Please try again later." });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-green-50 via-white to-green-100 text-gray-800'}`}>
            <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white/90 border-green-100 backdrop-blur-sm'}`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-green-100 text-green-800'}`}
                    >
                        <i className="fa-solid fa-arrow-left text-xl"></i>
                    </button>
                    <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-green-800'}`}>Settings</h1>
                    <div className="w-9"></div> {/* Spacer for alignment */}
                </div>

                {/* Theme Toggle Section */}
                <div className="mb-8">
                    <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-green-700'}`}>Appearance</h2>
                    <div className={`flex items-center justify-between p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
                        <div className="flex items-center gap-3">
                            <i className={`fa-solid ${theme === 'dark' ? 'fa-moon text-yellow-300' : 'fa-sun text-orange-400'} text-xl`}></i>
                            <span className="font-medium">Dark Mode</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {/* Password Change Section */}
                <div>
                    <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-green-700'}`}>Security</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">

                        {/* Message Display */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white placeholder-gray-400' : 'bg-white border-green-200 focus:border-green-800 focus:ring-green-100 text-gray-800'}`}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white placeholder-gray-400' : 'bg-white border-green-200 focus:border-green-800 focus:ring-green-100 text-gray-800'}`}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all ${theme === 'dark' ? 'bg-gray-700 border-gray-600 focus:border-green-500 focus:ring-green-500 text-white placeholder-gray-400' : 'bg-white border-green-200 focus:border-green-800 focus:ring-green-100 text-gray-800'}`}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2.5 rounded-xl font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' ? 'bg-green-700 hover:bg-green-600' : 'bg-green-800 hover:bg-green-900'}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-circle-notch fa-spin"></i> Updating...
                                </span>
                            ) : "Change Password"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Settings;
