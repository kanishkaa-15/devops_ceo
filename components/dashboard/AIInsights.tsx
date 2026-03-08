'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, AlertCircle, TrendingUp, Zap, ChevronRight, Info } from 'lucide-react'
import { getTacticalInsights } from '@/lib/ai-utils'

interface AIInsightsProps {
  stats: {
    attendanceRiskCount: number
    enrollmentGrowth: number
    pendingQueries: number
    sentimentTrend: string
  }
}

export default function AIInsights({ stats }: AIInsightsProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'critical'>('all')

  useEffect(() => {
    // Generate tactical insights based on current dashboard data
    const tactical = getTacticalInsights(stats)
    setInsights(tactical)
  }, [stats])

  const filteredInsights = activeTab === 'critical' 
    ? insights.filter(i => i.priority === 'High')
    : insights

  return (
    <Card className="bg-slate-950 border-white/10 shadow-2xl overflow-hidden relative group">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-30 pointer-events-none" />
      
      <CardHeader className="relative z-10 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/20">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">Strategic Insights</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantum Engine: Active</CardDescription>
            </div>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'all' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Vectors
            </button>
            <button 
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'critical' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Critical Risk
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 pt-4">
        <AnimatePresence mode="popLayout">
          {filteredInsights.length > 0 ? (
            filteredInsights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border flex gap-4 items-start group/item transition-all hover:translate-x-1 ${
                  insight.priority === 'High' 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : insight.type === 'Growth'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${
                  insight.priority === 'High' ? 'bg-rose-500/20 text-rose-500' : 
                  insight.type === 'Growth' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'
                }`}>
                  {insight.priority === 'High' ? <AlertCircle className="w-4 h-4" /> : 
                   insight.type === 'Growth' ? <TrendingUp className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                      insight.priority === 'High' ? 'text-rose-500' : 
                      insight.type === 'Growth' ? 'text-emerald-500' : 'text-slate-400'
                    }`}>
                      {insight.type} Detected
                    </span>
                    <Badge variant="outline" className="text-[8px] font-black border-none bg-white/5 text-slate-400">
                      {insight.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-[11px] font-bold text-slate-200 leading-relaxed uppercase tracking-tight">
                    {insight.message}
                  </p>
                </div>
                <button className="self-center p-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40">
              <Zap className="w-10 h-10 text-slate-600 animate-pulse" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scanning Metrics...</p>
                <p className="text-[9px] font-bold text-slate-600 italic">No anomalies detected in current cycle</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Tactical Recommendation Action */}
        <div className="pt-4 mt-4 border-t border-white/5">
          <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Execute AI Optimization</p>
                <p className="text-[9px] font-bold text-slate-400">Self-correction of operational gaps</p>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
