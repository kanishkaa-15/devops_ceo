'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, Loader2, ClipboardCheck, Clock, XCircle, BarChart3, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'

export default function AdmissionsAnalytics() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAdmissionsData()
  }, [])

  const fetchAdmissionsData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/analytics/admissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching admissions analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50 shadow-sm animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-secondary rounded mb-2" />
          <div className="h-4 w-48 bg-secondary rounded" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </CardContent>
      </Card>
    )
  }

  const approvalRate = data?.totalAdmissions > 0
    ? ((data.approvedAdmissions / data.totalAdmissions) * 100).toFixed(1)
    : '0'

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Admission Funnel</CardTitle>
            <CardDescription>Pipeline & conversion metrics</CardDescription>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardCheck className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data || data.totalAdmissions === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4">
            <div className="p-4 bg-secondary/50 rounded-full">
              <BarChart3 className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No admissions data available for this period.</p>
          </div>
        ) : (
          <>
            {/* Hero Metric: Approval Rate */}
            <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-2xl p-6 border border-emerald-500/10 text-center relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Conversion Rate</p>
                <h4 className="text-4xl font-black text-emerald-600">{approvalRate}%</h4>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 group-hover:translate-x-1 transition-transform">Target: 85% +</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            </div>

            {/* Split Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Apps', value: data.totalAdmissions, icon: ClipboardCheck, color: 'text-foreground', bg: 'bg-secondary/30' },
                { label: 'Approved', value: data.approvedAdmissions, icon: ArrowUp, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Pending', value: data.pendingAdmissions, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Rejected', value: data.rejectedAdmissions, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
              ].map((stat, idx) => (
                <div key={idx} className={`${stat.bg} rounded-xl p-4 border border-transparent transition-all hover:border-border/50`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-1.5 rounded-lg ${stat.color} bg-white/50 dark:bg-black/20`}>
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter h-4 px-1 leading-none">Real-time</Badge>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mb-0.5">{stat.label}</p>
                  <h4 className={`text-xl font-black ${stat.color}`}>{stat.value}</h4>
                </div>
              ))}
            </div>

            {/* Visual Funnel (Simulated) */}
            <div className="pt-2">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Yield Progress</span>
                <span className="text-[10px] font-bold text-primary">{((data.approvedAdmissions / data.totalAdmissions) * 100).toFixed(0)}% Yield</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(data.approvedAdmissions / data.totalAdmissions) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
