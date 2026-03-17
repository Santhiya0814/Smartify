import React, { useEffect, useState } from 'react';
import { X, Trash2, Clock, CreditCard, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartItemRow = ({ item, onRemove }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const expiresAt = new Date(item.expires_at).getTime();
        const duration = 7 * 60 * 1000;

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = expiresAt - now;
            if (distance < 0) {
                setTimeLeft('Expired');
                setProgress(0);
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setProgress((distance / duration) * 100);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [item.expires_at]);

    return (
        <div className="py-4 border-b border-white/5 last:border-0">
            <div className="flex items-start gap-3">
                <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-white/10"
                />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-white truncate">{item.product?.name}</h4>
                    <p className="text-white/40 text-xs mt-0.5">${item.product?.price.toFixed(2)} × {item.quantity}</p>
                    <div className="flex items-center mt-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 inline-flex px-2 py-0.5 rounded-full gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{timeLeft}</span>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between self-stretch">
                    <span className="font-bold text-violet-300 text-sm">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                    <button onClick={() => onRemove(item.id)} className="text-white/20 hover:text-red-400 transition-colors p-1 mt-2">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* Timer bar */}
            <div className="w-full h-0.5 bg-white/5 mt-3 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 linear rounded-full ${progress < 25 ? 'bg-red-500' : 'bg-violet-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default function CartDrawer() {
    const { cartItems, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        document.getElementById('cart-drawer-toggle').checked = false;
        navigate('/checkout');
    };

    return (
        <>
            <input type="checkbox" id="cart-drawer-toggle" className="hidden peer" />

            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden peer-checked:block"
                onClick={() => document.getElementById('cart-drawer-toggle').checked = false}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-96 z-50 transform translate-x-full peer-checked:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col bg-[#0e0e1a] border-l border-white/5 shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-violet-400" />
                        Your Cart
                        <span className="bg-violet-500/20 text-violet-300 text-xs px-2 py-0.5 rounded-full border border-violet-500/30">
                            {cartItems.length}
                        </span>
                    </h2>
                    <label htmlFor="cart-drawer-toggle" className="cursor-pointer text-white/30 hover:text-white p-2 -mr-2 transition-colors">
                        <X className="w-5 h-5" />
                    </label>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                            <ShoppingBag className="w-14 h-14" />
                            <p className="text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {cartItems.map(item => (
                                <CartItemRow key={item.id} item={item} onRemove={removeFromCart} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="border-t border-white/5 px-6 py-6 bg-black/20">
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-white/50 text-sm">Subtotal</span>
                            <span className="text-2xl font-bold gradient-text">${getCartTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Proceed to Checkout
                        </button>
                        <p className="text-xs text-center text-white/20 mt-4 leading-relaxed">
                            Items reserved for 7 minutes. They'll be auto-released after that.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
