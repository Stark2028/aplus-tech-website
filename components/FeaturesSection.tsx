"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Truck, Clock, Award } from "lucide-react";

const FEATURES = [
    {
        icon: ShieldCheck,
        title: "Authorized Distributor",
        description: "Official partner for Samsung commercial displays and solutions.",
    },
    {
        icon: Clock,
        title: "24/7 Support",
        description: "Dedicated technical support team ready to assist around the clock.",
    },
    {
        icon: Truck,
        title: "Fast Delivery",
        description: "Nationwide shipping with expedited options for urgent projects.",
    },
    {
        icon: Award,
        title: "Expert Installation",
        description: "Certified professional installation and integration services.",
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                                    <Icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
