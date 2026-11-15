
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";

import Logo from "../ui/Logo.jsx";
import useAuth from "../../hooks/useAuth.js";
import { useProfile } from "../../hooks/useProfile.js";
import { photoUrl } from "../../utils/imageUtils.js";

import "./Header.css";

export function Header() {
    const { user, logout } = useAuth();
    const { profile } = useProfile();

    const [photoFailed, setPhotoFailed] = useState(false);

    const initials = (user?.fullName || "GZ")
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const profilePhoto = profile?.photos?.profilePhoto;
    const profilePhotoUrl = profilePhoto?.url
        ? photoUrl(profilePhoto.url, {
              width: 120,
              height: 120,
              face: true,
          })
        : null;

    // Reset the fallback when the profile photo changes.
    useEffect(() => {
        setPhotoFailed(false);
    }, [profilePhotoUrl]);

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
                            <span className="app-header__avatar">
                                {profilePhotoUrl && !photoFailed ? (
                                    <img
                                        src={profilePhotoUrl}
                                        alt=""
                                        onError={() => setPhotoFailed(true)}
                                    />
                                ) : (
                                    initials || "GZ"
                                )}
                            </span>

                            <span className="app-header__profile-info">
                                <span className="app-header__name">
                                    {user.fullName || "Member"}
                                </span>

                                <span className="app-header__profile-label">
                                    My account
                                </span>
                            </span>

                            <ChevronDown
                                className="app-header__chevron"
                                size={17}
                                strokeWidth={1.8}
                                aria-hidden="true"
                            />
                        </button>

                        <div className="app-header__dropdown">
                            <div className="app-header__dropdown-user">
                                <strong>
                                    {user.fullName || "Member"}
                                </strong>
                                <span>{user.email}</span>
                            </div>

                            <button
                                type="button"
                                className="app-header__logout"
                                onClick={logout}
                            >
                                <LogOut
                                    size={17}
                                    strokeWidth={1.8}
                                    aria-hidden="true"
                                />
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
