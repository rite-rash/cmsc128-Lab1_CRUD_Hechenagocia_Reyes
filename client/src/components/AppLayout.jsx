import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Layout from "./Layout";

// ---------- Constants (defined once, outside the component) ----------

// Sidebar link styles; NavLink passes `isActive` for the current route
const linkClass = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
        isActive ? "bg-pink-500 text-white" : "text-pink-100 hover:bg-[#6e324c]"
    }`;

// ---------- Component ----------

function AppLayout() {
    const { user, logout } = useAuth();

    // Whether the slide-out menu is open
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <Layout>

            {/* ===== Top bar (always visible) ===== */}
            <div className="fixed top-0 left-0 right-0 h-12 z-40 flex items-center gap-3 px-4 bg-[#8c4362] shadow-md">
                <button
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                    className="text-white text-2xl leading-none cursor-pointer"
                >
                    ☰
                </button>
                <span className="text-white font-bold tracking-wide">My Todo App</span>
            </div>

            {/* ===== Sidebar (only rendered while open) ===== */}
            {sidebarOpen && (
                <>
                    {/* Dark overlay: clicking outside the menu closes it */}
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-black/50 z-20"
                    />

                    <aside className="fixed top-12 left-0 bottom-0 w-64 z-30 bg-[#8c4362] shadow-2xl flex flex-col gap-2 p-4">
                        {/* Who is logged in */}
                        <p className="px-4 pb-3 mb-2 text-sm font-bold text-white border-b border-pink-400/30 truncate">
                            {user.userName || user.email}
                        </p>

                        {/* `end` stops "/" from staying highlighted on other pages */}
                        <NavLink to="/" end onClick={closeSidebar} className={linkClass}>
                            To-do
                        </NavLink>
                        <NavLink to="/profile" onClick={closeSidebar} className={linkClass}>
                            Account
                        </NavLink>

                        <button
                            onClick={() => {
                                logout();
                                closeSidebar();
                            }}
                            className="mt-auto px-4 py-3 rounded-lg text-sm font-semibold text-pink-100 hover:bg-[#6e324c] text-left"
                        >
                            Log out
                        </button>
                    </aside>
                </>
            )}

            {/* ===== Page content (pt-12 leaves room for the fixed top bar) ===== */}
            <div className="w-full flex-1 flex flex-col items-center pt-12">
                <Outlet />
            </div>

        </Layout>
    );
}

export default AppLayout;