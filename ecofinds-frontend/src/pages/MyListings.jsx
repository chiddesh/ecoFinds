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
            {/* Header */}
            <header className="relative bg-neutral-800/90 px-4 py-3 shadow-md">
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

            {/* Page content */}
            <div className="p-6 pt-16">
                {/* Header + Add button */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Listings</h1>
                    <button
                        onClick={() => navigate("/add")}
                        className="bg-green-500 hover:bg-green-600 text-neutral-900 font-semibold px-5 py-2 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
                    >
                        + Add Product
                    </button>
                </div>

                {/* Product Listings */}
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
        </div>
    );
}
