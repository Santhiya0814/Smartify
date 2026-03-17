import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Zap, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-900/50">
                        <Zap className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="text-xl font-bold">
                        <span className="gradient-text">Smartif</span>
                        <span className="text-white">Y</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
                        Products
                    </Link>

                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-white/40 hidden lg:block truncate max-w-[160px]">{user.email}</span>
                            <button
                                onClick={handleSignOut}
                                title="Sign Out"
                                className="flex items-center space-x-1 text-white/50 hover:text-red-400 text-sm transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
                                Sign in
                            </Link>
                            <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                                Sign up
                            </Link>
                        </div>
                    )}

                    {/* Cart Button */}
                    <label htmlFor="cart-drawer-toggle" className="relative cursor-pointer w-10 h-10 rounded-xl glass flex items-center justify-center hover:border-violet-500/50 transition-all">
                        <ShoppingCart className="h-5 w-5 text-white/70" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br from-violet-500 to-purple-600 rounded-full shadow-lg">
                                {totalItems}
                            </span>
                        )}
                    </label>
                </div>

                {/* Mobile: cart + menu */}
                <div className="flex md:hidden items-center space-x-3">
                    <label htmlFor="cart-drawer-toggle" className="relative cursor-pointer w-10 h-10 rounded-xl glass flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-white/70" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-violet-600 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </label>
                    <button onClick={() => setMobileOpen(o => !o)} className="w-10 h-10 rounded-xl glass flex items-center justify-center">
                        {mobileOpen ? <X className="w-5 h-5 text-white/70" /> : <Menu className="w-5 h-5 text-white/70" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/5 bg-[#0e0e1a] px-4 py-4 space-y-3">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block text-white/60 hover:text-white py-2">Products</Link>
                    {user ? (
                        <>
                            <p className="text-white/30 text-sm truncate">{user.email}</p>
                            <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="flex items-center space-x-2 text-red-400 py-2">
                                <LogOut className="w-4 h-4" /><span>Sign out</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-white/60 hover:text-white py-2">Sign in</Link>
                            <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary block text-center py-2">Sign up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
