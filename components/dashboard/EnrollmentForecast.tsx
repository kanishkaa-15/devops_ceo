'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { TrendingUp, Users, ArrowUpRight } from 'lucide-react'

interface EnrollmentForecastProps {
  currentAdmissions: number
  totalStudents: number
}

export default function EnrollmentForecast({ currentAdmissions, totalStudents }: EnrollmentForecastProps) {
  // Simple heuristic: Current students + Pending/Approved admissions
  // We'll generate a 6-month projection
  const data = [
    { name: 'Month 0', current: totalStudents, projected: totalStudents },
    { name: 'Month 1', current: null, projected: totalStudents + (currentAdmissions * 0.2) },
    { name: 'Month 2', current: null, projected: totalStudents + (currentAdmissions * 0.4) },
    { name: 'Month 3', current: null, projected: totalStudents + (currentAdmissions * 0.6) },
    { name: 'Month 4', current: null, projected: totalStudents + (currentAdmissions * 0.8) },
    { name: 'Month 5', current: null, projected: totalStudents + currentAdmissions },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{payload[0].payload.name}</p>
          <div className="space-y-1">
            <p className="text-sm font-black text-white">Projected: {Math.round(payload[0].value)} Students</p>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Growth Vector: Stable</p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Enrollment Forecaster</CardTitle>
            <CardDescription>Predictive institutional growth mapping</CardDescription>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="projected" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProjected)" 
                dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Capacity Forecast</p>
              <h4 className="text-lg font-black text-foreground tracking-tighter">+{currentAdmissions} Potential New Seats</h4>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-500 font-black text-xs">
              <ArrowUpRight className="w-3 h-3" />
              <span>18.4%</span>
            </div>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Delta Velocity</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
