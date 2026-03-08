'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface SentimentPulseProps {
  queries: any[]
}

export default function SentimentPulse({ queries }: SentimentPulseProps) {
  const total = queries.length || 1
  const positive = queries.filter(q => q.sentiment === 'Positive').length
  const concerned = queries.filter(q => q.sentiment === 'Concerned').length
  const neutral = queries.filter(q => q.sentiment === 'Neutral').length

  const positivePercent = Math.round((positive / total) * 100)
  const neutralPercent = Math.round((neutral / total) * 100)
  const concernedPercent = Math.round((concerned / total) * 100)

  // Calculate overall pulse (0 to 100)
  const pulseScore = Math.min(100, Math.max(0, 50 + (positivePercent - concernedPercent)))

  const getPulseColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500'
    if (score >= 40) return 'text-amber-500'
    return 'text-rose-500'
  }

  const getPulseLabel = (score: number) => {
    if (score >= 70) return 'Healthy'
    if (score >= 40) return 'Stable'
    return 'Action Required'
  }

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Community Pulse</CardTitle>
            <CardDescription>Real-time stakeholder sentiment analysis</CardDescription>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Pulse Indicator */}
        <div className="flex items-center justify-center py-4">
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute inset-0 rounded-full blur-2xl ${
                pulseScore >= 70 ? 'bg-emerald-500' : pulseScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
            <div className="relative text-center">
              <span className={`text-6xl font-black ${getPulseColor(pulseScore)} leading-none`}>
                {pulseScore}
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">
                Sentiment Index: <span className={getPulseColor(pulseScore)}>{getPulseLabel(pulseScore)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-4">
          {[
            { label: 'Positive', value: positivePercent, icon: Smile, color: 'text-emerald-500', barBg: 'bg-emerald-500' },
            { label: 'Neutral', value: neutralPercent, icon: Meh, color: 'text-amber-500', barBg: 'bg-amber-500' },
            { label: 'Concerned', value: concernedPercent, icon: Frown, color: 'text-rose-500', barBg: 'bg-rose-500' },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                <div className="flex items-center gap-1.5">
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span className="text-muted-foreground">{item.label}</span>
                </div>
                <span className="text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${item.barBg}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Velocity Indicator */}
        <div className="pt-4 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${pulseScore >= 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {pulseScore >= 50 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sentiment Velocity</span>
          </div>
          <Badge variant="outline" className="text-[9px] font-bold border-none bg-primary/5 text-primary">Quantum Monitor Active</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
