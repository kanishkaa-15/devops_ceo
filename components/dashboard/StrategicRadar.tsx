'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip } from 'recharts'
import { Shield, Target, Zap, Heart, Globe } from 'lucide-react'

interface StrategicRadarProps {
  data: any
}

export default function StrategicRadar({ data }: StrategicRadarProps) {
  // Default data if none provided
  const chartData = [
    { subject: 'Academic', A: data?.academic || 85, fullMark: 100 },
    { subject: 'Financial', A: data?.financial || 92, fullMark: 100 },
    { subject: 'Wellbeing', A: data?.wellbeing || 78, fullMark: 100 },
    { subject: 'Efficiency', A: data?.efficiency || 88, fullMark: 100 },
    { subject: 'Trust', A: data?.trust || 90, fullMark: 100 },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{payload[0].payload.subject}</p>
          <p className="text-xl font-black text-white">{payload[0].value.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Strategic Balance Map</CardTitle>
            <CardDescription>Multi-vector institutional health radar</CardDescription>
          </div>
          <div className="p-2 bg-accent/10 rounded-lg">
            <Target className="w-5 h-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Performance"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.4}
                strokeWidth={3}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Info */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/30">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">Primary Vector</p>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-foreground uppercase tracking-tight">Institutional Agility</span>
            </div>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 italic">Stability Status</p>
            <div className="flex items-center justify-end gap-2 text-emerald-500">
              <span className="text-sm font-black uppercase tracking-tight">Synchronized</span>
              <Shield className="w-4 h-4" />
            </div>
          </div>
        </div>
      </CardContent>
      {/* Dynamic glow effect */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
    </Card>
  )
}
