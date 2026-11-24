// DESCRIPTION: confirmation popup shown before logging out.
// Purely presentational: the parent owns the state and does the actual logout.
import { useEffect } from "react";
import { LogoutIcon } from "./Icons";

function LogoutDialog({ open, loggingOut = false, onConfirm, onCancel }) {
    // Escape closes the dialog (but not while the logout is in progress)
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape" && !loggingOut) onCancel();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, loggingOut, onCancel]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-[#3d0a22]/45 flex items-center justify-center z-[60] p-4"
            onClick={() => {
                if (!loggingOut) onCancel();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-title"
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 w-full max-w-sm flex flex-col gap-3"
            >
                <div className="w-10 h-10 rounded-full bg-pink-100 text-[#7a0f3d] flex items-center justify-center">
                    <LogoutIcon />
                </div>

                <h2 id="logout-title" className="font-serif text-[#7a0f3d] font-bold text-xl md:text-2xl">
                    Log out of HIBI?
                </h2>

                <p className="text-[#6b4a58] text-sm">
                    You’ll need to log in again to see your tasks. Anything you’ve already saved
                    will be here when you come back.
                </p>

                <div className="flex justify-end items-center gap-2 mt-2">
                    <button
                        onClick={onCancel}
                        disabled={loggingOut}
                        autoFocus
                        className="px-3 py-2 rounded-xl text-[#7a0f3d] hover:bg-pink-50 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Stay logged in
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loggingOut}
                        className="px-5 py-2.5 rounded-xl bg-[#c2185b] hover:bg-[#a8144d] text-white text-sm font-semibold shadow-md shadow-pink-300/50 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loggingOut ? "Logging out..." : "Log out"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LogoutDialog;