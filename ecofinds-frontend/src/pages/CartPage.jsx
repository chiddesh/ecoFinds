import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.jpg";
import sideMenuIcon from "../assets/hamburger.png";

export default function CartPage() {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const formattedCart = storedCart.map(item => ({
            ...item,
            price_cents: Number(item.price_cents),
            quantity: item.quantity || 1
        }));
        setCart(formattedCart);
    }, []);

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
                console.error(err);
            }
        };
        fetchUser();
    }, []);

    const removeFromCart = (index) => {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const updateQuantity = (index, delta) => {
        const updatedCart = [...cart];
        const newQty = (updatedCart[index].quantity || 1) + delta;
        if (newQty < 1) return;
        updatedCart[index].quantity = newQty;
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
    };

    const totalPrice = cart.reduce(
        (acc, item) => acc + item.price_cents * (item.quantity || 1),
        0
    );

    const placeOrder = async () => {
        if (!address.trim()) {
            alert("Please enter your shipping address.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5174/api/orders/place", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address, paymentMethod, cart }),
            });
            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setOrderDetails(cart);
                setOrderPlaced(true);
                localStorage.removeItem("cart");
                setCart([]);
                setShowCheckout(false);
            } else {
                alert("Failed to place order: " + data.error);
            }
        } catch (err) {
            setLoading(false);
            console.error(err);
            alert("Failed to place order");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-neutral-800 z-50 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="p-4 flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4">Menu</h2>
                    <button onClick={() => navigate("/")} className="mb-2 text-left">Home</button>
                    <button onClick={() => navigate("/profile")} className="mb-2 text-left">Profile</button>
                    <button
                        onClick={() => navigate("/my-listings")}
                        className="mb-2 text-left"
                    >
                        My Listings
                    </button>
                    <button
                        onClick={() => navigate("/my-purchases")}
                        className="mb-2 text-left"
                    >
                        My Purchases
                    </button>
                    <button className="mt-auto text-left text-red-400" onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
                </div>
            </div>

            <header className="relative bg-neutral-800/90 px-4 py-3 shadow-md">
                <div className="flex items-center justify-between">
                    <button onClick={() => setMenuOpen((s) => !s)} className="p-1">
                        <img src={sideMenuIcon} alt="menu" className="h-7 w-7 filter invert" />
                    </button>

                    <div className="absolute left-1/2 top-3 transform -translate-x-1/2">
                        <img src={logo} alt="logo" className="h-10" />
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate("/cart")} className="relative">
                            <img src={cartIcon} alt="cart" className="h-7 w-7 filter invert" />
                            {cart.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />}
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

            <div className="flex-1 p-6 flex flex-col">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Cart</h1>

                {orderPlaced ? (
                    <div className="flex flex-col gap-4 bg-neutral-800 p-6 rounded-2xl shadow-lg">
                        <div>
                            <div className="font-semibold mb-1">Shipping Address:</div>
                            <div className="text-white/80">{address}</div>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">Payment Method:</div>
                            <div className="text-white/80">{paymentMethod}</div>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">Products Ordered:</div>
                            <div className="flex flex-col gap-3 mt-2">
                                {orderDetails.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center bg-neutral-700 p-3 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {item.image && <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg" />}
                                            <span className="text-white">{item.title} x {item.quantity}</span>
                                        </div>
                                        <span className="font-semibold text-green-400">₹{item.price_cents * item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button onClick={() => navigate("/")} className="mt-6 w-full bg-green-500 py-3 rounded-xl font-bold hover:bg-green-600 transition">
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 flex flex-col gap-4 mb-6">
                            {cart.length === 0 ? (
                                <div className="text-center text-white/70 mt-10 text-lg">Your cart is empty.</div>
                            ) : (
                                cart.map((item, index) => (
                                    <div key={index} className="bg-neutral-800 p-4 rounded-2xl flex justify-between items-center shadow-md hover:shadow-lg transition">
                                        <div>
                                            <h2 className="font-semibold text-lg">{item.title}</h2>
                                            <p className="text-green-400 font-semibold">₹{item.price_cents} x {item.quantity}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => updateQuantity(index, -1)} className="bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition">-</button>
                                                <span className="px-2">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(index, 1)} className="bg-gray-700 px-3 py-1 rounded-lg hover:bg-gray-600 transition">+</button>
                                            </div>
                                        </div>
                                        <button onClick={() => removeFromCart(index)} className="bg-red-500 px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">Remove</button>
                                    </div>
                                ))
                            )}
                        </div>
                        {cart.length > 0 && (
                            <div className="mt-auto flex flex-col gap-3">
                                <div className="text-right text-lg font-bold text-green-400 mb-2">Total: ₹{totalPrice}</div>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <button className="flex-1 bg-green-500 py-3 rounded-xl font-bold hover:bg-green-600 transition" onClick={() => setShowCheckout(true)}>Checkout</button>
                                    <button onClick={() => navigate("/")} className="flex-1 bg-green-500 hover:bg-green-600 text-neutral-900 font-bold py-3 rounded-2xl shadow-lg transition-all duration-200">Back to Home</button>
                                </div>
                            </div>
                        )}

                        {showCheckout && (
                            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                                <div className="bg-neutral-800 rounded-2xl p-6 w-80 shadow-lg">
                                    <h2 className="text-2xl font-bold mb-4 text-center">Checkout</h2>

                                    <div className="mb-4">
                                        <label className="block mb-1 font-semibold">Shipping Address:</label>
                                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-1 font-semibold">Payment Method:</label>
                                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="COD">Cash on Delivery</option>
                                            <option value="Card">Card</option>
                                            <option value="NetBanking">NetBanking</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={placeOrder} className="flex-1 bg-green-500 py-2 rounded-xl font-bold hover:bg-green-600 transition" disabled={loading}>{loading ? "Placing Order..." : "Place Order"}</button>
                                        <button onClick={() => setShowCheckout(false)} className="flex-1 bg-red-500 py-2 rounded-xl font-bold hover:bg-red-600 transition" disabled={loading}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
