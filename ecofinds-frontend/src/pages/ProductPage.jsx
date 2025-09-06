import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.jpg";
import toast from "react-hot-toast";

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
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:5174/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                const images = (data.images || [data.image_url]).map(img => `http://localhost:5174${img}`);
                setProduct({ ...data, images });
            })
            .catch(err => console.error("Error fetching product:", err));
    }, [id]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5174/api/auth/me", { credentials: "include" });
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
            updatedCart = [...cartItems];
            updatedCart[existingIndex].quantity += quantity;
        } else {
            updatedCart = [...cartItems, { ...product, quantity }];
        }
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success(`${product.title} added to cart!`);
    };

    if (!product) return <div className="text-white p-6 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            <header className="bg-neutral-800 px-4 py-3 shadow-md flex items-center justify-between relative">
                <button onClick={() => navigate(-1)} className="text-green-400 font-semibold hover:text-green-500">
                    Back
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <img src={logo} alt="logo" className="h-10 sm:h-12" />
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/cart")} className="relative">
                        <img src={cartIcon} alt="cart" className="h-7 w-7 sm:h-8 sm:w-8 filter invert" />
                        {cartItems.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full sm:w-4 sm:h-4" />}
                    </button>
                    <button onClick={() => navigate("/profile")}>
                        <img
                            src={user?.pfp_url ? `http://localhost:5174${user.pfp_url}` : profileIcon}
                            alt="profile"
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white/20 object-cover"
                        />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 bg-neutral-800 rounded-2xl h-80 sm:h-96 lg:h-auto flex flex-col items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                        <img
                            src={product.images[mainImageIndex] || "/placeholder.png"}
                            alt={product.title}
                            className="max-h-full object-contain transition-transform duration-300 hover:scale-105"
                        />
                        <div className="flex lg:hidden gap-2 overflow-x-auto mt-4 py-1">
                            {product.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`thumbnail-${i}`}
                                    className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer border-2 ${i === mainImageIndex ? "border-green-500" : "border-transparent"}`}
                                    onClick={() => setMainImageIndex(i)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h1 className="text-2xl sm:text-3xl font-bold">{product.title}</h1>
                            <p className="text-white/70 text-sm sm:text-base">{product.description || "No description available."}</p>


                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm sm:text-base text-white/90 bg-neutral-800 p-4 rounded-xl shadow-lg border border-white/10">
                                {[
                                    ["Category", product.category],
                                    ["Condition", product.condition],
                                    ["Quantity", product.quantity ?? "N/A"],
                                    ["Year", product.year_of_manufacture],
                                    ["Brand", product.brand],
                                    ["Model", product.model],
                                    ["Dimensions", product.dimensions],
                                    ["Weight", product.weight ? `${product.weight} kg` : "N/A"],
                                    ["Material", product.material],
                                    ["Color", product.color],
                                    ["Packaging", product.original_packaging ? "Yes" : "No"],
                                    ["Manual", product.manual_included ? "Yes" : "No"]
                                ].map(([key, val], idx) => (
                                    <div key={idx}>
                                        <dt className="font-medium text-white">{key}</dt>
                                        <dd>{val || "N/A"}</dd>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-neutral-800 p-4 rounded-xl shadow-lg border border-white/10 mt-4">
                                <dt className="font-medium text-white">Working Condition</dt>
                                <dd className="text-white/80 mt-1 text-sm sm:text-base">{product.working_condition_description || "N/A"}</dd>
                            </div>

                            <div className="hidden lg:flex gap-2 overflow-x-auto mt-2">
                                {product.images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        alt={`thumbnail-${i}`}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg cursor-pointer border-2 ${i === mainImageIndex ? "border-green-500" : "border-transparent"}`}
                                        onClick={() => setMainImageIndex(i)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 lg:mt-6 flex items-center justify-between bg-neutral-800 p-4 rounded-xl shadow-lg border border-white/10 sticky bottom-0 z-10 gap-3">
                            <div className="flex flex-col">
                                <div className="text-white/70 text-sm sm:text-base">Total</div>
                                <div className="text-xl sm:text-2xl font-semibold">₹{product.price_cents * quantity}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded-lg"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                >-</button>
                                <span className="px-3 py-1">{quantity}</span>
                                <button
                                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded-lg"
                                    onClick={() => setQuantity(q => q + 1)}
                                >+</button>
                            </div>

                            <button
                                onClick={addToCart}
                                className="bg-green-500 hover:bg-green-600 text-neutral-900 font-bold px-6 py-3 rounded-2xl shadow-lg transition-transform duration-200 hover:scale-105 w-full sm:w-auto"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
