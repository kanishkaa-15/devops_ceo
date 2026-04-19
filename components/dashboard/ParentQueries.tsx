'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, Search, Zap, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useData } from '@/context/DataContext'
import { API_URL } from '@/lib/api-config'
import { Input } from '@/components/ui/input'
import { generateSmartReply, Sentiment } from '@/lib/ai-utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Resolved':
      return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 }
    case 'In Progress':
      return { color: 'text-primary', bg: 'bg-primary/10', icon: Clock }
    case 'Open':
      return { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertCircle }
    default:
      return { color: 'text-muted-foreground', bg: 'bg-secondary/50', icon: MessageSquare }
  }
}

export default function ParentQueries() {
  const { queries } = useData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [smartReplyDraft, setSmartReplyDraft] = useState('')

  // Removed local fetch logic, completely reliant on global DataContext for real-time Sync

  const handleGenerateSmartReply = (query: any) => {
    const draft = generateSmartReply(query.subject, query.message, query.sentiment || 'Neutral' as Sentiment)
    setSmartReplyDraft(draft)
    setSelectedQuery(query)
  }

  if (!queries) return null;

  const totalQueries = queries.length
  const openQueries = queries.filter(q => q.status === 'Open').length
  const inProgressQueries = queries.filter(q => q.status === 'In Progress').length
  const resolvedQueries = queries.filter(q => q.status === 'Resolved').length

  const queryStatus = [
    { name: 'Resolved', value: resolvedQueries, fill: 'hsl(var(--primary))' },
    { name: 'In Progress', value: inProgressQueries, fill: 'hsl(var(--accent))' },
    { name: 'Open', value: openQueries, fill: 'hsl(var(--muted))' },
  ].filter(item => item.value > 0)

  const filteredQueries = queries
    .filter(q =>
      q.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 6)

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Stakeholder Feedback</CardTitle>
            <CardDescription>Support query resolution & sentiment</CardDescription>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Advanced Grid: Pie Chart + Summary */}
        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queryStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {queryStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-3 gap-3">
            {[
              { label: 'Unresolved', value: openQueries, color: 'text-amber-500', bg: 'bg-amber-500/10', sub: 'Critical' },
              { label: 'Ongoing', value: inProgressQueries, color: 'text-primary', bg: 'bg-primary/10', sub: 'Tracking' },
              { label: 'Resolved', value: resolvedQueries, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Success' },
            ].map((item) => (
              <div key={item.label} className="bg-secondary/30 rounded-2xl p-4 border border-transparent hover:border-border/50 transition-all text-center">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                <h4 className={`text-2xl font-black ${item.color}`}>{item.value}</h4>
                <Badge variant="outline" className={`text-[8px] font-bold mt-2 ${item.bg} ${item.color} border-none px-1.5`}>{item.sub}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Live Communications Feed */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" /> Recent Communications
            </h4>
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8 h-8 text-[11px] rounded-lg bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3">
            {totalQueries === 0 ? (
              <div className="text-center py-10 bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Communication silence</p>
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">No matching queries found</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredQueries.map((query, idx) => {
                  const config = getStatusConfig(query.status)
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={`${query._id || query.id || 'query'}-${idx}`}
                      className="group flex items-center gap-4 bg-secondary/20 hover:bg-secondary/40 rounded-xl p-4 transition-all duration-300 border border-transparent hover:border-border/50"
                    >
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-foreground text-sm leading-tight truncate">{query.parentName}</p>
                          {query.sentiment && (
                            <Badge variant="outline" className={`text-[8px] border-none px-1.5 py-0 ${
                              query.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500' :
                              query.sentiment === 'Concerned' ? 'bg-rose-500/10 text-rose-500' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {query.sentiment}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground truncate italic">"{query.subject}"</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <Badge className={`${config.bg} ${config.color} border-none font-bold text-[9px] px-2 py-0.5`}>
                          {query.status}
                        </Badge>
                        <p className="text-[9px] text-muted-foreground font-black mt-1 uppercase">Updated 2h ago</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateSmartReply(query)}
                          className="p-2 bg-primary/10 text-primary rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/20"
                          title="AI Smart Reply"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Action Call for Ops */}
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <p className="text-[11px] font-bold text-primary italic">Resolution target: 18 hours per ticket</p>
          </div>
          <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View Ops Console</button>
        </div>

        {/* AI Smart Reply Dialog */}
        <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
          <DialogContent className="max-w-2xl bg-slate-900 border-white/10 text-white rounded-[2rem]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black uppercase italic italic tracking-tighter">AI Smart Reply</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantum Drafting Engine</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Original Inquiry</p>
                <p className="text-xs font-bold text-slate-300 italic">"{selectedQuery?.message}"</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  Generated Draft <Badge className="bg-primary/20 text-primary border-none text-[8px]">{selectedQuery?.sentiment || 'Neutral'}</Badge>
                </p>
                <Textarea
                  value={smartReplyDraft}
                  onChange={(e) => setSmartReplyDraft(e.target.value)}
                  className="min-h-[150px] bg-slate-950 border-white/10 rounded-2xl text-xs font-medium leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setSelectedQuery(null)} className="rounded-xl text-[10px] font-black uppercase tracking-widest">Discard</Button>
                <Button className="rounded-xl bg-primary hover:bg-primary/80 transition-all text-[10px] font-black uppercase tracking-widest gap-2">
                  <Send className="w-3 h-3" /> Send Response
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
