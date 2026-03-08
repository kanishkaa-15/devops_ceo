'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Megaphone, Bell, Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/api-config'

export default function SchoolAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const response = await fetch(`${API_URL}/announcements?type=Update`)
                const data = await response.json()
                setAnnouncements(data)
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchAnnouncements()
    }, [])

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            </div>
        )
    }

    return (
        <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    School Announcements
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
                    {announcements.map((announcement, idx) => (
                        <motion.div
                            key={announcement._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-4 rounded-2xl border ${announcement.priority === 'High'
                                    ? 'bg-red-500/5 border-red-500/20'
                                    : 'bg-primary/5 border-primary/20'
                                } flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all`}
                        >
                            <div className="flex justify-between items-start relative z-10">
                                <Badge
                                    variant={announcement.priority === 'High' ? 'destructive' : 'secondary'}
                                    className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0"
                                >
                                    {announcement.priority} PRIORITY
                                </Badge>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    {new Date(announcement.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors relative z-10">
                                {announcement.title}
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
                                {announcement.content}
                            </p>
                            <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
                                <Bell className="w-12 h-12 text-primary" />
                            </div>
                        </motion.div>
                    ))}
                    {announcements.length === 0 && (
                        <p className="col-span-2 text-center py-8 text-sm text-muted-foreground">No announcements at this time.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
