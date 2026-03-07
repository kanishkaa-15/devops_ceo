'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Heart, Clock, CheckCircle, MessageSquare, ShieldCheck, ThumbsUp } from 'lucide-react'

const satisfactionData = [
  { name: 'Very Satisfied', value: 65, color: 'var(--color-chart-1)' },
  { name: 'Satisfied', value: 25, color: 'var(--color-chart-2)' },
  { name: 'Neutral', value: 8, color: 'var(--color-chart-3)' },
  { name: 'Dissatisfied', value: 2, color: 'var(--color-chart-5)' },
]

const responseTimeData = [
  { period: 'Week 1', avgTime: 2.4, target: 2.0 },
  { period: 'Week 2', avgTime: 2.1, target: 2.0 },
  { period: 'Week 3', avgTime: 1.9, target: 2.0 },
  { period: 'Week 4', avgTime: 1.7, target: 2.0 },
]

const metrics = {
  totalQueries: 428,
  repeatComplaints: 12,
  avgResponseTime: 1.7,
  resolutionQuality: 94.5,
  satisfactionIndex: 92.8,
  escalationRate: 2.1,
}

export default function ParentTrustIndex() {
  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Parent Trust Index</CardTitle>
            <CardDescription>Engagement & satisfaction sentiment</CardDescription>
          </div>
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Sentiment Score Hero */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500/5 to-red-500/10 rounded-2xl p-6 border border-red-500/10">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Satisfaction Index</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-red-600">{metrics.satisfactionIndex}%</span>
                <Badge variant="outline" className="border-red-500/20 text-red-600 bg-white/50 dark:bg-black/20 font-bold">Excellent</Badge>
              </div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl backdrop-blur-sm shadow-inner overflow-hidden relative">
              <ThumbsUp className="w-8 h-8 text-red-500 relative z-10" />
              <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Essential Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Response Time', value: `${metrics.avgResponseTime}h`, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Target: 2.0h' },
            { label: 'Resolution Quality', value: `${metrics.resolutionQuality}%`, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: 'Very High' },
          ].map((item) => (
            <div key={item.label} className="bg-secondary/20 rounded-xl p-4 border border-transparent hover:border-border/50 transition-colors">
              <div className={`p-2 w-fit rounded-lg ${item.bg} ${item.color} mb-3`}>
                <item.icon className="w-4 h-4" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <h4 className="text-xl font-black text-foreground">{item.value}</h4>
              <p className="text-[10px] font-bold text-muted-foreground opacity-70">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare className="w-3 h-3" /> Sentiment Breakdown
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : index === 1 ? 'hsl(var(--accent))' : index === 2 ? 'hsl(var(--muted))' : '#ef4444'} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">Response Velocity</h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={responseTimeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                  <Bar dataKey="avgTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} name="Avg Response" />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={20} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Total Queries</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-foreground">{metrics.totalQueries}</span>
              <Badge variant="secondary" className="text-[9px] font-bold">Processed</Badge>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Critical Escalations</span>
            <div className="flex items-center justify-end gap-2">
              <Badge variant="destructive" className="text-[9px] font-bold bg-red-500/10 text-red-600 border-red-500/20">{metrics.escalationRate}% Rate</Badge>
              <span className="text-2xl font-black text-red-600">{metrics.repeatComplaints}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
