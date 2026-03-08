'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DeltaBadge } from '@/components/ui/delta-badge'
import { API_URL } from '@/lib/api-config'

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'LOW':
      return 'text-green-500'
    case 'MEDIUM':
      return 'text-yellow-500'
    case 'HIGH':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

const getRiskBgColor = (risk: string) => {
  switch (risk) {
    case 'LOW':
      return 'bg-green-500/10'
    case 'MEDIUM':
      return 'bg-yellow-500/10'
    case 'HIGH':
      return 'bg-red-500/10'
    default:
      return 'bg-gray-500/10'
  }
}

interface IHealthData {
  currentHealth: {
    academic: number;
    financial: number;
    wellbeing: number;
    efficiency: number;
    overall: number;
    riskLevel: string;
  };
  deltas: {
    academic: number;
    financial: number;
    wellbeing: number;
    efficiency: number;
    overall: number;
  };
  historicalData: Array<{
    month: string;
    academic: number;
    financial: number;
    wellbeing: number;
    efficiency: number;
  }>;
}

export default function InstitutionalHealthIndex({ onDataLoad }: { onDataLoad?: (data: IHealthData) => void }) {
  const [data, setData] = useState<IHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthIndex = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/analytics/health-index`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
          if (onDataLoad) {
            onDataLoad(result);
          }
        }
      } catch (error) {
        console.error('Failed to fetch health index:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthIndex();
  }, [onDataLoad]);

  if (loading || !data) {
    return (
      <Card className="bg-card border-border/50 shadow-sm h-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Telemetry...</p>
        </div>
      </Card>
    );
  }

  const { currentHealth, deltas, historicalData } = data;

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Institutional Health Index (IHI)</CardTitle>
            <CardDescription>Comprehensive school wellness assessment</CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20 gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Update
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall health indicator */}
        <div className={`relative overflow-hidden rounded-xl p-5 border border-border/50 ${getRiskBgColor(currentHealth.riskLevel)}`}>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Overall Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black ${getRiskColor(currentHealth.riskLevel)}`}>
                  {currentHealth.overall.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="p-3 bg-white/50 dark:bg-black/20 rounded-2xl backdrop-blur-sm shadow-inner">
                {currentHealth.riskLevel === 'LOW' && <CheckCircle className="w-8 h-8 text-green-500" />}
                {currentHealth.riskLevel === 'MEDIUM' && <AlertCircle className="w-8 h-8 text-yellow-500" />}
                {currentHealth.riskLevel === 'HIGH' && <AlertTriangle className="w-8 h-8 text-red-500" />}
              </div>
              <DeltaBadge value={deltas.overall} label="MoM" inverse={currentHealth.riskLevel === 'HIGH'} />
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full ${currentHealth.riskLevel === 'LOW' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : currentHealth.riskLevel === 'MEDIUM' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}
                style={{ width: `${currentHealth.overall}%` }}
              />
            </div>
            <span className={`text-xs font-black ${getRiskColor(currentHealth.riskLevel)} whitespace-nowrap tracking-wider`}>
              {currentHealth.riskLevel} RISK
            </span>
          </div>

          {/* Decorative background circle */}
          <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full opacity-10 blur-xl ${currentHealth.riskLevel === 'LOW' ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        {/* Component scores */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'academic', label: 'Academic Health', value: currentHealth.academic, delta: deltas.academic, status: 'Strong', color: 'text-blue-500' },
            { id: 'financial', label: 'Financial Health', value: currentHealth.financial, delta: deltas.financial, status: 'Strong', color: 'text-emerald-500' },
            { id: 'wellbeing', label: 'Student Wellbeing', value: currentHealth.wellbeing, delta: deltas.wellbeing, status: 'Stable', color: 'text-purple-500' },
            { id: 'efficiency', label: 'Staff Efficiency', value: currentHealth.efficiency, delta: deltas.efficiency, status: 'Excellent', color: 'text-amber-500' },
          ].map((item) => (
            <div key={item.label} className="group bg-secondary/30 hover:bg-secondary/50 rounded-xl p-4 transition-colors border border-transparent hover:border-border/50 relative overflow-hidden">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-black text-foreground">{item.value.toFixed(1)}</p>
                <div className="h-8 w-1.5 bg-muted group-hover:bg-primary/30 rounded-full transition-colors" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className={`text-[10px] font-bold ${item.color} flex items-center gap-1`}>
                  <TrendingUp className="w-3 h-3" /> {item.status}
                </p>
                <DeltaBadge value={item.delta} />
              </div>
              <div className={`absolute bottom-0 left-0 w-full h-1 ${item.color.replace('text', 'bg')} opacity-0 group-hover:opacity-20 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-[280px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: `1px solid hsl(var(--border))`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 700, marginBottom: '4px' }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 10 }}
              />
              <Line type="monotone" dataKey="academic" stroke="hsl(var(--primary))" name="Academic" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="financial" stroke="hsl(var(--accent))" name="Financial" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="wellbeing" stroke="#a855f7" name="Wellbeing" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="efficiency" stroke="#f59e0b" name="Efficiency" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
