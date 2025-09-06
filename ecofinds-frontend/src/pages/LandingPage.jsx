import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import sideMenuIcon from "../assets/hamburger.png";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.jpg";
import banner from "../assets/banner.jpg";

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [sortModalOpen, setSortModalOpen] = useState(false);

    const getImageUrl = (path) => path ? `http://localhost:5174${path}` : null;


    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchQuery, setSearchQuery] = useState("");
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const categories = [
        "All",
        "Electronics",
        "Clothing",
        "Books",
        "Home",
        "Toys",
        "Sports",
        "Beauty",
    ];

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

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost:5174/api/products", {
                    credentials: "include",
                });
                const data = await res.json();

                const mapped = data.map((p) => ({
                    ...p,
                    displayImage:
                        p.images && p.images.length > 0 ? getImageUrl(p.images[0]) : null
                }));

                setProducts(mapped);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        if (selectedCategory !== "All") {
            filtered = filtered.filter((p) => p.category === selectedCategory);
        }

        if (searchQuery) {
            filtered = filtered.filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            if (sortOrder === "asc") return a.price_cents - b.price_cents;
            return b.price_cents - a.price_cents;
        });

        return filtered;
    }, [products, selectedCategory, sortOrder, searchQuery]);

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
            {menuOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-neutral-800 z-50 transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-4 flex flex-col h-full">
                    <h2 className="text-xl font-bold mb-4">Menu</h2>
                    <button onClick={() => navigate("/")} className="mb-2 text-left">
                        Home
                    </button>
                    <button onClick={() => navigate("/add")} className="mb-2 text-left">
                        Add Products
                    </button>
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
                    <button onClick={() => navigate("/profile")} className="mb-2 text-left">
                        Profile
                    </button>
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

                <div className="mt-3 flex flex-col md:flex-row gap-2 px-2 items-center">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 rounded-lg px-4 py-2 text-white placeholder-neutral-600
               border-2 border-green-500 focus:border-green-400 focus:ring-2 focus:ring-green-400 outline-none transition"
                    />


                    <div className="hidden md:flex gap-2 items-center ml-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="rounded-md px-3 py-2 bg-neutral-700 text-white"
                        >
                            {categories.map((c) => (
                                <option key={c} value={c} className="bg-neutral-700 text-white">
                                    {c}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="rounded-md px-3 py-2 bg-neutral-700 text-white"
                        >
                            <option value="asc" className="bg-neutral-700 text-white">
                                Price: Low to High
                            </option>
                            <option value="desc" className="bg-neutral-700 text-white">
                                Price: High to Low
                            </option>
                        </select>

                        <button
                            onClick={() => navigate("/add")}
                            className="bg-green-500 hover:bg-green-600 text-neutral-900 font-medium px-4 py-2 rounded-md shadow-sm transition"
                        >
                            Add Product
                        </button>
                    </div>

                    <div className="md:hidden flex gap-2 mt-2">
                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="flex-1 bg-white text-neutral-900 rounded-md px-4 py-2 font-medium shadow-sm"
                        >
                            Filter
                        </button>
                        <button
                            onClick={() => setSortModalOpen(true)}
                            className="flex-1 bg-white text-neutral-900 rounded-md px-4 py-2 font-medium shadow-sm"
                        >
                            Sort
                        </button>
                    </div>
                </div>
            </header>
            <section className="relative w-full mt-4 sm:mt-6 px-4 sm:px-6 md:px-8">
                <div className="w-full overflow-hidden rounded-lg border bg-white border-white/10">
                    <img
                        src={banner}
                        alt="EcoFinds Banner"
                        className="w-full h-auto max-h-[32rem] md:max-h-[28rem] lg:max-h-[32rem] object-contain"
                    />
                </div>
            </section>

            <main className="p-4 flex-1 overflow-auto">
                <h2 className="text-lg font-semibold mb-3">Products</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            image={p.displayImage}
                            onClick={() => navigate(`/product/${p.id}`)}
                            onAddToCart={() => handleAddToCart(p)}
                        />
                    ))}
                </div>
            </main>

            {filterModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-neutral-800 rounded-lg p-4 w-80">
                        <h3 className="text-lg font-bold mb-3 text-white">Filter by Category</h3>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`block w-full text-left mb-2 p-2 rounded ${selectedCategory === cat
                                    ? "bg-green-500 text-neutral-900"
                                    : "bg-neutral-700 text-white"
                                    }`}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setFilterModalOpen(false);
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                        <button
                            className="mt-2 w-full bg-red-500 rounded p-2 text-white"
                            onClick={() => setFilterModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {sortModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
                    <div className="bg-neutral-800 rounded-lg p-4 w-80">
                        <h3 className="text-lg font-bold mb-3 text-white">Sort Products</h3>
                        <button
                            className={`block w-full text-left mb-2 p-2 rounded ${sortOrder === "asc"
                                ? "bg-green-500 text-neutral-900"
                                : "bg-neutral-700 text-white"
                                }`}
                            onClick={() => {
                                setSortOrder("asc");
                                setSortModalOpen(false);
                            }}
                        >
                            Price: Low to High
                        </button>
                        <button
                            className={`block w-full text-left mb-2 p-2 rounded ${sortOrder === "desc"
                                ? "bg-green-500 text-neutral-900"
                                : "bg-neutral-700 text-white"
                                }`}
                            onClick={() => {
                                setSortOrder("desc");
                                setSortModalOpen(false);
                            }}
                        >
                            Price: High to Low
                        </button>
                        <button
                            className="mt-2 w-full bg-red-500 rounded p-2 text-white"
                            onClick={() => setSortModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
