'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingDown,
  AlertTriangle,
  Users,
  UserMinus,
  ShieldAlert,
  GraduationCap,
  ChevronUp,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { API_URL } from '@/lib/api-config'

const retentionTrends = [
  { month: 'Jan', retention: 97.5, attrition: 2.5, risk: 1.8 },
  { month: 'Feb', retention: 97.2, attrition: 2.8, risk: 2.1 },
  { month: 'Mar', retention: 97.8, attrition: 2.2, risk: 1.6 },
  { month: 'Apr', retention: 98.1, attrition: 1.9, risk: 1.3 },
  { month: 'May', retention: 98.3, attrition: 1.7, risk: 1.1 },
  { month: 'Jun', retention: 98.5, attrition: 1.5, risk: 0.9 },
]

export default function RetentionAttritionAnalytics() {
  const [riskData, setRiskData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/analytics/predictions/risk-assessment`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          setRiskData(data)
        }
      } catch (error) {
        console.error('Error fetching risk data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRiskData()
  }, [])

  if (loading) {
    return (
      <Card className="bg-card border-border/50 shadow-sm h-[600px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </Card>
    )
  }

  const highRiskStudents = riskData.filter(r => r.status === 'High')
  const avgRisk = riskData.length > 0 ? riskData.reduce((acc, r) => acc + r.riskScore, 0) / riskData.length : 0
  const retentionRate = (100 - (avgRisk * 0.1)).toFixed(1)

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary" />
              Retention & Attrition
            </CardTitle>
            <CardDescription>AI-Driven predictive risk monitoring</CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-bold uppercase tracking-widest text-[10px]">
            AI Prediction Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Avg Retention', value: `${retentionRate}%`, trend: '+0.5%', up: true, icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Predicted Attrition', value: `${(100 - parseFloat(retentionRate)).toFixed(1)}%`, trend: '-0.2%', up: false, icon: UserMinus, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'High Risk Students', value: highRiskStudents.length.toString(), trend: 'Critical', up: false, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="bg-secondary/30 rounded-xl p-4 border border-transparent hover:border-border/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <Badge variant="secondary" className={`text-[10px] font-bold ${stat.up ? 'text-green-600' : 'text-orange-600'} bg-transparent p-0`}>
                  {stat.up ? <ChevronUp className="w-3 h-3 inline mr-0.5" /> : <ChevronDown className="w-3 h-3 inline mr-0.5" />}
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-xl font-black text-foreground">{stat.value}</h4>
            </div>
          ))}
        </div>

        <div className="w-full h-[250px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={retentionTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRetention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Area type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorRetention)" name="Retention %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-black text-foreground uppercase tracking-widest">At-Risk Student Watchlist</h4>
          </div>
          <div className="grid gap-3">
            {highRiskStudents.length > 0 ? highRiskStudents.slice(0, 4).map((student: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-red-500/5 hover:bg-red-500/10 rounded-xl p-4 transition-all duration-300 border border-red-500/10 hover:border-red-500/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground">{student.studentName}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{student.grade}</span>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-[10px] font-black uppercase px-2 py-0">High Risk</Badge>
                    <p className="text-[10px] font-bold text-red-600 mt-1">Score: {student.riskScore}%</p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${student.riskScore}%` }} />
                </div>
              </motion.div>
            )) : (
              <p className="text-center py-4 text-sm text-muted-foreground italic">No high-risk students identified currently.</p>
            )}
          </div>
        </div>

        {highRiskStudents.length > 0 && (
          <div className="relative overflow-hidden bg-red-500/5 rounded-2xl p-4 border border-red-500/20 flex gap-4 transition-all hover:bg-red-500/10">
            <div className="p-3 bg-red-500/20 rounded-xl h-fit">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-black text-red-900 mb-1 tracking-tight">Executive Intervention Recommended</p>
              <p className="text-xs text-red-800/80 font-medium leading-relaxed">
                {highRiskStudents.length} students are showing critical drops in attendance and grades. <span className="font-bold underline decoration-red-500/30">Review detailed academic trends immediately</span>.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
