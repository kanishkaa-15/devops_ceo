'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, Users, Award, Target, MessageCircle, ChevronRight, GraduationCap } from 'lucide-react'

const teacherData = [
  { id: 'T001', name: 'Dr. Sarah Johnson', grade: '10', subject: 'Mathematics', growth: 92, engagement: 88, completion: 98, peer: 4.8, status: 'Excellent' },
  { id: 'T002', name: 'Mr. James Smith', grade: '9', subject: 'Science', growth: 87, engagement: 85, completion: 95, peer: 4.5, status: 'Good' },
  { id: 'T003', name: 'Ms. Emily Davis', grade: '8', subject: 'English', growth: 89, engagement: 90, completion: 96, peer: 4.7, status: 'Excellent' },
  { id: 'T004', name: 'Mr. Robert Brown', grade: '7', subject: 'History', growth: 82, engagement: 80, completion: 92, peer: 4.2, status: 'Good' },
  { id: 'T005', name: 'Ms. Lisa Wilson', grade: '6', subject: 'Languages', growth: 91, engagement: 92, completion: 99, peer: 4.9, status: 'Excellent' },
]

const performanceMetrics = [
  { metric: 'Student Growth', value: 88.2 },
  { metric: 'Engagement', value: 87 },
  { metric: 'Completion', value: 96 },
  { metric: 'Peer Review', value: 4.6 },
]

const scatterData = teacherData.map((teacher) => ({
  x: teacher.engagement,
  y: teacher.growth,
  name: teacher.name,
  fill: teacher.status === 'Excellent' ? 'var(--color-chart-1)' : 'var(--color-chart-2)',
}))

export default function TeachingEffectiveness() {
  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Teaching Excellence</CardTitle>
            <CardDescription>Pedagogical impact & engagement</CardDescription>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Award className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Efficiency Hero Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Avg Student Growth', value: '88.2', trend: 'Strong Progress', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Engagement Index', value: '87%', trend: 'Excellent', icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
          ].map((item) => (
            <div key={item.label} className="group relative overflow-hidden bg-secondary/30 rounded-2xl p-5 border border-transparent hover:border-border/50 transition-all">
              <div className="flex items-center gap-4 relative z-10">
                <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <h4 className="text-2xl font-black text-foreground">{item.value}</h4>
                  <p className={`text-[10px] font-bold ${item.color} mt-1`}>↑ {item.trend}</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            </div>
          ))}
        </div>

        {/* Horizontal Performance Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3 h-3" /> Capability Benchmarking
            </h4>
            <Badge variant="outline" className="text-[9px] font-bold uppercase">Departmental Avg</Badge>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceMetrics} layout="vertical" margin={{ left: -20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="metric"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Elite Teachers List */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <GraduationCap className="w-3 h-3" /> Top Performing Faculty
          </h4>
          <div className="grid gap-3">
            {teacherData.slice(0, 3).map((teacher, idx) => (
              <div key={idx} className="group flex items-center gap-4 bg-secondary/20 hover:bg-secondary/40 rounded-xl p-4 transition-all duration-300 border border-transparent hover:border-border/50">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center font-black text-primary text-sm shadow-sm">
                    {teacher.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm leading-tight mb-0.5">{teacher.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{teacher.grade} — {teacher.subject}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[9px] px-1.5">{teacher.status}</Badge>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-xs font-black text-foreground">{teacher.growth}%</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Development Opportunity Alert */}
        <div className="group relative overflow-hidden bg-blue-500/5 rounded-2xl p-4 border border-blue-500/20 flex gap-4 transition-all hover:bg-blue-500/10">
          <div className="p-3 bg-blue-500/20 rounded-xl h-fit group-hover:rotate-12 transition-transform">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-black text-blue-900 mb-1 tracking-tight">Mentorship Opportunity</p>
            <p className="text-xs text-blue-800/80 font-medium leading-relaxed">
              <span className="font-bold">Robert Brown</span> requires focus on <span className="underline decoration-blue-500/30">syllabus completion tracking</span>. Peer mentoring with Sarah Johnson is recommended.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
        </div>
      </CardContent>
    </Card>
  )
}
