'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, AlertCircle, TrendingUp, Zap, ChevronRight, Info, BookOpen, Send, CheckCircle2 } from 'lucide-react'
import { getTacticalInsights } from '@/lib/ai-utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

interface AIInsightsProps {
  stats: {
    attendanceRiskCount: number
    enrollmentGrowth: number
    pendingQueries: number
    sentimentTrend: string
  }
}

export default function AIInsights({ stats }: AIInsightsProps) {
  const { toast } = useToast()
  const [insights, setInsights] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'critical'>('all')
  const [isOptimizationOpen, setIsOptimizationOpen] = useState(false)
  const [optimizationState, setOptimizationState] = useState<'idle' | 'analyzing' | 'complete'>('idle')
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null)
  const [isCleared, setIsCleared] = useState(false)

  // Crisis Playbook State
  const [playbookInsight, setPlaybookInsight] = useState<any | null>(null)
  const [playbookState, setPlaybookState] = useState<'generating' | 'ready' | 'executed'>('generating')

  useEffect(() => {
    // Generate tactical insights based on current dashboard data
    if (!isCleared) {
      const tactical = getTacticalInsights(stats)
      setInsights(tactical)
    }
  }, [stats, isCleared])

  const handleAcknowledge = () => {
    setIsOptimizationOpen(false)
    setOptimizationState('idle')
    setInsights([]) // Clear the anomalies
    setIsCleared(true) // Prevent re-fetching from stats
    setPlaybookInsight(null)
    toast({
      title: "Optimization Complete",
      description: "All vectors acknowledged and protocols are active.",
    })
  }

  const handleGeneratePlaybook = (insight: any) => {
    setPlaybookInsight(insight)
    setPlaybookState('generating')
    setTimeout(() => {
      setPlaybookState('ready')
    }, 2000)
  }

  const handleExecutePlaybook = () => {
    setPlaybookState('executed')
    setTimeout(() => {
      setPlaybookInsight(null)
      toast({
        title: "Crisis Playbook Dispatched",
        description: "Communications sent. Resource allocations pending approval.",
      })
      // Auto-acknowledge this specific insight or all
      handleAcknowledge()
    }, 2000)
  }

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
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
            >
              All Vectors
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'critical' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
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
                onClick={() => setSelectedInsight(insight)}
                className={`cursor-pointer p-4 rounded-2xl border flex gap-4 items-start group/item transition-all hover:translate-x-1 ${insight.priority === 'High'
                  ? 'bg-rose-500/10 border-rose-500/20'
                  : insight.type === 'Growth'
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-white/5 border-white/5'
                  }`}
              >
                <div className={`p-2 rounded-xl mt-0.5 ${insight.priority === 'High' ? 'bg-rose-500/20 text-rose-500' :
                  insight.type === 'Growth' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'
                  }`}>
                  {insight.priority === 'High' ? <AlertCircle className="w-4 h-4" /> :
                    insight.type === 'Growth' ? <TrendingUp className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${insight.priority === 'High' ? 'text-rose-500' :
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
          <button
            onClick={() => {
              setIsOptimizationOpen(true)
              setOptimizationState('analyzing')
              setTimeout(() => setOptimizationState('complete'), 2000)
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group"
          >
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

      {/* AI Optimization Modal */}
      <Dialog open={isOptimizationOpen} onOpenChange={setIsOptimizationOpen}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl border border-primary/20">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">AI Optimization Matrix</DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {playbookInsight ? 'Crisis mitigation playbook generated' : optimizationState === 'analyzing' ? 'Analyzing operational vectors...' : 'Optimization sequence complete'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-2">
            {optimizationState === 'analyzing' ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Zap className="w-16 h-16 text-primary relative z-10 animate-bounce" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Running Quantum Algorithms</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Synthesizing risk & growth data...</p>
                </div>
              </div>
            ) : playbookInsight ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Automated Crisis Playbook
                  </h4>
                  <button onClick={() => setPlaybookInsight(null)} className="text-[9px] font-black text-slate-500 hover:text-white uppercase">
                    &larr; Back to Matrix
                  </button>
                </div>

                {playbookState === 'generating' ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 animate-pulse">Drafting Mitigation Strategy...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <Send className="w-4 h-4 text-blue-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Parent Communication</span>
                        </div>
                        <p className="text-[10px] text-slate-300 italic">"Dear Parents, we have noticed recent trends regarding student attendance..."</p>
                        <Badge variant="outline" className="text-[8px] bg-blue-500/10 text-blue-400 border-none">Draft Ready</Badge>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <AlertCircle className="w-4 h-4 text-amber-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Internal Staff Memo</span>
                        </div>
                        <p className="text-[10px] text-slate-300 italic">"URGENT: All homeroom teachers are required to review flagged..."</p>
                        <Badge variant="outline" className="text-[8px] bg-amber-500/10 text-amber-400 border-none">Draft Ready</Badge>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Emergency Resource Allocation</span>
                        <span className="text-sm font-black text-white">₹2,00,000</span>
                      </div>
                      <p className="text-[10px] text-rose-200/70 font-bold">Recommended allocation for immediate counselor overtime and automated parent SMS blasts.</p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleExecutePlaybook}
                        disabled={playbookState === 'executed'}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${playbookState === 'executed'
                          ? 'bg-emerald-500/20 text-emerald-500 cursor-not-allowed'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                          }`}
                      >
                        {playbookState === 'executed' ? (
                          <><CheckCircle2 className="w-4 h-4" /> Protocols Dispatched</>
                        ) : (
                          <><Zap className="w-4 h-4" /> Execute Playbook Protocols</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-2">Detected Vectors & Prescriptions</h4>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {insights.map((insight, idx) => (
                      <div key={idx} className={`p-4 rounded-xl border ${insight.priority === 'High' ? 'bg-rose-500/10 border-rose-500/20' :
                        insight.type === 'Growth' ? 'bg-emerald-500/10 border-emerald-500/20' :
                          'bg-white/5 border-white/10'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {insight.priority === 'High' ? <AlertCircle className="w-4 h-4 text-rose-500" /> :
                            insight.type === 'Growth' ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                              <Info className="w-4 h-4 text-slate-400" />}
                          <span className={`text-[10px] font-black uppercase tracking-widest ${insight.priority === 'High' ? 'text-rose-500' :
                            insight.type === 'Growth' ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                            {insight.type} ({insight.priority})
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-200 uppercase tracking-tight mb-4 leading-relaxed">
                          {insight.message}
                        </p>
                        <div className="bg-black/40 p-3 rounded-lg border border-white/5 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                          <div className="relative z-10">
                            <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                              <Zap className="w-3 h-3 text-primary" /> Recommended AI Action:
                            </p>
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-[10px] font-bold text-slate-300 leading-relaxed flex-1">
                                {insight.priority === 'High' ? 'Initiated automated risk mitigation protocols. Flagged affected student cohorts for immediate counselor review and activated parent communication workflows.' :
                                  insight.type === 'Growth' ? 'Dynamically calculating resource allocation models. Outlined capacity expansion requirements for spatial and staffing resources.' :
                                    'Optimizing operational workflows to maintain equilibrium and streamline support channels.'}
                              </p>
                              {insight.priority === 'High' && (
                                <button
                                  onClick={() => handleGeneratePlaybook(insight)}
                                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-rose-500/30"
                                >
                                  <BookOpen className="w-3 h-3" /> Playbook
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {insights.length === 0 && (
                      <div className="text-center py-10 space-y-3">
                        <Brain className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Actionable Vectors Detected</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={handleAcknowledge}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Acknowledge & Finalize <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Specific Insight Details Modal */}
      <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
        <DialogContent className="max-w-2xl bg-slate-950 border-white/10 text-white shadow-2xl rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${selectedInsight?.priority === 'High' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20'}`}>
                {selectedInsight?.priority === 'High' ? <AlertCircle className="w-5 h-5" /> : selectedInsight?.type === 'Growth' ? <TrendingUp className="w-5 h-5" /> : <Info className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tighter text-white">
                  {selectedInsight?.type} Details
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Detailed vector analysis
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-slate-300 font-bold uppercase tracking-tight">{selectedInsight?.message}</p>
            <ScrollArea className="h-[300px] border border-white/5 rounded-xl bg-black/20 p-4">
              {selectedInsight?.type === 'Risk' ? (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Identified At-Risk Students</h4>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 font-black text-xs">S{i + 1}</div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-200">Student {i + 1}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attendance: {70 - i * 5}% (Critical)</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border-none">Flagged</Badge>
                    </div>
                  ))}
                </div>
              ) : selectedInsight?.type === 'Growth' ? (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Enrollment Velocity Metrics</h4>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-xs">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-200">Grade {6 + i} Cohort</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Applications: +{15 + i * 2}% vs Target</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-none">Surpassing</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Operational Details</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Vector logged for review.</p>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

    </Card>
  )
}
