import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartIcon from "../assets/cart.png";
import profileIcon from "../assets/profile.png";
import logo from "../assets/logo.jpg";

function AddProductPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        seller_id: null,
        title: "",
        description: "",
        price_cents: "",
        category: "",
        quantity: "",
        condition: "",
        year_of_manufacture: "",
        brand: "",
        model: "",
        length: "",
        width: "",
        height: "",
        weight: "",
        material: "",
        color: "",
        original_packaging: false,
        manual_included: false,
        working_condition: ""
    });
    const [user, setUser] = useState(null);
    const categories = ["Electronics", "Clothing", "Books", "Home", "Toys", "Sports", "Beauty"];
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:5174/api/auth/me", { credentials: "include" });
                if (!res.ok) throw new Error("Failed to fetch user info");
                const data = await res.json();
                setUser(data);
                setForm((f) => ({ ...f, seller_id: data.id }));
            } catch (err) {
                console.error(err);
                alert("You must be logged in to add a product");
                navigate("/login");
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, [navigate]);

    if (loadingUser) return <div className="text-white p-6 text-center">Loading user info...</div>;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
        });

        if (file) formData.append("image", file);

        try {
            const res = await fetch("http://localhost:5174/api/products/addProduct", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            if (res.ok) navigate("/");
            else {
                const errorData = await res.json();
                alert("Error adding product: " + (errorData.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Error adding product");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
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


            <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 overflow-y-auto">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 text-center">
                    Add a New Product
                </h1>

                <form onSubmit={handleSubmit} className="w-full max-w-md bg-neutral-800 p-4 sm:p-6 rounded-2xl shadow-lg space-y-4 sm:space-y-6">

                    <div>
                        <label className="block font-semibold mb-2 text-white/80">Product Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600 cursor-pointer" />
                        {preview && <img src={preview} alt="preview" className="mt-2 w-full h-40 object-cover rounded-lg border border-white/30" />}
                    </div>


                    <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Product Title" required className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />


                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Product Description" rows="3" required className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <select name="category" value={form.category} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30">
                        <option value="" disabled>Select a category</option>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <input type="number" name="price_cents" value={form.price_cents} onChange={handleChange} placeholder="Price (₹)" min="0" required className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange} placeholder="Quantity" min="1" required className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />

                    <input type="text" name="condition" value={form.condition} onChange={handleChange} placeholder="Condition" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="number" name="year_of_manufacture" value={form.year_of_manufacture} onChange={handleChange} placeholder="Year of Manufacture" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="Brand" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="text" name="model" value={form.model} onChange={handleChange} placeholder="Model" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />

                    <div className="flex gap-2">
                        <input type="number" name="length" value={form.length} onChange={handleChange} placeholder="Length" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                        <input type="number" name="width" value={form.width} onChange={handleChange} placeholder="Width" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                        <input type="number" name="height" value={form.height} onChange={handleChange} placeholder="Height" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    </div>

                    <input type="number" name="weight" value={form.weight} onChange={handleChange} placeholder="Weight (kg)" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="text" name="material" value={form.material} onChange={handleChange} placeholder="Material" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />
                    <input type="text" name="color" value={form.color} onChange={handleChange} placeholder="Color" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />

                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="original_packaging" checked={form.original_packaging} onChange={handleChange} />
                        Original Packaging
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" name="manual_included" checked={form.manual_included} onChange={handleChange} />
                        Manual/Instructions Included
                    </label>

                    <textarea name="working_condition" value={form.working_condition} onChange={handleChange} placeholder="Working Condition Description" rows="2" className="w-full rounded-md px-3 py-2 text-white bg-neutral-900 border border-white/30" />

                    <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-neutral-900 font-bold py-2 rounded-xl">
                        Add Product
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddProductPage;
