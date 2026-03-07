'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts'
import { MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, ChevronRight, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

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
  const [queries, setQueries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/queries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setQueries(data)
    } catch (error) {
      console.error('Error fetching queries:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-secondary rounded mb-2" />
          <div className="h-4 w-48 bg-secondary rounded" />
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </CardContent>
      </Card>
    )
  }

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
              filteredQueries.map((query, idx) => {
                const config = getStatusConfig(query.status)
                return (
                  <div key={idx} className="group flex items-center gap-4 bg-secondary/20 hover:bg-secondary/40 rounded-xl p-4 transition-all duration-300 border border-transparent hover:border-border/50">
                    <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                      <config.icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm leading-tight mb-0.5 truncate">{query.parentName}</p>
                      <p className="text-[10px] font-medium text-muted-foreground truncate italic">"{query.subject}"</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <Badge className={`${config.bg} ${config.color} border-none font-bold text-[9px] px-2 py-0.5`}>
                        {query.status}
                      </Badge>
                      <p className="text-[9px] text-muted-foreground font-black mt-1 uppercase">Updated 2h ago</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                )
              })
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
      </CardContent>
    </Card>
  )
}
