'use client'

import { useState, useEffect, useMemo } from 'react'
import { io } from 'socket.io-client'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { Button } from '@/components/ui/button'
import {
  GraduationCap,
  LogOut,
  Menu,
  Users,
  BookOpen,
  MessageSquare,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ChevronRight
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { SOCKET_URL } from '@/lib/api-config'

import AdmissionsAnalytics from '@/components/dashboard/AdmissionsAnalytics'
import StaffDetails from '@/components/dashboard/StaffDetails'
import ParentQueries from '@/components/dashboard/ParentQueries'
import CEOSidebar from '@/components/dashboard/CEOSidebar'
import InstitutionalHealthIndex from '@/components/dashboard/InstitutionalHealthIndex'
import LearningOutcomeGrowth from '@/components/dashboard/LearningOutcomeGrowth'
import RetentionAttritionAnalytics from '@/components/dashboard/RetentionAttritionAnalytics'
import ParentTrustIndex from '@/components/dashboard/ParentTrustIndex'
import TeachingEffectiveness from '@/components/dashboard/TeachingEffectiveness'
import StudentPerformanceOverview from '@/components/dashboard/StudentPerformanceOverview'
import Achievements from '@/components/dashboard/Achievements'
import StudentAchievements from '@/components/dashboard/StudentAchievements'
import SentimentPulse from '@/components/dashboard/SentimentPulse'
import StrategicRadar from '@/components/dashboard/StrategicRadar'
import AIInsights from '@/components/dashboard/AIInsights'
import EnrollmentForecast from '@/components/dashboard/EnrollmentForecast'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DashboardPageProps {
  onLogout: () => void
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'student-performance') => void
}

import { ExportMenu } from '@/components/ui/export-menu'

export default function DashboardPage({ onLogout, onNavigate }: DashboardPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const { staff, admissions, queries } = useData()
  const [studentsCount, setStudentsCount] = useState(0)
  const [drillDownType, setDrillDownType] = useState<'students' | 'staff' | 'admissions' | 'queries' | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [widgetOrder, setWidgetOrder] = useState(['health', 'ai-briefing', 'growth-forecast', 'retention', 'trust', 'teaching', 'performance', 'student-achievements', 'operations', 'school-achievements', 'feedback', 'sentiment'])
  const [healthData, setHealthData] = useState<any>(null)

  useEffect(() => {
    // Socket.io Connection
    const socket = io(SOCKET_URL)

    socket.on('connect', () => {
      console.log('Quantum Link Synchronized')
    })

    socket.on('newAdmission', (data) => {
      console.log('Real-time Telemetry: New Admission Received', data)
      handleSync() // Refresh data visualizer
    })

    socket.on('updateAdmission', (data) => {
      console.log('Real-time Telemetry: Admission Update Received', data)
      handleSync()
    })

    socket.on('health_index_updated', (data) => {
      console.log('Real-time Telemetry: Health Index Recalculated', data)
      handleSync()
    })

    socket.on('newQuery', (data) => {
      console.log('Real-time Telemetry: New Parent Query Logged', data)
      handleSync()
    })

    const savedStudents = localStorage.getItem('students')
    if (savedStudents) {
      setStudentsCount(JSON.parse(savedStudents).length)
    }

    const savedLayout = localStorage.getItem('ceo_layout')
    if (savedLayout) {
      setWidgetOrder(JSON.parse(savedLayout))
    }

    return () => {
      socket.disconnect()
    }
  }, [])

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => setIsSyncing(false), 2000)
  }

  const filteredStats = useMemo(() => {
    const baseStats = [
      { id: 'students' as const, label: 'Total Students', value: studentsCount, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { id: 'staff' as const, label: 'Total Staff', value: staff.length, icon: Users, color: 'text-purple-500', bg: 'bg-purple-100/10' },
      { id: 'admissions' as const, label: 'Admissions', value: admissions.length, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { id: 'queries' as const, label: 'Open Queries', value: queries.filter(q => q.status === 'Open').length, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]
    if (!searchQuery) return baseStats
    return baseStats.filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery, studentsCount, staff, admissions, queries])

  // Quantum Results (Entities)
  const quantumResults = useMemo(() => {
    if (searchQuery.length < 2) return []
    const q = searchQuery.toLowerCase()
    const results: Array<{ type: string; label: string; sub: string }> = []

    // Search Staff
    staff.filter(s => s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)).slice(0, 3).forEach(s => {
      results.push({ type: 'Staff', label: s.name, sub: s.department })
    })

    // Search Admissions
    admissions.filter(a => a.studentName.toLowerCase().includes(q)).slice(0, 2).forEach(a => {
      results.push({ type: 'Admission', label: a.studentName, sub: a.appliedFor })
    })

    // Search Sections
    const sections = ['Institutional Vitality', 'Outcomes & Retention', 'Academic Deep Dive']
    sections.filter(s => s.toLowerCase().includes(q)).forEach(s => {
      results.push({ type: 'Sector', label: s, sub: 'Navigate to section' })
    })

    return results
  }, [searchQuery, staff, admissions])

  const onDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(widgetOrder)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setWidgetOrder(items)
    localStorage.setItem('ceo_layout', JSON.stringify(items))
  }

  const renderWidget = (id: string) => {
    switch (id) {
      case 'health':
        return (
          <section key="health" className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Institutional Vitality</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60 mt-1">Real-time health telemetry</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                Full Telemetry <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <InstitutionalHealthIndex onDataLoad={setHealthData} />
              <div className="space-y-8">
                <StrategicRadar data={healthData?.currentHealth} />
                <SentimentPulse queries={queries} />
              </div>
            </div>
          </section>
        )
      case 'growth': return null // Combined in health for layout
      case 'ai-briefing':
        return (
          <section key="ai-briefing" className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1.5 h-10 bg-slate-900 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Tactical Oversight</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60 mt-1">AI Anomalies & Insights</p>
              </div>
            </div>
            <AIInsights stats={{
              attendanceRiskCount: 8, // Mocked based on current system data
              enrollmentGrowth: 18,
              pendingQueries: queries.filter(q => q.status === 'Open').length,
              sentimentTrend: 'Improving'
            }} />
          </section>
        )
      case 'growth-forecast':
        return (
          <section key="growth-forecast" className="space-y-6 px-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic leading-none">Enrollment Projection</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60 mt-1">Predictive growth vectors</p>
              </div>
            </div>
            <EnrollmentForecast currentAdmissions={admissions.filter(a => a.status === 'Pending').length} totalStudents={studentsCount} />
          </section>
        )
      case 'retention':
        return (
          <section key="retention" className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-accent rounded-full shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">Outcomes & Retention</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Attrition vectors & trust index</p>
                </div>
              </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <RetentionAttritionAnalytics />
              <ParentTrustIndex />
            </div>
          </section>
        )
      case 'performance':
        return (
          <section key="performance" className="space-y-6 px-2">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-10 bg-purple-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">Academic Deep Dive</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Hyper-granular performance metrics</p>
              </div>
            </div>
            <StudentPerformanceOverview />
          </section>
        )
      case 'student-achievements':
        return (
          <section key="student-achievements" className="space-y-6 px-2">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-10 bg-yellow-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">Student Achievements & Competitions</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Academic and Extracurricular Excellence</p>
              </div>
            </div>
            <StudentAchievements isEditable={false} />
          </section>
        )
      case 'operations':
        return (
          <section key="operations" className="space-y-6 px-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-10 bg-indigo-500 rounded-full" />
                <div>
                  <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">Operations Analytics</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Admissions Pipeline & Staff Demographics</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <AdmissionsAnalytics />
              <StaffDetails />
            </div>
          </section>
        )
      case 'school-achievements':
        return (
          <section key="school-achievements" className="space-y-6 px-2">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">School Achievements</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Institutional Recognition & Milestones</p>
              </div>
            </div>
            <Achievements />
          </section>
        )
      case 'feedback':
        return (
          <section key="feedback" className="space-y-6 px-2">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-1.5 h-10 bg-rose-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase italic px-1">Stakeholder Feedback</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">Parent Queries & Satisfaction</p>
              </div>
            </div>
            <ParentQueries />
          </section>
        )
      case 'sentiment':
        return null // Integrated in health section for layout symmetry
      default: return null
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar */}
      <CEOSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={onNavigate} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-card/40 backdrop-blur-2xl border-b border-white/5 dark:border-slate-800/50 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-500" />
            </button>
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/20 rounded-2xl border border-primary/20 shadow-lg shadow-primary/10">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-foreground uppercase italic px-1">CEO Hub</h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Intelligence Suite</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 dark:bg-slate-900/60 rounded-2xl border border-white/5 dark:border-slate-800/50 shadow-inner group cursor-pointer hover:border-primary/30 transition-all duration-500"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-primary rounded-full absolute inset-0"
                />
                <div className="w-2 h-2 bg-primary rounded-full" />
              </div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Quantum Link Active</span>
            </motion.div>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="rounded-2xl hover:bg-destructive/10 hover:text-destructive group border border-transparent hover:border-destructive/20 h-10 px-5 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
            </Button>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="bg-card/20 backdrop-blur-md border-b border-white/5 dark:border-slate-800/30 px-8 py-4 flex flex-wrap items-center justify-between gap-6 sticky top-[73px] z-20">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search KPI Intelligence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-white/5 dark:bg-slate-950/40 border-white/5 dark:border-slate-800/50 h-11 rounded-2xl focus:ring-primary/20 focus:border-primary/40 transition-all font-bold text-xs"
              />

              {/* Quantum Search Results Dropdown */}
              <AnimatePresence>
                {quantumResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full mt-2 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      {quantumResults.map((res, i) => (
                        <button
                          key={i}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 group transition-all text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-2 py-0.5 rounded-md bg-white/5 text-[8px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors">
                              {res.type}
                            </div>
                            <div>
                              <p className="text-[11px] font-black text-white uppercase tracking-tighter">{res.label}</p>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{res.sub}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px] h-11 bg-white/5 dark:bg-slate-950/40 border-white/5 dark:border-slate-800/50 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                <SelectValue placeholder="Epoch Selection" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-800 bg-slate-950/90 backdrop-blur-xl">
                <SelectItem value="24h" className="text-[10px] font-black uppercase">Cycle: 24h</SelectItem>
                <SelectItem value="7d" className="text-[10px] font-black uppercase">Cycle: 7d</SelectItem>
                <SelectItem value="30d" className="text-[10px] font-black uppercase">Cycle: 30d</SelectItem>
                <SelectItem value="90d" className="text-[10px] font-black uppercase">Cycle: Quarter</SelectItem>
              </SelectContent>
            </Select>
            <ExportMenu data={{
              stats: {
                studentsCount,
                staffCount: staff.length,
                admissionsCount: admissions.length,
                queriesCount: queries.filter(q => q.status === 'Open').length
              },
              healthData
            }} />
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="h-11 px-6 rounded-2xl gap-2 border-white/10 dark:border-slate-800/50 bg-white/5 dark:bg-slate-950/40 font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
            >
              <motion.div
                animate={isSyncing ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              {isSyncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          </div>
        </div>

        {/* Dashboard content */}
        <main className="flex-1 overflow-auto bg-[#F8FAFC] dark:bg-[#020617] relative">
          {/* Subtle Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/20 rounded-full blur-[100px]" />
          </div>

          <div className="p-8 space-y-10 max-w-[1700px] mx-auto relative z-10">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 border border-white/10 p-12 text-white shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-accent/40 opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">Executive Privilege Alpha</span>
                </div>
                <h2 className="text-5xl font-black tracking-tighter leading-none italic uppercase">System<br /><span className="text-primary not-italic">Oversight</span></h2>
                <p className="text-white/60 text-lg font-bold leading-relaxed max-w-xl">
                  Unified multi-vector monitoring of institutional vitality, student outcomes, and operational velocity.
                </p>
              </div>
              <TrendingUp className="absolute bottom-[-10%] right-[-5%] w-80 h-80 text-white/5 group-hover:scale-110 transition-transform duration-1000 origin-bottom-right" />
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredStats.map((stat) => (
                <Card
                  key={stat.label}
                  onClick={() => setDrillDownType(stat.id)}
                  className="group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500 border-white/5 dark:border-slate-800/50 relative overflow-hidden bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl cursor-pointer active:scale-95 hover:border-primary/30"
                >
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-3 duration-500 shadow-lg shadow-black/5`}>
                        <stat.icon className="w-7 h-7" />
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60 px-1">{stat.label}</p>
                        <h4 className="text-4xl font-black text-foreground tracking-tighter tabular-nums">{stat.value}</h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <TrendingUp className="w-3 h-3" />
                        <span>+12.5%</span>
                      </div>
                      <span className="opacity-40 italic">Vector Growth</span>
                    </div>
                  </CardContent>
                  <div className={`absolute bottom-0 left-0 w-full h-1.5 ${stat.color.replace('text', 'bg')} opacity-0 group-hover:opacity-40 transition-opacity`} />
                </Card>
              ))}
            </div>

            {/* Drag & Drop Dynamic Grid */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard-widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid gap-12"
                  >
                    {widgetOrder.filter(id => id !== 'growth').map((id, index) => (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`transition-shadow p-2 rounded-[2rem] hover:bg-white/5 dark:hover:bg-slate-900/20 group relative ${snapshot.isDragging ? 'z-50 shadow-2xl bg-slate-900/40 backdrop-blur-xl' : ''}`}
                          >
                            <div {...provided.dragHandleProps} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-xl cursor-grab active:cursor-grabbing z-20">
                              <Menu className="w-4 h-4 text-muted-foreground" />
                            </div>
                            {renderWidget(id)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </main>
      </div>

      {/* KPI Drill-Down Modal */}
      <Dialog open={!!drillDownType} onOpenChange={() => setDrillDownType(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white/70 dark:bg-slate-950/80 backdrop-blur-3xl border-white/10 dark:border-slate-800/50 rounded-[2.5rem] shadow-2xl">
          <div className="p-8 sm:p-12 space-y-8">
            <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-4 rounded-2xl ${drillDownType === 'students' ? 'bg-blue-500/20 text-blue-500' :
                  drillDownType === 'staff' ? 'bg-purple-500/20 text-purple-500' :
                    drillDownType === 'admissions' ? 'bg-emerald-500/20 text-emerald-500' :
                      'bg-amber-500/20 text-amber-500'
                  }`}>
                  {drillDownType === 'students' && <GraduationCap className="w-8 h-8" />}
                  {drillDownType === 'staff' && <Users className="w-8 h-8" />}
                  {drillDownType === 'admissions' && <BookOpen className="w-8 h-8" />}
                  {drillDownType === 'queries' && <MessageSquare className="w-8 h-8" />}
                </div>
                <div>
                  <DialogTitle className="text-4xl font-black tracking-tighter uppercase italic px-1">
                    {drillDownType === 'students' ? 'Student Inventory' :
                      drillDownType === 'staff' ? 'Staff Directory' :
                        drillDownType === 'admissions' ? 'Admission Pipeline' :
                          'Stakeholder Queries'}
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 px-1">
                    System-wide data drill-down vector
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="h-[500px] w-full rounded-2xl border border-white/5 dark:border-slate-800/30 bg-white/20 dark:bg-slate-900/20 p-6">
              <div className="space-y-4">
                {drillDownType === 'students' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-white/30 dark:bg-slate-800/40 border border-white/5 flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">S</div>
                          <div>
                            <p className="text-xs font-black uppercase text-foreground">Student Name {i + 1}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Class {6 + (i % 7)} - Section {['A', 'B', 'C'][i % 3]}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500 border-none">Active</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {/* Fallback/Placeholder for others */}
                {drillDownType !== 'students' && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                      <RefreshCw className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-widest text-foreground">Data Stream Encrypted</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter mt-1 opacity-60">Vector expansion in progress...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setDrillDownType(null)}
                className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                Terminate View
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
