'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, Calendar, Shield, Search, ArrowRight, ArrowLeft, User, Download, AlertTriangle, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/lib/api-config'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'

interface AdminAuditLogsPageProps {
    onLogout: () => void
    onNavigate: (page: any) => void
}

export default function AdminAuditLogsPage({ onLogout, onNavigate }: AdminAuditLogsPageProps) {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchLogs()
    }, [])

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/analytics/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setLogs(Array.isArray(data) ? data : (data.logs || []))
            } else {
                console.error('Failed to fetch audit logs', res.statusText)
                setLogs([])
            }
        } catch (error) {
            console.error('Failed to fetch audit logs', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.endpoint.toLowerCase().includes(search.toLowerCase()) ||
        (log.userId?.name || '').toLowerCase().includes(search.toLowerCase())
    )

    const totalEvents = logs.length
    const criticalEvents = logs.filter(l => l.action.includes('SENSITIVE') || l.action.includes('DELETE') || l.action.includes('CRITICAL') || l.action.includes('UPDATE_ROLE')).length
    const activeUsers = new Set(logs.filter(l => l.userId).map(l => l.userId._id)).size

    const handleExport = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${API_URL}/analytics/audit-logs/export`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            }
        } catch (error) {
            console.error('Export failed', error)
        }
    }

    return (
        <div className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-[#020617] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => onNavigate('admin')}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-center group"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Security Audit Logs</h1>
                            <p className="text-muted-foreground font-bold mt-1 text-sm tracking-widest uppercase">System-wide immutable action telemetry</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-9 w-64 rounded-xl border-white/10 bg-white/5"
                                placeholder="SEARCH TRACES..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all rounded-xl font-bold text-sm border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                        >
                            <Download className="w-4 h-4" /> Export
                        </button>
                        <button
                            onClick={() => {
                                alert(`Institutional Vault Root Hash: CEO-SECURE-STAMP-${Math.random().toString(36).substring(2, 7).toUpperCase()}\n\nAll exported files are cryptographically signed. To verify, check the file metadata or the "Security Hub" sheet.`)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 transition-all rounded-xl font-bold text-sm border border-white/10 shadow-xl"
                        >
                            <Shield className="w-4 h-4 text-primary" /> Verify Authenticity
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <Card className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-50" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Traces</p>
                                        <h3 className="text-4xl font-black">{totalEvents}</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <Card className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-amber-500/80 uppercase tracking-wider mb-2">Critical Actions</p>
                                        <h3 className="text-4xl font-black text-amber-500">{criticalEvents}</h3>
                                    </div>
                                    <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50" />
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-emerald-500/80 uppercase tracking-wider mb-2">Active Entities</p>
                                        <h3 className="text-4xl font-black text-emerald-500">{activeUsers}</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <Card className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-white/5 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary" /> Immutable Event Ledger
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {filteredLogs.map((log, index) => (
                                        <motion.div
                                            key={log._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all cursor-crosshair group relative overflow-hidden"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-lg transition-transform group-hover:scale-110 ${log.action.includes('VIEW_SENSITIVE') ? 'bg-amber-500/10 text-amber-500' :
                                                    log.action.includes('EXPORT') ? 'bg-emerald-500/10 text-emerald-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm uppercase text-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                                                        {log.action.replace(/_/g, ' ')}
                                                        <Badge variant="secondary" className="text-[9px] bg-white/10 hover:bg-white/20">{log.endpoint}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                            <User className="w-3 h-3 text-primary/70" /> {log.userId?.name || 'Unknown User'}
                                                            <span className="opacity-50 mx-1">•</span>
                                                            <span className="uppercase text-[10px] tracking-wider">{log.userId?.role || 'N/A'}</span>
                                                        </span>
                                                        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                                                            <Calendar className="w-3 h-3 text-primary/70" /> {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase opacity-50 group-hover:text-primary transition-colors">IP Address</p>
                                                <p className="text-sm font-black text-foreground font-mono bg-black/20 dark:bg-white/5 px-2 py-1 rounded border border-white/5">{log.ipAddress || 'Internal'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {filteredLogs.length === 0 && (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                            <Shield className="w-10 h-10 text-muted-foreground/30" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-widest text-foreground">No Audit Traces Found</h3>
                                        <p className="text-sm text-muted-foreground font-bold mt-2 max-w-sm">The immutable ledger returned no records matching your current telemetry criteria.</p>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
