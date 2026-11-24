// DESCRIPTION: Layout wrapper with a top bar (menu, HIBI logo) and the page background
import logoImage from "../assets/logo.png";

function MenuIcon() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="w-6 h-6"
        >
            <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
    );
}

export function Logo() {
    return (
        <img
            src={logoImage}
            alt="HIBI logo"
            className="w-13 h-13 rounded-[10px] object-cover"
        />
    );
}

// onMenuClick is optional: pages without a sidebar (login, register) get no hamburger
function Layout({ children, onMenuClick, menuOpen = false }) {
    return (
        <div className="flex flex-col h-dvh text-gray-900 bg-[#fff0f5]">
            <header className="shrink-0 flex items-center justify-between gap-3 bg-white border-b border-pink-100 px-4 md:px-6 h-[72px]">
                <div className="flex items-center gap-3 md:gap-4">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                            className="p-2 -ml-2 rounded-lg text-[#7a0f3d] hover:bg-pink-50 cursor-pointer"
                        >
                            <MenuIcon />
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        <Logo />
                        <span className="font-serif text-2xl md:text-3xl font-extrabold tracking-[0.18em] text-[#a01450]">
                            HIBI
                        </span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center p-3 md:p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

export default Layout;