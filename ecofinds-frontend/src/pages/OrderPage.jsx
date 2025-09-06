import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndOrders = async () => {
            try {
                const userRes = await fetch("http://localhost:5174/api/auth/me", { credentials: "include" });
                if (!userRes.ok) throw new Error("Not logged in");
                const userData = await userRes.json();
                setUser(userData);

                const res = await fetch("http://localhost:5174/api/orders/my", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch orders");
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
                alert("Failed to fetch your orders");
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndOrders();
    }, []);

    if (loading) return <div className="text-white p-6 text-center">Loading orders...</div>;
    if (!user) return <div className="text-white p-6 text-center">You need to log in to see your orders.</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 relative overflow-y-auto">
            <header className="relative bg-neutral-800/90 px-4 py-3 shadow-md mb-4">
                <div className="flex items-center justify-between">
                    <button onClick={() => navigate("/")} className="p-1">
                        <img src={logo} alt="logo" className="h-10" />
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/cart")} className="relative">
                            <img src={cartIcon} alt="cart" className="h-7 w-7 filter invert" />
                        </button>
                        <button onClick={() => navigate("/profile")}>
                            <img
                                src={user?.pfp_url ? `http://localhost:5174${user.pfp_url}` : profileIcon}
                                alt="profile"
                                className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
                            />
                        </button>
                    </div>
                </div>
            </header>

            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">
                My Purchases
            </h1>

            {orders.length === 0 ? (
                <p className="text-white/70 text-center mt-10 text-lg">
                    You have no orders.
                </p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-neutral-800 p-3 sm:p-4 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3">
                            <span className="font-semibold text-green-400 text-sm sm:text-base">
                                Order ID: {order.id}
                            </span>
                            <span className="font-bold text-base sm:text-lg mt-1 sm:mt-0">
                                Total: ₹{order.total_cents}
                            </span>
                        </div>

                        <div className="mb-2 text-sm sm:text-base">
                            <span className="font-medium text-white/80">Shipping Address:</span>{" "}
                            {order.shipping_address}
                        </div>

                        <div className="mb-3 text-sm sm:text-base">
                            <span className="font-medium text-white/80">Payment Method:</span>{" "}
                            {order.payment_method}
                        </div>

                        <div className="flex flex-col gap-2">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center bg-neutral-700 p-2 sm:p-3 rounded-lg shadow-sm hover:bg-neutral-700/90 transition"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base">
                                        <span className="font-medium">{item.title} x {item.quantity}</span>
                                    </div>
                                    <span className="font-semibold text-green-400 text-sm sm:text-base">
                                        ₹{item.price_cents * item.quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
