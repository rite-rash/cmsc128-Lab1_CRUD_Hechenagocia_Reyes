//DESCRIPTION: register an account in firestore with customized pw requirements
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import PasswordInput from "./PasswordInput";
import {
    AuthCard,
    TextField,
    UserIcon,
    MailIcon,
    buttonClass,
    linkClass,
    errorClass,
    hintClass,
} from "./AuthParts";

// Same rule as updateUsername in AuthContext (letters, numbers, underscore, 3-20)
const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

const MESSAGES = {
    "auth/invalid-argument": "Please fill all required fields.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/email-already-in-use": "That email is already registered. Log in or use another email.",
    "auth/weak-password": "Password must be at least 8 characters with an uppercase letter, a lowercase letter, a number and a special character.",
    "username/taken": "That username is already taken.",
    "username/invalid": "Use 3–20 letters, numbers or underscores (no spaces).",
    "permission-denied": "That username is already taken.",
};

// Password rules (module scope so they aren't rebuilt on every render)
// Order matches the mockup.
const REQUIREMENTS = [
    { text: "At least 8 characters", check: (pw) => pw.length >= 8 },
    { text: "Uppercase letter", check: (pw) => /[A-Z]/.test(pw) },
    { text: "Lowercase letter", check: (pw) => /[a-z]/.test(pw) },
    { text: "Number", check: (pw) => /[0-9]/.test(pw) },
    // Any non-letter, non-number, non-space character counts as special.
    { text: "Special character", check: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
];

export function Register() {
    const { user, signup, updateName } = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Derived values (no extra state needed)
    const passwordValid = REQUIREMENTS.every((req) => req.check(password));
    const usernameValid = USERNAME_REGEX.test(userName.trim());
    const passwordsMatch = password === confirmPassword;
    const showMismatch = confirmPassword.length > 0 && !passwordsMatch;
    const canSubmit =
        usernameValid &&
        email.trim() !== "" &&
        passwordValid &&
        passwordsMatch &&
        confirmPassword !== "";

    //redirect if already logged in (but not mid-submit)
    if (user && !submitting) return <Navigate to="/" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Keep the checks here too, in case the button state is bypassed
        if (!usernameValid) return setError(MESSAGES["username/invalid"]);
        if (!passwordValid) return setError("Password requirements not met.");
        if (!passwordsMatch) return setError("Passwords do not match.");

        setSubmitting(true);

        try {
            const userCredential = await signup(email.trim(), password);
            const newUser = userCredential.user;

            //claim the username (checks it's free, saves it in "usernames" and as displayName)
            try {
                await updateName(userName);
            } catch (nameErr) {
                await newUser.delete(); // undo the account so the email isn't stuck
                throw nameErr;
            }

            await setDoc(doc(db, "users", newUser.uid), {
                uid: newUser.uid,
                userName: userName.trim(),
                email: newUser.email,
                createdAt: new Date(),
            });
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Register error:", err.code, err);
            setError(MESSAGES[err.code] || "Failed to create an account. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout>
            <AuthCard
                title="Create an account"
                onSubmit={handleSubmit}
                footer={
                    <>
                        Already have an account?{" "}
                        <Link to="/login" className={linkClass}>
                            Log in
                        </Link>
                    </>
                }
            >
                <div className="flex flex-col gap-2">
                    <TextField
                        id="reg-username"
                        label="Username"
                        icon={<UserIcon />}
                        type="text"
                        required
                        autoComplete="username"
                        placeholder="e.g. hibi_fan"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        aria-describedby="reg-username-hint"
                    />
                    <p id="reg-username-hint" className={hintClass}>
                        3-20 letters, numbers or underscores.
                    </p>
                </div>

                <TextField
                    id="reg-email"
                    label="Email"
                    icon={<MailIcon />}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {/* Password + its checklist stay together */}
                <div className="flex flex-col gap-3">
                    <PasswordInput
                        id="reg-password"
                        label="Password"
                        autoComplete="new-password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-describedby="reg-password-rules"
                    />

                    <ul
                        id="reg-password-rules"
                        aria-label="Password requirements"
                        className="flex flex-col gap-1 text-[13px]"
                    >
                        {REQUIREMENTS.map((req) => {
                            const met = req.check(password);
                            return (
                                <li
                                    key={req.text}
                                    className={`flex items-center gap-2.5 ${
                                        met ? "font-semibold text-[#3d0a20]" : "text-[#7a3f5a]"
                                    }`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`flex h-4 w-4 items-center justify-center rounded-full border text-[10px] leading-none transition ${
                                            met
                                                ? "border-[#c2185b] bg-[#c2185b] text-white"
                                                : "border-[#c98aa6] text-transparent"
                                        }`}
                                    >
                                        ✓
                                    </span>
                                    {req.text}
                                    <span className="sr-only">
                                        {met ? "(met)" : "(not met)"}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex flex-col gap-2">
                    <PasswordInput
                        id="reg-confirm"
                        label="Confirm password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={showMismatch}
                        aria-describedby={showMismatch ? "reg-confirm-error" : undefined}
                    />
                    {showMismatch && (
                        <p id="reg-confirm-error" className={errorClass}>
                            Passwords don't match yet.
                        </p>
                    )}
                </div>

                {/* role="alert" makes screen readers announce the error */}
                {error && (
                    <p role="alert" className={errorClass}>
                        {error}
                    </p>
                )}

                <button disabled={submitting || !canSubmit} className={buttonClass}>
                    {submitting ? "Creating account..." : "Register"}
                </button>
            </AuthCard>
        </Layout>
    );
}

export default Register;