'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { TrendingUp, AlertCircle, ChevronUp, BookOpen, GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const growthData = [
  { subject: 'Mathematics', baseline: 65, current: 78, growth: 20, gap: 2.3 },
  { subject: 'English', baseline: 72, current: 82, growth: 14, gap: 1.8 },
  { subject: 'Science', baseline: 68, current: 81, growth: 19, gap: 2.1 },
  { subject: 'Social Studies', baseline: 70, current: 79, growth: 13, gap: 1.5 },
  { subject: 'Languages', baseline: 60, current: 75, growth: 25, gap: 2.8 },
]

const avgGrowth = (growthData.reduce((sum, item) => sum + item.growth, 0) / growthData.length).toFixed(1)

export default function LearningOutcomeGrowth() {
  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Learning Outcome Growth</CardTitle>
            <CardDescription>Subject-wise performance trajectory</CardDescription>
          </div>
          <div className="p-2 bg-accent/10 rounded-lg">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average growth */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl p-6 border border-accent/20">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Average Growth Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-accent">{avgGrowth}%</span>
                <ChevronUp className="w-6 h-6 text-accent animate-bounce" />
              </div>
            </div>
            <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <GraduationCap className="w-8 h-8 text-accent opacity-80" />
            </div>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
        </div>

        {/* Subject breakdown */}
        <div className="grid gap-3">
          {growthData.map((item, idx) => (
            <div key={idx} className="group bg-secondary/20 hover:bg-secondary/40 rounded-xl p-4 transition-all duration-300 border border-transparent hover:border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded-lg shadow-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="font-bold text-foreground text-sm tracking-tight">{item.subject}</p>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-transparent font-bold">
                  +{item.growth}%
                </Badge>
              </div>
              <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-1000 group-hover:bg-accent/80"
                  style={{ width: `${Math.min(item.growth * 3, 100)}%` }} // Scaled for visual impact
                />
              </div>
              <div className="flex justify-between mt-3 px-1">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Baseline</span>
                  <span className="text-xs font-black text-foreground">{item.baseline}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Current</span>
                  <span className="text-xs font-black text-accent">{item.current}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-[300px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="subject"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 800 }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingBottom: 15 }} iconType="circle" />
              <Bar dataKey="baseline" fill="hsl(var(--muted))" name="Baseline" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="current" fill="hsl(var(--accent))" name="Current" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Intervention alerts */}
        <div className="group relative overflow-hidden bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex gap-4 transition-all hover:bg-amber-500/15">
          <div className="p-2 bg-amber-500/20 rounded-lg h-fit group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-black text-amber-900 leading-none mb-1">Intervention Required</p>
            <p className="text-xs text-amber-800 font-medium opacity-80">
              Low progress detected in <span className="font-bold underline">Mathematics</span> and <span className="font-bold underline">English</span>. Review teacher allocation.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
        </div>
      </CardContent>
    </Card>
  )
}
