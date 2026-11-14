
import { Link } from "react-router-dom";
import Logo from "../ui/Logo.jsx";
import useAuth from "../../hooks/useAuth.js";
import "./Header.css";

export function Header() {
    const { user, logout } = useAuth();

    const initials = (user?.fullName || "GZ")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <header className="app-header">
            <Link to="/app" className="app-header__brand">
                <Logo size="lg" />
            </Link>

            <div className="app-header__actions">
                {user ? (
                    <div className="app-header__profile">
                        <button
                            type="button"
                            className="app-header__user"
                            aria-label="Account options"
                        >
                            <span
                                className="app-header__avatar"
                                aria-hidden="true"
                            >
                                {initials || "GZ"}
                            </span>

                            <span className="app-header__profile-info">
                                <span className="app-header__name">
                                    {user.fullName || "Member"}
                                </span>
                                <span className="app-header__profile-label">
                                    My account
                                </span>
                            </span>

                            <svg
                                className="app-header__chevron"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="m7 10 5 5 5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        <div className="app-header__dropdown">
                            <div className="app-header__dropdown-user">
                                <strong>{user.fullName || "Member"}</strong>
                                <span>{user.email}</span>
                            </div>

                            <button
                                type="button"
                                className="app-header__logout"
                                onClick={logout}
                            >
                                <svg
                                    width="17"
                                    height="17"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M10 17l5-5-5-5M15 12H3m9-8h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                Log out
                            </button>
                        </div>
                    </div>
                ) : (
                    <span className="app-header__name">Guest</span>
                )}
            </div>
        </header>
    );
}

export default Header;
