import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            await addToCart(product.id, 1);
            document.getElementById('cart-drawer-toggle').checked = true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Could not add to cart. ' + error.message);
        }
    };

    return (
        <div className="glass rounded-2xl overflow-hidden group hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-900/20 flex flex-col">
            {/* Image */}
            <div className="relative h-52 overflow-hidden bg-white/5">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {product.stock === 0 ? (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-red-400 font-semibold text-sm border border-red-400/30 px-3 py-1 rounded-full bg-red-900/20">
                            Out of Stock
                        </span>
                    </div>
                ) : product.stock <= 20 && (
                    <div className="absolute top-3 left-3">
                        <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold px-2 py-1 rounded-full">
                            Only {product.stock} left
                        </span>
                    </div>
                )}

                {/* Quick add overlay */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex items-center space-x-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-lg shadow-violet-900/50 transition-all"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                        {product.name}
                    </h3>
                    <span className="text-violet-400 font-bold text-base whitespace-nowrap">
                        ${product.price.toFixed(2)}
                    </span>
                </div>

                <p className="text-xs text-white/40 line-clamp-2 mb-4 flex-grow">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3" fill={i < 4 ? 'currentColor' : 'none'} />
                        ))}
                        <span className="text-white/30 text-xs ml-1">(4.0)</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex items-center space-x-1.5 bg-white/5 hover:bg-violet-600/20 hover:border-violet-500/50 border border-white/10 text-white/70 hover:text-violet-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
