import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import sideMenuIcon from "../assets/hamburger.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5174/api/auth/me", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to fetch user info");
                const data = await res.json();
                setUser(data);
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5174/api/auth/logout", {
                credentials: "include",
            });
            navigate("/login");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (!user)
        return <div className="text-white p-6 text-center">Loading user info...</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center p-6">
            {/* Side Menu Overlay */}
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            {/* Side Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-neutral-800 z-50 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-4 flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4">Menu</h2>
                    <button onClick={() => navigate("/")} className="mb-2 text-left">Home</button>
                    <button onClick={() => navigate("/add")} className="mb-2 text-left">Add Products</button>
                    <button onClick={() => navigate("/my-listings")} className="mb-2 text-left">My Listings</button>
                    <button onClick={() => navigate("/my-purchases")} className="mb-2 text-left">My Purchases</button>
                    <button onClick={() => navigate("/profile")} className="mb-2 text-left">Profile</button>
                    <button
                        className="mt-auto text-left text-red-400"
                        onClick={() => {
                            localStorage.clear();
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Header */}
            <header className="relative w-full bg-neutral-800/90 px-4 py-3 shadow-md flex items-center justify-between">
                <button onClick={() => setMenuOpen((s) => !s)} className="p-1">
                    <img src={sideMenuIcon} alt="menu" className="h-7 w-7 filter invert" />
                </button>

                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <img src={logo} alt="Logo" className="h-12" />
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/cart")} className="relative">
                        <img src={cartIcon} alt="cart" className="h-7 w-7 filter invert" />
                    </button>

                    <button onClick={() => navigate("/profile")}>
                        <img
                            src={user.pfp_url ? `http://localhost:5174${user.pfp_url}` : profileIcon}
                            alt="profile"
                            className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
                        />
                    </button>
                </div>
            </header>

            {/* User Info Section */}
            <div className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md flex flex-col items-center gap-4 shadow-md hover:shadow-lg transition-shadow duration-300 mt-6">
                <img
                    src={user.pfp_url ? `http://localhost:5174${user.pfp_url}` : "https://via.placeholder.com/150"}
                    alt="Profile"
                    className="h-24 w-24 rounded-full border-2 border-white/20 object-cover shadow-sm"
                />
                <h2 className="text-2xl font-bold">{user.username}</h2>
                <p className="text-white/70 text-center">{user.email}</p>

                <button
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition-all duration-200"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 w-full max-w-md flex flex-col gap-3">
                <button
                    className="w-full text-left bg-neutral-800 hover:bg-neutral-700 px-5 py-3 rounded-xl shadow-sm transition-all duration-200 font-medium"
                    onClick={() => navigate("/my-listings")}
                >
                    My Listings
                </button>
                <button
                    className="w-full text-left bg-neutral-800 hover:bg-neutral-700 px-5 py-3 rounded-xl shadow-sm transition-all duration-200 font-medium"
                    onClick={() => navigate("/my-purchases")}
                >
                    My Purchases
                </button>
            </div>
        </div>
    );
}
