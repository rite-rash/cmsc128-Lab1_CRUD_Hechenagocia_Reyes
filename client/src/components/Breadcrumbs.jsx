// DESCRIPTION: reusable breadcrumb trail, e.g. Lists > Collaborative > Group project
// items: [{ label: "Lists", to: "/" }, { label: "Personal list" }]
// the last item is the current page (no link)
import { Link } from "react-router-dom";

function ChevronRight() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5 shrink-0 text-[#a5788b]"
        >
            <path d="M8 5l5 5-5 5" />
        </svg>
    );
}

function Breadcrumbs({ items = [] }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, i) => {
                    const isLast = i === items.length - 1;

                    return (
                        <li key={`${item.label}-${i}`} className="flex items-center gap-2">
                            {isLast || !item.to ? (
                                <span
                                    aria-current={isLast ? "page" : undefined}
                                    className="font-semibold text-[#3d1226]"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.to}
                                    className="font-medium text-[#a01450] hover:text-[#7a0f3d] hover:underline"
                                >
                                    {item.label}
                                </Link>
                            )}

                            {!isLast && <ChevronRight />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;