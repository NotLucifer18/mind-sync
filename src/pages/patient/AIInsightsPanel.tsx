import { useApp } from '@/context/AppContext';
import { useAI } from '@/hooks/useAI';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Sparkles, Zap, Info, Clock, Moon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const AIInsightsPanel = () => {
    const { moodHistory } = useApp();
    const { ask, loading } = useAI();
    const [insight, setInsight] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsight = async () => {
            if (moodHistory.length >= 3) {
                const result = await ask('insight', { history: moodHistory.slice(0, 14) });
                if (result && typeof result === 'object') {
                    setInsight(result.content);
                }
            }
        };
        fetchInsight();
    }, [moodHistory.length]);

    if (moodHistory.length < 3) {
        return (
            <Card className="glass-card border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center space-y-3">
                    <Brain className="w-10 h-10 text-primary mx-auto opacity-40" />
                    <h3 className="font-bold text-foreground italic">Gathering Data...</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        I need about 3 days of mood logs to start finding your patterns.
                        Keep tracking to unlock ML-powered insights! 🚀
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <Card className="relative glass-card border-white/40 overflow-hidden rounded-3xl">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                                <Brain className="w-4 h-4" />
                                AI Intelligence
                            </span>
                            <Zap className="w-4 h-4 text-secondary animate-pulse" />
                        </div>
                        <CardTitle className="text-xl font-black text-foreground">Longitudinal Recovery</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {loading ? (
                            <div className="py-8 text-center space-y-4">
                                <div className="flex justify-center gap-1">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-primary"
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground font-bold animate-pulse">Running Correlation Models...</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 italic text-sm text-foreground leading-relaxed">
                                    "{insight || "No trends detected yet. Continue logging to see your emotional climate summary."}"
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-2xl bg-secondary/5 border border-secondary/10">
                                        <div className="flex items-center gap-2 text-secondary mb-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase">Trend</span>
                                        </div>
                                        <div className="text-xs font-bold text-foreground">Stable Progression</div>
                                    </div>
                                    <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                                        <div className="flex items-center gap-2 text-indigo-600 mb-1">
                                            <Moon className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase">Correlation</span>
                                        </div>
                                        <div className="text-xs font-bold text-foreground">Mood ~ Sleep Qual</div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-2 p-2 px-3 rounded-full bg-surface/50 border border-white/40 text-[10px] text-muted-foreground">
                            <Info className="w-3 h-3" />
                            Machine learning models update every 24 hours based on your activity.
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default AIInsightsPanel;
