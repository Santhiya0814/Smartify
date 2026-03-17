import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Mock products repeated here for easy access locally without DB joins
const mockProducts = [
    {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Classic White Sneakers',
        description: 'Minimalist, comfortable low-top sneakers perfect for everyday wear. Made from durable vegan leather.',
        price: 85.00,
        image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
        stock: 45
    },
    {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Vintage Denim Jacket',
        description: 'A timeless, slightly oversized denim jacket washed for a soft, worn-in feel.',
        price: 110.00,
        image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop',
        stock: 20
    },
    {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Artisan Ceramic Coffee Mug',
        description: 'Handcrafted ceramic mug with an earthy glaze. Microwave and dishwasher safe.',
        price: 24.50,
        image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop',
        stock: 100
    },
    {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Organic Cotton T-Shirt',
        description: 'Ultra-soft, ethically made 100% organic cotton tee in a relaxed fit.',
        price: 35.00,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop',
        stock: 200
    },
    {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Leather Crossbody Bag',
        description: 'Sleek, genuine leather bag with adjustable strap and multiple interior pockets.',
        price: 145.00,
        image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop',
        stock: 15
    },
    {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Bamboo Sunglasses',
        description: 'Lightweight, polarized sunglasses with eco-friendly bamboo frames and UV400 protection.',
        price: 55.00,
        image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop',
        stock: 60
    }
];

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load local cart instead of Supabase
        const stored = localStorage.getItem(`cart_${user?.id || 'guest'}`);
        if (stored) {
            setCartItems(JSON.parse(stored));
        } else {
            setCartItems([]);
        }
        setLoading(false);
    }, [user]);

    // Save to local storage whenever cart changes
    useEffect(() => {
        if (!loading) {
            localStorage.setItem(`cart_${user?.id || 'guest'}`, JSON.stringify(cartItems));
        }
    }, [cartItems, loading, user]);

    // Setup an interval to clean up expired items locally (since we don't have pg_cron running on the data)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            setCartItems(current => current.filter(item => {
                const expiresAt = new Date(item.expires_at).getTime();
                return expiresAt > now; // Keep only items that haven't expired
            }));
        }, 5000); // check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const addToCart = async (productId, quantity = 1) => {
        if (!user) throw new Error('Must be logged in to add to cart');

        const product = mockProducts.find(p => p.id === productId);
        if (!product) throw new Error('Product not found');

        // expiry is 7 minutes from now
        const expiresAt = new Date(Date.now() + 7 * 60000).toISOString();
        
        const newItem = {
            id: crypto.randomUUID(), // fake cart ID
            user_id: user.id,
            product_id: productId,
            quantity,
            status: 'active',
            expires_at: expiresAt,
            product: product // Mock the join
        };

        setCartItems(prev => [...prev, newItem]);
        return newItem;
    };

    const removeFromCart = async (cartItemId) => {
        if (!user) return;
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    };

    const clearCart = async () => {
        if (!user) return;
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            return total + (item.product?.price || 0) * item.quantity;
        }, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        loading,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
