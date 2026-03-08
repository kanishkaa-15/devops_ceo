'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Loader2 } from 'lucide-react'
import { API_URL } from '@/lib/api-config'

export default function UpcomingEvents() {
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${API_URL}/announcements?type=Event&type=Deadline`)
                const data = await response.json()
                // Sort by date to show upcoming first
                const sortedData = data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date().getTime())
                setEvents(data)
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    if (loading) {
        return (
            <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
            </div>
        )
    }

    return (
        <Card className="bg-card border-border/50 shadow-sm h-fit">
            <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Academic Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 pb-6">
                {events.length > 0 ? events.map((event, idx) => (
                    <motion.div
                        key={event._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group flex gap-4 p-3 rounded-2xl hover:bg-secondary/20 transition-all border border-transparent hover:border-border/30"
                    >
                        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                            <span className="text-[10px] font-black text-primary uppercase leading-none">
                                {new Date(event.date).toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-xl font-black text-primary leading-tight">
                                {new Date(event.date).getDate()}
                            </span>
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    className={`text-[8px] font-black px-1.5 py-0 border-none uppercase ${event.type === 'Deadline' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}
                                >
                                    {event.type}
                                </Badge>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold italic">
                                    <Clock className="w-3 h-3" />
                                    Upcoming
                                </div>
                            </div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {event.title}
                            </h4>
                            <p className="text-[10px] font-medium text-muted-foreground line-clamp-1">
                                {event.content}
                            </p>
                        </div>
                    </motion.div>
                )) : (
                    <p className="text-center py-8 text-sm text-muted-foreground">No upcoming events or deadlines.</p>
                )}
            </CardContent>
        </Card>
    )
}
