// DESCRIPTION: small shared inline icons (no extra dependency)

function Icon({ children, className = "w-5 h-5" }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 ${className}`}
        >
            {children}
        </svg>
    );
}

export const CloseIcon = () => (
    <Icon>
        <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
);

export const ListIcon = () => (
    <Icon>
        <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </Icon>
);

export const PeopleIcon = () => (
    <Icon>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3 19c.5-3 3-4.8 6-4.8s5.5 1.8 6 4.8" />
        <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.6c1.7.6 2.7 2 3 4.4" />
    </Icon>
);

export const UserIcon = () => (
    <Icon>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
    </Icon>
);

export const LogoutIcon = () => (
    <Icon>
        <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
    </Icon>
);

export const ChevronIcon = ({ up }) => (
    <Icon className="w-4 h-4">
        <path d={up ? "M6 15l6-6 6 6" : "M6 9l6 6 6-6"} />
    </Icon>
);