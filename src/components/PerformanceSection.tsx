"use client";

import { motion } from "framer-motion";

export default function PerformanceSection() {
    return (
        <section id="performance" className="py-32 px-6 md:px-12 bg-background relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
                >
                    <div>
                        <h2 className="text-sm font-mono tracking-[0.2em] text-accent-blue uppercase mb-6">Performance Architecture</h2>
                        <h3 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-8">Speed is<br />engineered.</h3>
                        <p className="text-xl text-gray-400 font-light mb-8 max-w-md leading-relaxed">
                            Every millimeter of the DualDeer speed suit is mathematically optimized. We mapped human biomechanics to create a second skin that reduces drag and amplifies kinetic output.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="h-px w-12 bg-accent-blue mt-3 mr-4"></div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">0.04 cd Drag Coefficient</h4>
                                    <p className="text-sm text-gray-500 mt-1">Wind-tunnel tested to cut through air resistance invisibly.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="h-px w-12 bg-accent-blue mt-3 mr-4"></div>
                                <div>
                                    <h4 className="text-white font-semibold text-lg">Targeted Muscle Support</h4>
                                    <p className="text-sm text-gray-500 mt-1">Reduces muscle oscillation and fatigue during maximum velocity sprints.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden glass-panel group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent-blue/10 to-transparent mix-blend-overlay group-hover:from-accent-blue/20 transition-all duration-700"></div>
                        {/* Placeholder abstract grid representing wind tunnel / engineering */}
                        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                            {Array.from({ length: 36 }).map((_, i) => (
                                <div key={i} className="border border-white/10" />
                            ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-blue/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                        <div className="absolute bottom-8 left-8 right-8 text-xs font-mono tracking-widest text-gray-400 flex justify-between">
                            <span>AERODYNAMIC SIMULATION</span>
                            <span>DATA {'>'} 99.9%</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
