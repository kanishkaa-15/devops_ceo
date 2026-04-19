'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { TrendingUp, Users, ArrowUpRight, DollarSign, Zap, Target } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

interface EnrollmentForecastProps {
  currentAdmissions: number
  totalStudents: number
}

export default function EnrollmentForecast({ currentAdmissions, totalStudents }: EnrollmentForecastProps) {
  const [tuitionFee, setTuitionFee] = useState([12000]) // Average annual tuition
  const [marketingSpend, setMarketingSpend] = useState([50]) // Scale 0-100

  // "What-If" Logic
  const simData = useMemo(() => {
    const feeImpact = 1 - ((tuitionFee[0] - 12000) / 24000) // Higher fee = lower growth
    const marketingImpact = 1 + (marketingSpend[0] / 100)
    const combinedGrowthFactor = feeImpact * marketingImpact

    const baseGrowth = currentAdmissions
    const projectedGrowth = Math.round(baseGrowth * combinedGrowthFactor)

    const chartData = [
      { name: 'Month 0', projected: totalStudents, revenue: totalStudents * (tuitionFee[0] / 12) },
      { name: 'Month 1', projected: totalStudents + (projectedGrowth * 0.2), revenue: (totalStudents + (projectedGrowth * 0.2)) * (tuitionFee[0] / 12) },
      { name: 'Month 2', projected: totalStudents + (projectedGrowth * 0.4), revenue: (totalStudents + (projectedGrowth * 0.4)) * (tuitionFee[0] / 12) },
      { name: 'Month 3', projected: totalStudents + (projectedGrowth * 0.6), revenue: (totalStudents + (projectedGrowth * 0.6)) * (tuitionFee[0] / 12) },
      { name: 'Month 4', projected: totalStudents + (projectedGrowth * 0.8), revenue: (totalStudents + (projectedGrowth * 0.8)) * (tuitionFee[0] / 12) },
      { name: 'Month 5', projected: totalStudents + projectedGrowth, revenue: (totalStudents + projectedGrowth) * (tuitionFee[0] / 12) },
    ]

    return { chartData, projectedGrowth, totalRevenue: chartData[5].revenue * 12 }
  }, [currentAdmissions, totalStudents, tuitionFee, marketingSpend])

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{payload[0].payload.name}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Enrollment</span>
              <span className="text-sm font-black text-white">{Math.round(payload[0].payload.projected)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Monthly Rev</span>
              <span className="text-sm font-black text-emerald-500">{formatCurrency(payload[0].payload.revenue)}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-slate-950 border-white/10 shadow-2xl overflow-hidden relative group">
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/20">
              <Target className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-white italic uppercase tracking-tighter">AI Growth & Revenue Simulator</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Predictive scaling & what-if analysis</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 text-[9px] font-black uppercase tracking-widest">
            Simulation Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 space-y-8 pt-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Simulation Sliders */}
          <div className="space-y-6 lg:border-r border-white/5 lg:pr-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Annual Tuition Fee</span>
                <span className="text-xs font-black text-white">{formatCurrency(tuitionFee[0])}</span>
              </div>
              <Slider value={tuitionFee} onValueChange={setTuitionFee} min={5000} max={30000} step={500} className="py-2" />
              <p className="text-[8px] font-bold text-slate-500 mt-2 italic">*Higher fees impact enrollment velocity</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marketing Aggression</span>
                <span className="text-xs font-black text-primary">{marketingSpend[0]}%</span>
              </div>
              <Slider value={marketingSpend} onValueChange={setMarketingSpend} min={0} max={100} step={5} className="py-2" />
              <p className="text-[8px] font-bold text-slate-500 mt-2 italic">*Increased spend scales with linear efficiency</p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Projected Annual Revenue</p>
                <h4 className="text-2xl font-black text-emerald-500 tracking-tighter">{formatCurrency(simData.totalRevenue)}</h4>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Enrollment Target Delta</p>
                <h4 className="text-2xl font-black text-white tracking-tighter">+{simData.projectedGrowth} Seats</h4>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simData.chartData}>
                  <defs>
                    <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProjected)"
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#020617' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AI Optimization Suggestion</p>
                <p className="text-[11px] font-bold text-slate-400 italic">
                  At {formatCurrency(tuitionFee[0])}, a {marketingSpend[0]}% marketing push yields optimal ROI before saturation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

