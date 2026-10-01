import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";

// ---------- Constants (defined once, outside the component) ----------

// Maps Firebase error codes to user-friendly messages
const ERROR_MESSAGES = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
};

const DEFAULT_ERROR = "Something went wrong. Try again.";

// Shared styles
const inputStyle = "px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none";
const buttonStyle =
    "py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold disabled:opacity-60";

// ---------- Component ----------

function Login() {
    // Auth & routing
    const { user, login } = useAuth();
    const navigate = useNavigate();

    // Form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // UI state
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, skip the login page and go home
    if (user) return <Navigate to="/" replace />;

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(ERROR_MESSAGES[err.code] || DEFAULT_ERROR);
        } finally {
            // Re-enable the button whether login succeeded or failed
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <form
                onSubmit={handleSubmit}
                className="my-auto w-full max-w-sm bg-[#bc688c] p-8 rounded-3xl shadow-2xl flex flex-col gap-4"
            >
                <h1 className="text-2xl font-extrabold text-white text-center">
                    Welcome back!
                </h1>

                {/* Email */}
                <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputStyle}
                />

                {/* Password */}
                <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputStyle}
                />

                {/* Error message (only shown when there is one) */}
                {error && (
                    <p className="text-sm text-pink-100 font-semibold">{error}</p>
                )}

                {/* Submit */}
                <button disabled={submitting} className={buttonStyle}>
                    {submitting ? "Please wait..." : "Log in"}
                </button>

                {/* Link to registration */}
                <p className="text-sm text-pink-100 text-center">
                    No account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-white hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </form>
        </Layout>
    );
}

export default Login;