import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const { resetPassword } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const messages = {
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account found with this email address.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            await resetPassword(email);
            setMessage("Check your inbox for further instructions.");
        } catch (err) {
            setError(
                messages[err.code] ||
                "Failed to reset password. Please check if the email is correct."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="my-auto w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-lg border border-pink-100">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Reset Password
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter your email and we&apos;ll send you a reset link
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label
                            htmlFor="reset-email"
                            className="text-xs font-semibold text-gray-700"
                        >
                            Email
                        </label>
                        <div className="relative flex items-center">
                            <svg
                                className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <input
                                id="reset-email"
                                type="email"
                                required
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#e11d64] focus:ring-2 focus:ring-pink-100 outline-none transition"
                            />
                        </div>
                    </div>

                    {message && (
                        <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2.5 rounded-xl">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-1 w-full py-2.5 rounded-xl bg-[#e11d64] hover:bg-[#c81757] text-white text-sm font-semibold shadow-sm disabled:opacity-60 transition-colors cursor-pointer"
                    >
                        {submitting ? "Sending..." : "Send Reset Email"}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-2">
                        Remembered your password?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-[#e11d64] hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </form>
            </div>
        </Layout>
    );
}

export default ForgotPassword;