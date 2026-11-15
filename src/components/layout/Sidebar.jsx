
import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Compass,
    Heart,
    Star,
    MessageCircle,
    UserRound,
    Settings,
} from "lucide-react";

import "./Sidebar.css";

const NAV_ITEMS = [
    {
        label: "Discover",
        path: "/app",
        icon: Compass,
        end: true,
    },
    {
        label: "Matches",
        path: "/app/matches",
        icon: Heart,
    },
    {
        label: "Interests",
        path: "/app/interests",
        icon: Star,
    },
    {
        label: "Messages",
        path: "/app/messages",
        icon: MessageCircle,
    },
    {
        label: "My Profile",
        path: "/my-profile",
        icon: UserRound,
    },
    {
        label: "Settings",
        path: "/app/settings",
        icon: Settings,
    },
];

export function Sidebar() {
    const location = useLocation();
    const sidebarRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
        }

        const centerActiveItem = () => {
            if (window.innerWidth > 900) return;

            const activeItem = sidebar.querySelector(
                ".sidebar__item.is-active"
            );

            if (!activeItem) return;

            const sidebarRect = sidebar.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            const targetLeft =
                sidebar.scrollLeft +
                itemRect.left -
                sidebarRect.left +
                itemRect.width / 2 -
                sidebar.clientWidth / 2;

            sidebar.scrollTo({
                left: Math.max(
                    0,
                    Math.min(
                        targetLeft,
                        sidebar.scrollWidth - sidebar.clientWidth
                    )
                ),
                behavior: "smooth",
            });
        };

        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = requestAnimationFrame(centerActiveItem);
        });

        const observer = new ResizeObserver(centerActiveItem);
        observer.observe(sidebar);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }

            observer.disconnect();
        };
    }, [location.pathname]);

    return (
        <aside className="sidebar" ref={sidebarRef}>
            <div className="sidebar__heading">
                <span>MENU</span>
            </div>

            <nav aria-label="Primary navigation">
                <ul className="sidebar__list">
                    {NAV_ITEMS.map(({ label, path, icon: Icon, end }) => (
                        <li key={path}>
                            <NavLink
                                to={path}
                                end={end}
                                className={({ isActive }) =>
                                    `sidebar__item ${
                                        isActive ? "is-active" : ""
                                    }`.trim()
                                }
                            >
                                <Icon
                                    className="sidebar__icon"
                                    size={18}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />

                                <span>{label}</span>

                                <span className="sidebar__active-indicator" />
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
