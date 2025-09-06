import React from "react";

export default function ProductCard({ product, onClick }) {
    return (
        <div
            className="bg-neutral-800 rounded-lg overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-200"
            onClick={onClick}
        >
            {product.image_url && (
                <img
                    src={product.image_url ? `http://localhost:5174${product.image_url}` : "/placeholder.png"}
                    alt={product.title}
                    className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-contain bg-neutral-900"
                />
            )}
            <div className="p-3">
                <h3 className="font-semibold text-white text-sm sm:text-base md:text-lg">{product.title}</h3>
                <p className="text-white/70 text-xs sm:text-sm">{product.category}</p>
                <p className="font-bold text-white text-sm sm:text-base">₹{product.price_cents}</p>
            </div>
        </div>
    );
}
