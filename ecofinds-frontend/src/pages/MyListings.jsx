import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import logo from "../assets/logo.jpg";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";

export default function MyListings() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [sortModalOpen, setSortModalOpen] = useState(false);

    const navigate = useNavigate();
    const categories = ["All", "Electronics", "Clothing", "Books", "Home", "Toys", "Sports", "Beauty"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userRes = await fetch("http://localhost:5174/api/auth/me", { credentials: "include" });
                if (!userRes.ok) return setUser(null);
                const userData = await userRes.json();
                setUser(userData);

                const productsRes = await fetch(`http://localhost:5174/api/products?seller_id=${userData.id}`, { credentials: "include" });
                if (!productsRes.ok) throw new Error("Failed to fetch products");
                const data = await productsRes.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching listings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];
        if (selectedCategory !== "All") filtered = filtered.filter((p) => p.category === selectedCategory);
        filtered.sort((a, b) => (sortOrder === "asc" ? a.price_cents - b.price_cents : b.price_cents - a.price_cents));
        return filtered;
    }, [products, selectedCategory, sortOrder]);

    if (loading) return <div className="text-white p-6 text-center text-lg">Loading...</div>;
    if (!user) return <div className="text-white p-6 text-center text-lg">You need to log in to see your listings.</div>;

    return (
        <div className="relative min-h-screen bg-neutral-900 text-white">
            <header className="relative bg-neutral-800/90 px-4 py-3 shadow-md flex items-center justify-between">
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
            </header>
            <div className="p-6 pt-16">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                    <h1 className="text-3xl font-bold">My Listings</h1>
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="hidden sm:block rounded-md px-3 py-2 bg-neutral-700 text-white"
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
                            className="hidden sm:block rounded-md px-3 py-2 bg-neutral-700 text-white"
                        >
                            <option value="asc">Price: Low to High</option>
                            <option value="desc">Price: High to Low</option>
                        </select>

                        <button
                            onClick={() => navigate("/add")}
                            className="bg-green-500 hover:bg-green-600 text-neutral-900 font-semibold px-5 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
                        >
                            + Add Product
                        </button>

                        <button
                            onClick={() => setFilterModalOpen(true)}
                            className="sm:hidden bg-white text-neutral-900 rounded-md px-4 py-2 font-medium shadow-sm"
                        >
                            Filter
                        </button>
                        <button
                            onClick={() => setSortModalOpen(true)}
                            className="sm:hidden bg-white text-neutral-900 rounded-md px-4 py-2 font-medium shadow-sm"
                        >
                            Sort
                        </button>
                    </div>
                </div>

                {filteredProducts.length === 0 ? (
                    <p className="text-white/70 text-center mt-10 text-lg">You have no listings.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-neutral-800 rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden"
                                onClick={() => navigate(`/product/${product.id}`)}
                            >
                                <ProductCard product={product} hideCartButton />
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
                        <h3 className="text-lg font-bold mb-3 text-white">Sort Listings</h3>
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
