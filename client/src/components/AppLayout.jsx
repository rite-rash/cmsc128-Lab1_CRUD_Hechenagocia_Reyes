import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Layout, { Logo } from "./Layout";
import LogoutDialog from "./LogoutDialog";
import { CloseIcon, ListIcon, PeopleIcon, UserIcon, LogoutIcon, ChevronIcon } from "./Icons";

// ---------- Style constants (defined once, outside the component) ----------

// Main sidebar links; NavLink passes `isActive` for the current route
const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
        isActive ? "bg-pink-100 text-[#7a0f3d]" : "text-[#3d1226] hover:bg-pink-50"
    }`;

// Links nested under "Collaborative lists"
const subLinkClass = ({ isActive }) =>
    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        isActive ? "bg-pink-100 text-[#7a0f3d] font-semibold" : "text-[#3d1226] hover:bg-pink-50"
    }`;

// ---------- Component ----------

function AppLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Whether the slide-out menu is open
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Collaborative dropdown starts open when you're already on a collab page
    const [collabOpen, setCollabOpen] = useState(() => location.pathname.startsWith("/collab"));

    // Log out confirmation dialog
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    // sidebar's Log out button: close the menu, then ask for confirmation
    const handleRequestLogout = () => {
        closeSidebar();
        setLogoutConfirmOpen(true);
    };

    const handleCancelLogout = () => {
        if (!loggingOut) setLogoutConfirmOpen(false);
    };

    const handleConfirmLogout = async () => {
        setLoggingOut(true);

        try {
            await logout();
        } catch (err) {
            console.error("Error logging out:", err);
        } finally {
            setLoggingOut(false);
            setLogoutConfirmOpen(false);
        }
    };

    // Escape closes the menu
    useEffect(() => {
        if (!sidebarOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") setSidebarOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [sidebarOpen]);

    const name = user.displayName || user.email;

    return (
        // The hamburger lives in Layout's top bar and calls toggleSidebar
        <Layout onMenuClick={toggleSidebar} menuOpen={sidebarOpen}>

            {/* ===== Sidebar (only rendered while open) ===== */}
            {sidebarOpen && (
                <>
                    {/* Dark overlay: clicking outside the menu closes it */}
                    <div
                        onClick={closeSidebar}
                        className="fixed inset-0 bg-[#3d0a22]/45 z-40"
                    />

                    {/* Full-height drawer that sits over the top bar */}
                    <aside
                        aria-label="Main menu"
                        className="fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] z-50 bg-white shadow-2xl flex flex-col"
                    >
                        {/* Drawer header: close button + logo */}
                        <div className="shrink-0 h-[72px] flex items-center gap-3 px-4 border-b border-pink-100">
                            <button
                                onClick={closeSidebar}
                                aria-label="Close menu"
                                className="p-2 -ml-2 rounded-lg text-[#7a0f3d] hover:bg-pink-50 cursor-pointer"
                            >
                                <CloseIcon />
                            </button>

                            <div className="flex items-center gap-3">
                                <Logo />
                                <span className="font-serif text-2xl font-extrabold tracking-[0.18em] text-[#a01450]">
                                    HIBI
                                </span>
                            </div>
                        </div>

                        {/* Who is logged in */}
                        <div className="shrink-0 flex items-center gap-3 px-5 py-5">
                            <div
                                aria-hidden="true"
                                className="w-10 h-10 shrink-0 rounded-full bg-[#f77fa8] text-[#7a0f3d] text-lg font-semibold uppercase flex items-center justify-center"
                            >
                                {name.charAt(0)}
                            </div>

                            <div className="min-w-0">
                                <p className="text-[15px] font-bold text-[#3d1226] truncate">{name}</p>
                                {user.displayName && user.email && (
                                    <p className="text-xs text-[#6b4a58] truncate">{user.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto flex flex-col gap-1 px-3">
                            {/* `end` stops "/" from staying highlighted on other pages */}
                            <NavLink to="/" end onClick={closeSidebar} className={linkClass}>
                                <ListIcon />
                                Personal list
                            </NavLink>

                            {/* expands; shows the two collaborative list screens */}
                            <button
                                onClick={() => setCollabOpen((prev) => !prev)}
                                aria-expanded={collabOpen}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-[#3d1226] hover:bg-pink-50 text-left cursor-pointer"
                            >
                                <PeopleIcon />
                                <span className="flex-1">Collaborative lists</span>
                                <ChevronIcon up={collabOpen} />
                            </button>

                            {collabOpen && (
                                // indent so the sub-links line up under the label
                                <div className="flex flex-col gap-1 ml-11">
                                    <NavLink to="/collab/owned" onClick={closeSidebar} className={subLinkClass}>
                                        Owned by me
                                    </NavLink>

                                    <NavLink to="/collab/shared" onClick={closeSidebar} className={subLinkClass}>
                                        Shared with me
                                    </NavLink>
                                </div>
                            )}

                            <NavLink to="/profile" onClick={closeSidebar} className={linkClass}>
                                <UserIcon />
                                Account
                            </NavLink>
                        </nav>

                        {/* Log out pinned to the bottom */}
                        <div className="shrink-0 border-t border-pink-100 p-3">
                            <button
                                onClick={handleRequestLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-[#3d1226] hover:bg-pink-50 text-left cursor-pointer"
                            >
                                <LogoutIcon />
                                Log out
                            </button>
                        </div>
                    </aside>
                </>
            )}

            {/* ===== Log out confirmation ===== */}
            <LogoutDialog
                open={logoutConfirmOpen}
                loggingOut={loggingOut}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />

            {/* ===== Page content ===== */}
            <div className="w-full flex-1 flex flex-col items-center">
                <Outlet />
            </div>

        </Layout>
    );
}

export default AppLayout;