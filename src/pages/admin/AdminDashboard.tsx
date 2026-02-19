import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Shield, Activity, Terminal, Lock, Clock, Globe, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const AdminDashboard = () => {
    const { aiLogs } = useApp();
    const [search, setSearch] = useState('');

    const filteredLogs = aiLogs.filter(log =>
        log.prompt.toLowerCase().includes(search.toLowerCase()) ||
        log.response.toLowerCase().includes(search.toLowerCase()) ||
        log.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                            <Shield className="w-10 h-10 text-slate-700" />
                            Cyber Audit & Admin
                        </h1>
                        <p className="text-slate-500 font-medium">Monitoring system integrity and AI interaction logs</p>
                    </div>
                    <div className="flex gap-4">
                        <Card className="bg-white border-slate-200">
                            <CardContent className="p-4 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">System Status</div>
                                    <div className="text-sm font-bold text-slate-900">Secure & Operational</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">Total AI Requests</div>
                                    <div className="text-2xl font-black text-slate-900">{aiLogs.length}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">Unique IPs</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {new Set(aiLogs.map(l => l.ip_address).filter(Boolean)).size}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm text-slate-500 font-medium">Avg Latency</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {aiLogs.length > 0
                                            ? Math.round(aiLogs.reduce((acc, curr) => acc + (curr.metadata?.latency || 0), 0) / aiLogs.length)
                                            : 0}ms
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search & Logs */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Terminal className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Audit logs by content, type, or user..."
                                className="pl-10 h-12 rounded-xl bg-white border-slate-200 shadow-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 transition-colors"
                            >
                                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                                            {log.type}
                                        </span>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <Globe className="w-3 h-3" />
                                            {log.ip_address || 'Internal'}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                            <User className="w-3 h-3" />
                                            {log.user_id?.split('-')[0] || 'System'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompt Context</div>
                                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-sm font-mono overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                            {log.prompt}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">AI Response</div>
                                        <div className="bg-indigo-900/5 text-slate-700 p-4 rounded-xl text-sm leading-relaxed max-h-40 overflow-y-auto italic">
                                            {log.response}
                                        </div>
                                    </div>
                                </div>
                                {log.metadata && (
                                    <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex gap-6">
                                        <div className="text-[10px] font-bold text-slate-400">MODEL: <span className="text-slate-600">{log.metadata.model}</span></div>
                                        <div className="text-[10px] font-bold text-slate-400">LATENCY: <span className="text-slate-600">{log.metadata.latency}ms</span></div>
                                        <div className="text-[10px] font-bold text-slate-400">FINISH: <span className="text-slate-600 uppercase">{log.metadata.finish_reason}</span></div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
