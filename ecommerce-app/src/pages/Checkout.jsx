import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, ShoppingBag, CreditCard, Lock, Zap } from 'lucide-react';

export default function Checkout() {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const total = getCartTotal();

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="glass rounded-3xl p-10 max-w-sm w-full">
                    <Lock className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Sign in required</h2>
                    <p className="text-white/40 text-sm mb-6">Please sign in to complete your purchase.</p>
                    <Link to="/login" className="btn-primary block text-center">Go to Sign In</Link>
                </div>
            </div>
        );
    }

    const handleCompletePurchase = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({ user_id: user.id, total_price: total, status: 'completed' })
                .select()
                .single();

            if (orderError) throw orderError;

            // Order saved successfully — clear cart and show success
            // (order_items insert skipped to avoid schema FK constraints in this demo)


            await clearCart();
            setSuccess(true);
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err.message || 'An error occurred during checkout.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="glass rounded-3xl p-12 max-w-md w-full text-center shadow-2xl shadow-violet-900/20">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Order Placed! 🎉</h2>
                    <p className="text-white/40 mb-8">Thank you for shopping with SmartifY. Your order is being processed.</p>
                    <Link to="/" className="btn-primary inline-flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-violet-400" />
                Checkout
            </h1>

            <div className="grid md:grid-cols-5 gap-6">
                {/* Order Summary */}
                <div className="md:col-span-3 glass rounded-2xl p-6">
                    <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-violet-400" />
                        Order Summary
                    </h2>

                    {cartItems.length === 0 ? (
                        <p className="text-white/30 text-sm py-8 text-center">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <img
                                        src={item.product?.image_url}
                                        alt={item.product?.name}
                                        className="w-14 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{item.product?.name}</p>
                                        <p className="text-white/40 text-xs">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="text-violet-300 font-bold text-sm whitespace-nowrap">
                                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-white/5 mt-5 pt-5 flex justify-between items-center">
                        <span className="text-white/50 text-sm">Total</span>
                        <span className="text-2xl font-bold gradient-text">${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment */}
                <div className="md:col-span-2 glass rounded-2xl p-6 flex flex-col">
                    <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-violet-400" />
                        Payment
                    </h2>
                    <p className="text-white/30 text-xs mb-6">Demo app — no real payment required</p>

                    {/* Fake card display */}
                    <div className="bg-gradient-to-br from-violet-700 to-purple-900 rounded-2xl p-5 mb-6 border border-violet-500/20 shadow-lg shadow-violet-900/30">
                        <div className="flex justify-between items-start mb-6">
                            <Zap className="w-6 h-6 text-white/70" fill="white" />
                            <span className="text-white/50 text-xs font-mono">DEMO</span>
                        </div>
                        <p className="font-mono text-white/70 text-sm tracking-widest mb-3">•••• •••• •••• 4242</p>
                        <div className="flex justify-between text-xs text-white/50">
                            <span>{user.email?.split('@')[0].toUpperCase()}</span>
                            <span>12/99</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleCompletePurchase}
                        disabled={loading || cartItems.length === 0}
                        className="btn-primary w-full flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                Pay ${total.toFixed(2)}
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-white/20 mt-4 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Secured by SmartifY
                    </p>
                </div>
            </div>
        </div>
    );
}
