"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuote } from "@/context/QuoteContext";
import { ArrowLeft, Trash2, Plus, Minus, Send, ShoppingBag, ArrowRight, ShieldCheck, Truck, Headphones, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function QuotePageClient() {
    const { quoteItems, removeItem, updateQuantity, clearQuote } = useQuote();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate total items
    const totalItems = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

    // Generate formatted message for the email
    const generateEmailBody = () => {
        let body = "I would like to request a quote for the following items:\n\n";
        quoteItems.forEach((item, index) => {
            body += `${index + 1}. ${item.product.name} (Series: ${item.product.series})\n`;
            body += `   Quantity: ${item.quantity}\n`;
            body += `   Product ID: ${item.product.id}\n\n`;
        });
        return body;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const fd = new FormData(e.currentTarget);
        const payload: Record<string, string> = {
            subject: `New Quote Request for ${totalItems} Items`,
            from_name: "Aplus Website Quote",
            items_list: generateEmailBody(),
        };
        fd.forEach((value, key) => { if (key !== "message") payload[key] = value as string; });

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (data.success) {
                setIsSubmitted(true);
                clearQuote();
            }
        } catch (err) {
            console.error("Submission failed", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (quoteItems.length === 0 && !isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
                <div className="bg-white p-8 rounded-full shadow-lg mb-6 ring-1 ring-gray-100/50">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your Quote Cart is Empty</h1>
                <p className="text-gray-500 mb-8 text-center max-w-md leading-relaxed">
                    Browse our catalog of premium displays and add products to your quote list to receive a personalized bulk pricing offer.
                </p>
                <Link
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Browse Products
                </Link>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4 bg-gray-50">
                <div className="bg-green-50 p-8 rounded-full mb-6 animate-in zoom-in duration-300 border border-green-100 shadow-sm">
                    <CheckCircle size={56} className="text-green-600" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Request Sent Successfully!</h1>
                <p className="text-gray-600 mb-8 text-center max-w-lg text-lg leading-relaxed">
                    Thank you for your interest. We have received your preliminary list.
                    Our sales team will review your requirements and send a <span className="font-semibold text-gray-900">formal PDF proposal</span> to your email shortly.
                </p>
                <Link
                    href="/"
                    className="text-blue-600 font-bold hover:text-blue-800 transition flex items-center gap-2 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Return to Home
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header / Title Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Request a Quote</h1>
                            <p className="text-gray-500 text-lg">Review your selected items and submit your inquiry for a formal proposal.</p>
                        </div>
                        <Link href="/" className="text-blue-600 font-medium hover:text-blue-800 flex items-center gap-2 group transition-colors">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Continue Browsing
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Left Column: Items List */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items Card */}
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    <ShoppingBag size={20} className="text-gray-400" />
                                    Items List ({totalItems})
                                </h2>
                                <button
                                    onClick={clearQuote}
                                    className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {quoteItems.map((item) => (
                                    <div key={item.product.id} className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center group hover:bg-gray-50/50 transition-colors">
                                        {/* Product Image */}
                                        <div className="relative w-full md:w-32 h-32 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                            {item.product.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 leading-tight">{item.product.name}</h3>
                                            <p className="text-sm text-blue-600 font-medium mb-3">{item.product.series} Series</p>

                                            {/* Stock Status (Simulated) */}
                                            <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 w-fit px-2 py-1 rounded-full border border-green-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                In Stock
                                            </div>
                                        </div>

                                        {/* Quantity & Actions */}
                                        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0">
                                            <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-6 text-center text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-md transition text-gray-600"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50"
                                                title="Remove Item"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trust Signals Section */}
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 md:p-8">
                            <h3 className="font-bold text-gray-900 mb-6 text-lg">Why Partner With Us?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shrink-0">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Authorized Distributor</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">Official partner for Samsung & LG commercial displays.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shrink-0">
                                        <Headphones size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Expert Support</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">Dedicated technical team ready to assist with installation & setup.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 shrink-0">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">Fast Delivery</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">Nationwide shipping with expedited options available.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Submission Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 sticky top-24">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-tight">Submit Request</h3>
                            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                Enter your details below. We will send a formal PDF quote for these items to your email immediately.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Inject the list into the message body automatically */}
                                <textarea
                                    name="message"
                                    hidden
                                    readOnly
                                    value={generateEmailBody()}
                                />

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="name">Full Name</label>
                                    <div className="relative">
                                        <input
                                            required
                                            id="name"
                                            name="name"
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                            placeholder="Example: John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="email">Company Email</label>
                                    <div className="relative">
                                        <input
                                            required
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="phone">Phone Number</label>
                                    <div className="relative">
                                        <input
                                            required
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                                            placeholder="+91 99999 99999"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" htmlFor="requirements">Additional Requirements <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                                    <textarea
                                        id="requirements"
                                        name="requirements"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-900 resize-none"
                                        placeholder="I need 5 units for a conference room setup..."
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1 shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed group"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">Processing...</span>
                                        ) : (
                                            <>
                                                Request Pricing
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-center text-gray-400 mt-2">
                                    No credit card required. By submitting you agree to our <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
