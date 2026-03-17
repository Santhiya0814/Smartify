import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const mockProducts = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Classic White Sneakers', description: 'Minimalist, comfortable low-top sneakers perfect for everyday wear. Made from durable vegan leather.', price: 85.00, image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', stock: 45 },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Vintage Denim Jacket', description: 'A timeless, slightly oversized denim jacket washed for a soft, worn-in feel.', price: 110.00, image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=800&auto=format&fit=crop', stock: 20 },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Artisan Ceramic Coffee Mug', description: 'Handcrafted ceramic mug with an earthy glaze. Microwave and dishwasher safe.', price: 24.50, image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=800&auto=format&fit=crop', stock: 100 },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Organic Cotton T-Shirt', description: 'Ultra-soft, ethically made 100% organic cotton tee in a relaxed fit.', price: 35.00, image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', stock: 200 },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Leather Crossbody Bag', description: 'Sleek, genuine leather bag with adjustable strap and multiple interior pockets.', price: 145.00, image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', stock: 15 },
    { id: '66666666-6666-6666-6666-666666666666', name: 'Bamboo Sunglasses', description: 'Lightweight, polarized sunglasses with eco-friendly bamboo frames and UV400 protection.', price: 55.00, image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop', stock: 60 },
];

const features = [
    { icon: Zap, label: 'Fast Delivery', desc: '2-day shipping on all orders' },
    { icon: Shield, label: 'Secure Payments', desc: 'End-to-end encrypted checkout' },
    { icon: TrendingUp, label: 'Best Prices', desc: 'Price-matched guarantee' },
];

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setProducts(mockProducts);
        setLoading(false);
    }, []);

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-950 via-[#12062e] to-[#0a0a0f] border border-violet-800/20 p-10 md:p-16">
                {/* Background orbs */}
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <div className="float-anim inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                        <Sparkles className="w-3.5 h-3.5" />
                        New arrivals just dropped
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
                        Shop <span className="gradient-text">Smarter.</span>
                        <br />Live Better.
                    </h1>
                    <p className="text-white/50 text-lg md:text-xl mb-8 max-w-lg">
                        Curated products with fast shipping, no compromises. Discover what SmartifY has to offer.
                    </p>
                    <a href="#products" className="btn-primary inline-flex items-center gap-2 text-base">
                        <Sparkles className="w-5 h-5" />
                        Explore Products
                    </a>
                </div>
            </section>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {features.map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="glass rounded-2xl p-5 flex items-center gap-4 hover:border-violet-500/30 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">{label}</p>
                            <p className="text-xs text-white/40">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Products Section */}
            <section id="products">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">All Products</h2>
                        <p className="text-white/40 text-sm mt-1">{products.length} items available</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map(i => (
                            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse h-80">
                                <div className="bg-white/5 h-52 w-full" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-white/5 rounded-full w-3/4" />
                                    <div className="h-3 bg-white/5 rounded-full w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
