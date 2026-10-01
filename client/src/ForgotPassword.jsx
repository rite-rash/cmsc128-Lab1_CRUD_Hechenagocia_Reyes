import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const {resetPassword} = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const messages = {
        "auth/invalid-email":"Please enter a valid email address.",
        "auth/user-not-found":"No account found with this email address.",
        "auth/too-many-requests":"Too many attempts. Please try again later.",
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
            setError(messages[err.code]||"Failed to reset password. Please check if the email is correct.");     
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <form 
                onSubmit={handleSubmit}
                className="my-auto w-full max-w-sm bg-[#bc688c] p-8 rounded-3xl shadow-2xl flex flex-col gap-4"
            >
                <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>

                <input 
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none"
                />

                {message && <p className="text-sm text-green-200 font-semibold">{message}</p>}
                {error && <p className="text-sm text-pink-100 font-semibold">{error}</p>}

                <button
                    disabled={submitting}
                    className="py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold disabled:opacity-60 transition-colors"
                >
                    {submitting ? "Sending..." :"Send Reset Email"}
                </button>

                <p className="text-sm text-pink-100 text-center">
                    Remembered your password?{" "}
                    <Link to="/login" className="font-semibold text-white hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </Layout>
    );
}

export default ForgotPassword;