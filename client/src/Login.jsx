import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import PasswordInput from "./PasswordInput";
import {
    AuthCard,
    TextField,
    MailIcon,
    buttonClass,
    linkClass,
    errorClass,
} from "./AuthParts";

// Maps Firebase error codes to user-friendly messages
const ERROR_MESSAGES = {
    "auth/invalid-credential": "Wrong email or password.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
};

const DEFAULT_ERROR = "Something went wrong. Try again.";

function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, skip the login page and go home
    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email.trim(), password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(ERROR_MESSAGES[err.code] || DEFAULT_ERROR);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <AuthCard
                title="Welcome back!"
                onSubmit={handleSubmit}
                footer={
                    <>
                        No account?{" "}
                        <Link to="/register" className={linkClass}>
                            Register
                        </Link>
                    </>
                }
            >
                <TextField
                    id="login-email"
                    label="Email"
                    icon={<MailIcon />}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!error}
                />

                {/* Forgot link sits right under the password field, as in the mockup */}
                <div className="flex flex-col gap-3">
                    <PasswordInput
                        id="login-password"
                        label="Password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!error}
                    />
                    <Link
                        to="/forgot-password"
                        className={`${linkClass} self-end text-sm no-underline`}
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* role="alert" makes screen readers announce the error */}
                {error && (
                    <p role="alert" className={errorClass}>
                        {error}
                    </p>
                )}

                <button disabled={submitting} className={buttonClass}>
                    {submitting ? "Logging in..." : "Log in"}
                </button>
            </AuthCard>
        </Layout>
    );
}

export default Login;