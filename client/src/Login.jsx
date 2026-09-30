import { useState } from 'react';
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";

function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");  
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    
    // If someone who is already logged in visits /login, send them to the todo page
    if (user) return <Navigate to="/" replace />;

    const messages = {
        "auth/invalid-credential": "Wrong email or password.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/too-many-requests": "Too many attempts. Try again later.",        
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(messages[err.code] || "Something went wrong. Try again.");
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
                <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>

                <input 
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none"
                />
                
                <input 
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-pink-50 text-gray-900 outline-none"
                />
                
                {error && <p className="text-sm text-pink-100 font-semibold">{error}</p>}

                <button
                    disabled={submitting}
                    className="py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold disabled:opacity-60"
                >
                    {submitting ? "Please wait..." : "Log in"}
                </button>

                <p className="text-sm text-pink-100 text-center">
                    No account?{" "}
                    <Link to="/register" className="font-semibold text-white hover:underline">
                        Register
                    </Link>
                </p>
            </form>
        </Layout>
    );
}

export default Login;