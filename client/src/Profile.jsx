import { useState } from "react";
import { useAuth } from "./AuthContext";

// ---------- Constants (defined once, outside the component) ----------

// Maps error codes to user-friendly messages
const ERROR_MESSAGES = {
    "auth/invalid-credential": "Current password is incorrect.",
    "auth/email-already-in-use": "That email is already registered.",
    "auth/invalid-email": "Please enter a valid email.",
    "auth/weak-password": "Password requirements not met. Please create a new one.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/password-does-not-meet-requirements": "Password requirements not met. Please create a new one.",
    "auth/requires-recent-login": "Please log out and log in again, then try once more.",
    "username/taken": "That username is already taken.",
    "username/invalid": "Use 3–20 letters, numbers or underscores (no spaces).",
    "permission-denied": "That username is already taken.",
};

const DEFAULT_ERROR = "Something went wrong. Try again.";

// Same password rules as Register.jsx
const PASSWORD_REQUIREMENTS = [
    { text: "Must be at least 8 characters long", check: (pw) => pw.length >= 8 },
    { text: "Must contain at least 1 uppercase character", check: (pw) => /[A-Z]/.test(pw) },
    { text: "Must contain at least 1 lowercase character", check: (pw) => /[a-z]/.test(pw) },
    { text: "Must contain at least 1 special character", check: (pw) => /[@)!%*?&]/.test(pw) },
    { text: "Must contain at least 1 number", check: (pw) => /[0-9]/.test(pw) },
];

// Starting (empty) feedback for each section
const NO_FEEDBACK = { error: "", success: "" };

// Shared styles
const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white border border-pink-200 text-gray-900 outline-none focus:border-pink-400";
const valueClass =
    "px-3 py-2 rounded-lg bg-white/70 border border-pink-200 text-gray-900";
const labelClass = "text-sm font-bold text-[#8c4362]";
const linkClass =
    "text-sm font-semibold text-[#bc688c] hover:text-[#8c4362] underline";
const saveClass =
    "px-5 py-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white font-semibold disabled:opacity-60";
const cancelClass =
    "px-5 py-2 rounded-lg bg-pink-100 hover:bg-pink-200 text-[#8c4362] font-semibold";
const sectionClass = "flex flex-col gap-2 py-5";

// ---------- Small reusable components ----------

// Shows an error and/or success banner (renders nothing if both are empty)
function Feedback({ error, success }) {
    return (
        <>
            {error && (
                <p className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-2 rounded-lg">
                    {error}
                </p>
            )}
            {success && (
                <p className="text-sm font-semibold text-green-800 bg-green-100 px-3 py-2 rounded-lg">
                    {success}
                </p>
            )}
        </>
    );
}

// One settings row: label + "Change" link, then whatever children you pass in
function Section({ label, editing, onEdit, bordered = false, children }) {
    return (
        <div className={`${sectionClass} ${bordered ? "border-t border-pink-300/50" : ""}`}>
            <div className="flex items-center justify-between">
                <span className={labelClass}>{label}</span>
                {/* Hide the link while the form is open */}
                {!editing && (
                    <button type="button" onClick={onEdit} className={linkClass}>
                        Change
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}

// ---------- Main component ----------

function Profile() {
    const { user, updateName, reauth, changeEmail, changePassword } = useAuth();

    // ----- Form field state -----
    // (the username is stored as Firebase's displayName, hence user.displayName below)
    const [username, setUsername] = useState(user.displayName || "");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState(""); // used for email and password changes
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // ----- UI state -----
    const [submitting, setSubmitting] = useState(false);

    // Which section is currently open for editing: "username" | "email" | "password" | null
    const [editing, setEditing] = useState(null);

    // Highlight unmet password rules in red after a failed submit
    const [showRuleErrors, setShowRuleErrors] = useState(false);

    // Separate feedback messages for each section
    const [feedback, setFeedback] = useState({
        username: NO_FEEDBACK,
        email: NO_FEEDBACK,
        password: NO_FEEDBACK,
    });

    // ===== Shared helpers =====

    // Sets (or clears, when called with just the section) one section's banner
    const showFeedback = (section, error = "", success = "") =>
        setFeedback((prev) => ({ ...prev, [section]: { error, success } }));

    // Closes any open form and discards unsaved edits
    const closeForm = () => {
        setEditing(null);
        setUsername(user.displayName || "");
        setEmail("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setShowRuleErrors(false);
    };

    const openForm = (section) => {
        closeForm();
        showFeedback(section);
        setEditing(section);
    };

    const cancelForm = (section) => {
        closeForm();
        showFeedback(section);
    };

    // Runs a save action with the shared loading / error / success handling
    const submit = async (section, action, successMessage) => {
        showFeedback(section);
        setSubmitting(true);

        try {
            await action();
            closeForm();
            showFeedback(section, "", successMessage);
        } catch (err) {
            console.error("Profile error:", err.code, err);
            showFeedback(section, ERROR_MESSAGES[err.code] || DEFAULT_ERROR);
        } finally {
            setSubmitting(false);
        }
    };

    // ===== Username =====
    // (format and "already taken" checks happen inside updateName)

    const handleChangeUsername = (e) => {
        e.preventDefault();
        submit("username", () => updateName(username.trim()), "Username updated.");
    };

    // ===== Email =====
    // (the button is disabled until a different email is typed, and the inputs are `required`)

    const handleChangeEmail = (e) => {
        e.preventDefault();
        submit(
            "email",
            async () => {
                // Firebase requires a recent login before sensitive changes
                await reauth(currentPassword);
                await changeEmail(email);
            },
            `Verification link sent to ${email}. Your email changes after you click it.`
        );
    };

    // ===== Password =====

    const handleChangePassword = (e) => {
        e.preventDefault();
        showFeedback("password");
        setShowRuleErrors(false);

        // New password must meet all requirements
        if (!PASSWORD_REQUIREMENTS.every((req) => req.check(newPassword))) {
            setShowRuleErrors(true);
            showFeedback("password", "Password requirements not met. Please create a new one.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showFeedback("password", "Passwords do not match.");
            return;
        }

        if (newPassword === currentPassword) {
            showFeedback("password", "New password must be different from your current password.");
            return;
        }

        submit(
            "password",
            async () => {
                await reauth(currentPassword);
                await changePassword(newPassword);
            },
            "Password updated."
        );
    };

    // ---------- Render ----------

    return (
        <div className="w-full max-w-3xl bg-white/50 border border-pink-200 p-4 md:p-8 rounded-3xl shadow-lg flex flex-col gap-2">

            {/* Header */}
            <div className="border-b border-pink-300/50 pb-4">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#8c4362] tracking-wide">
                    Account Settings
                </h1>
                <p className="text-xs text-[#8c4362]/70 italic mt-0.5">
                    Edit your username, email and password.
                </p>
            </div>

            <div className="flex flex-col">

                {/* ===== Username ===== */}
                <Section
                    label="Username"
                    editing={editing === "username"}
                    onEdit={() => openForm("username")}
                >
                    {editing !== "username" ? (
                        <div className={valueClass}>{user.displayName || "Not set"}</div>
                    ) : (
                        <form onSubmit={handleChangeUsername} className="flex flex-col gap-3">
                            <input
                                type="text"
                                autoFocus
                                required
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={inputClass}
                            />

                            {/* Only warn if there is an existing username to give up */}
                            {user.displayName && (
                                <p className="text-xs text-[#8c4362]/80">
                                    Your old username will become available to others.
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button type="button" onClick={() => cancelForm("username")} className={cancelClass}>
                                    Cancel
                                </button>
                                <button disabled={submitting} className={saveClass}>
                                    Save username
                                </button>
                            </div>
                        </form>
                    )}
                    <Feedback {...feedback.username} />
                </Section>

                {/* ===== Email ===== */}
                <Section
                    label="Email address"
                    editing={editing === "email"}
                    onEdit={() => openForm("email")}
                    bordered
                >
                    {editing !== "email" ? (
                        <div className={valueClass}>{user.email}</div>
                    ) : (
                        <form onSubmit={handleChangeEmail} className="flex flex-col gap-3">
                            <p className="text-xs text-[#8c4362]/80">
                                A verification link will be sent to your new email.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="email"
                                    required
                                    placeholder="New email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    type="password"
                                    required
                                    placeholder="Current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => cancelForm("email")} className={cancelClass}>
                                    Cancel
                                </button>
                                {/* Disabled until a new, different email is typed */}
                                <button
                                    disabled={submitting || !email || email === user.email}
                                    className={saveClass}
                                >
                                    Change email
                                </button>
                            </div>
                        </form>
                    )}
                    <Feedback {...feedback.email} />
                </Section>

                {/* ===== Password ===== */}
                <Section
                    label="Password"
                    editing={editing === "password"}
                    onEdit={() => openForm("password")}
                    bordered
                >
                    {editing !== "password" ? (
                        <div className={`${valueClass} tracking-widest`}>••••••••••</div>
                    ) : (
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
                            <input
                                type="password"
                                required
                                placeholder="Current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className={inputClass}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="password"
                                    required
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    type="password"
                                    required
                                    placeholder="Confirm new password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            {/* Live checklist: green when met, red after a failed submit, muted otherwise */}
                            <ul className="text-xs flex flex-col gap-1">
                                {PASSWORD_REQUIREMENTS.map((req) => {
                                    const met = req.check(newPassword);
                                    return (
                                        <li
                                            key={req.text}
                                            className={
                                                met
                                                    ? "text-green-700 font-semibold"
                                                    : showRuleErrors
                                                        ? "text-red-700 font-semibold"
                                                        : "text-[#8c4362]/70"
                                            }
                                        >
                                            {met ? "✓" : "○"} {req.text}
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => cancelForm("password")} className={cancelClass}>
                                    Cancel
                                </button>
                                <button disabled={submitting} className={saveClass}>
                                    Change password
                                </button>
                            </div>
                        </form>
                    )}
                    <Feedback {...feedback.password} />
                </Section>

            </div>
        </div>
    );
}

export default Profile;