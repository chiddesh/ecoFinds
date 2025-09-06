import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.jpg";
import toast from "react-hot-toast";   // <-- Add this import

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5174/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => {
                const images = (data.images || [data.image_url]).map(
                    (img) => `http://localhost:5174${img}`
                );
                setProduct({ ...data, images });
            })
            .catch((err) => console.error("Error fetching product:", err));
    }, [id]);

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

    const addToCart = () => {
        const existingIndex = cartItems.findIndex(item => item.id === product.id);

        let updatedCart;
        if (existingIndex !== -1) {
            // Product already in cart → increase quantity
            updatedCart = [...cartItems];
            updatedCart[existingIndex].quantity = (updatedCart[existingIndex].quantity || 1) + 1;
        } else {
            // New product → add with quantity = 1
            updatedCart = [...cartItems, { ...product, quantity: 1 }];
        }

        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success(`${product.title} added to cart!`);
    };
    if (!product) return <div className="text-white p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white pb-24">
            {/* Header */}
            <header className="relative bg-neutral-800 px-4 py-3 shadow-md">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-green-400 font-semibold hover:text-green-500"
                    >
                        Back
                    </button>
                    <div className="absolute left-1/2 top-3 transform -translate-x-1/2">
                        <img src={logo} alt="logo" className="h-10" />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="relative"
                            onClick={() => navigate("/cart")}
                        >
                            <img
                                src={cartIcon}
                                alt="cart"
                                className="h-7 w-7 filter invert"
                            />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                            )}
                        </button>
                        <button onClick={() => navigate("/profile")}>
                            <img
                                src={
                                    user?.pfp_url
                                        ? `http://localhost:5174${user.pfp_url}`
                                        : profileIcon
                                }
                                alt="profile"
                                className="h-8 w-8 rounded-full border-2 border-white/20 object-cover"
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* Product */}
            <main className="p-4 max-w-4xl mx-auto space-y-6">
                {/* Main Image */}
                <div className="w-full bg-neutral-800 rounded-2xl h-80 sm:h-96 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                    <img
                        src={product.images[mainImageIndex] || "/placeholder.png"}
                        alt={product.title}
                        className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Thumbnail Images */}
                <div className="flex justify-center gap-2 overflow-x-auto mt-2">
                    {product.images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt={`thumbnail-${i}`}
                            className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${i === mainImageIndex
                                ? "border-green-500"
                                : "border-transparent"
                                }`}
                            onClick={() => setMainImageIndex(i)}
                        />
                    ))}
                </div>

                {/* Details */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">{product.title}</h1>
                    <p className="text-green-400 font-bold text-2xl">
                        ₹{product.price_cents}
                    </p>
                    <div className="text-white/80 space-y-1">
                        <div>
                            <strong>Category:</strong>{" "}
                            {product.category || "N/A"}
                        </div>
                        <div>
                            <strong>Description:</strong>
                        </div>
                        <p className="mt-1">
                            {product.description || "No description available."}
                        </p>
                    </div>
                </div>
            </main>

            {/* Add to Cart */}
            <div className="fixed left-0 right-0 bottom-0 p-4 bg-neutral-900/95 border-t border-white/5 shadow-lg sm:static sm:mx-auto sm:mt-6 sm:rounded-xl sm:max-w-3xl">
                <div className="flex gap-4 items-center">
                    <div className="flex-1 space-y-1">
                        <div className="text-white/70 text-sm">Total</div>
                        <div className="text-xl font-semibold">
                            ₹{product.price_cents}
                        </div>
                    </div>
                    <button
                        onClick={addToCart}
                        className="bg-green-500 hover:bg-green-600 text-neutral-900 font-bold px-6 py-3 rounded-2xl shadow-lg transition-transform duration-200 hover:scale-105"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
