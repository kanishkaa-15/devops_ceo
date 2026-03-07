'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  LogOut,
  MessageSquare,
  TrendingUp,
  User,
  Bell,
  Calendar,
  Sparkles,
  Search,
  Send,
  ArrowRight,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '@/context/DataContext'
import { useToast } from '@/hooks/use-toast'
import StudentDetailedPerformance from '@/components/dashboard/StudentDetailedPerformance'
import SchoolAnnouncements from '@/components/dashboard/SchoolAnnouncements'
import UpcomingEvents from '@/components/dashboard/UpcomingEvents'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ParentDashboardProps {
  onLogout: () => void
}

export default function ParentDashboardPage({ onLogout }: ParentDashboardProps) {
  const { toast } = useToast()
  const { queries: globalQueries, addQuery } = useData()
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [newQuery, setNewQuery] = useState({
    subject: '',
    message: '',
    priority: 'Medium'
  })

  // Derive this parent's specific queries from the global context
  const queries = globalQueries.filter(q => q.studentName === studentName)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      const identifier = userData.name || userData.email

      if (userData.activeStudentId) {
        // Use student selected during login
        const student = {
          studentId: userData.activeStudentId,
          studentName: userData.activeStudentName || userData.name
        }
        setSelectedStudent(student)
        setStudentName(student.studentName)
        fetchPerformanceData(student.studentId, true)

        // Still fetch all students to populate secondary switcher if needed
        fetchParentStudents(identifier, userData.activeStudentId)
      } else {
        fetchParentStudents(identifier)
      }
    }
  }, [])

  const fetchParentStudents = async (parentIdentifier: string, preSelectedId?: string) => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/admissions/parent/${encodeURIComponent(parentIdentifier)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStudents(data)

      setStudents(data)

      if (data.length > 0 && !preSelectedId) {
        // Only auto-select if nothing was selected during login
        const first = data[0]
        setSelectedStudent(first)
        setStudentName(first.studentName)
        fetchPerformanceData(first.studentId || first.studentName, !!first.studentId)
      } else if (preSelectedId) {
        const selected = data.find((s: any) => s.studentId === preSelectedId)
        if (selected) {
          setSelectedStudent(selected)
          setStudentName(selected.studentName)
        }
      }
    } catch (error) {
      console.error('Error fetching parent students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student)
    setStudentName(student.studentName)
    fetchPerformanceData(student.studentId || student.studentName, !!student.studentId)
    // Optional: Reset tab or other state
  }

  const fetchPerformanceData = async (identifier: string, isId: boolean = false) => {
    if (!identifier) return
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const endpoint = isId ? `grades/id/${identifier}` : `grades/${encodeURIComponent(identifier)}`
      const token = localStorage.getItem('token')
      const response = await fetch(`${apiUrl}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      // Transform data for charts: Group by date/title
      const chartData = data.reduce((acc: any[], grade: any) => {
        const date = new Date(grade.date).toLocaleDateString('default', { month: 'short', day: 'numeric' })
        let existing = acc.find(item => item.date === date)
        if (!existing) {
          existing = { date }
          acc.push(existing)
        }
        existing[grade.subject] = grade.score
        return acc
      }, [])

      setPerformanceData(chartData)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    }
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')

      const payload = {
        parentName: user.name,
        studentName: user.studentName,
        email: user.email,
        phone: 'N/A',
        subject: newQuery.subject,
        message: newQuery.message,
        priority: newQuery.priority,
        status: 'Open'
      }

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const savedQuery = await response.json()
        // Inject into global context immediately for snappy UX
        // The backend `newQuery` socket event will handle pushing it to the Admin / CEO
        addQuery(savedQuery)
        setNewQuery({ subject: '', message: '', priority: 'Medium' })
      }
    } catch (error) {
      console.error('Error submitting query:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-800'
      case 'Open': return 'bg-amber-100 text-amber-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-amber-100 text-amber-800'
      case 'Low': return 'bg-emerald-100 text-emerald-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleDownloadReport = async (reportTitle: string) => {
    try {
      const doc = new jsPDF()
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const identifier = selectedStudent?.studentId || selectedStudent?.studentName
      const isId = !!selectedStudent?.studentId

      // Fetch latest data for report
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [attendanceRes, gradesRes] = await Promise.all([
        fetch(isId ? `${apiUrl}/attendance/id/${identifier}` : `${apiUrl}/attendance/${encodeURIComponent(identifier)}`, { headers }),
        fetch(isId ? `${apiUrl}/grades/id/${identifier}` : `${apiUrl}/grades/${encodeURIComponent(identifier)}`, { headers })
      ])

      const attendanceData = await attendanceRes.json()
      const gradesData = await gradesRes.json()

      const safeGrades = Array.isArray(gradesData) ? gradesData : []
      const safeAttendance = Array.isArray(attendanceData) ? attendanceData : []

      // Institutional Header
      doc.setFontSize(22)
      doc.setTextColor(0, 51, 102)
      doc.text('Academic Performance Report', 20, 20)

      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Report Type: ${reportTitle}`, 20, 28)
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 33)
      doc.line(20, 35, 190, 35)

      // Student Info
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Student Information', 20, 45)
      doc.setFontSize(10)
      doc.text(`Name: ${studentName}`, 25, 52)
      doc.text(`Student ID: ${selectedStudent?.studentId || 'N/A'}`, 25, 57)
      doc.text(`Assigned Class: ${selectedStudent?.grade || 'N/A'}`, 25, 62)
      doc.text(`Section: ${selectedStudent?.section || 'N/A'}`, 25, 67)

      // Performance Summary
      doc.setFontSize(14)
      doc.text('Assessment Summary', 20, 80)

      const tableRows = safeGrades.map((g: any) => [
        new Date(g.date).toLocaleDateString(),
        g.subject,
        g.title,
        g.score,
        g.grade
      ])

      autoTable(doc, {
        startY: 85,
        head: [['Date', 'Subject', 'Assessment', 'Score', 'Grade']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102], textColor: 255 },
        styles: { fontSize: 9 }
      })

      // Attendance
      const finalY = (doc as any).lastAutoTable?.cursor?.y || 150
      doc.setFontSize(14)
      doc.text('Attendance Statistics', 20, finalY + 15)

      const total = safeAttendance.length
      const present = safeAttendance.filter((a: any) => a.status === 'Present').length
      const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0'

      doc.setFontSize(10)
      doc.text(`Overall Attendance Rate: ${rate}%`, 25, finalY + 22)
      doc.text(`Total Sessions: ${total}`, 25, finalY + 27)
      doc.text(`Present: ${present}`, 25, finalY + 32)

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text('This is an electronically generated report from the Institutional Portal.', 20, 285)

      doc.save(`Report_${studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`)

      toast({
        title: "Report Downloaded",
        description: `Your academic report for ${studentName} is ready.`,
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Download Failed",
        description: "An error occurred while generating your report.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 shadow-inner"
            >
              <GraduationCap className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                Parent Dashboard
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0 bg-primary/5 text-primary border-primary/10">Portal</Badge>
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Student:
                </p>
                {students.length > 1 ? (
                  <Select
                    value={selectedStudent?.studentId || selectedStudent?.studentName}
                    onValueChange={(val) => {
                      const student = students.find(s => (s.studentId || s.studentName) === val)
                      if (student) handleStudentSelect(student)
                    }}
                  >
                    <SelectTrigger className="h-7 py-0 px-2 bg-secondary/50 border-none text-[11px] font-bold min-w-[150px]">
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(s => (
                        <SelectItem key={s.studentId || s._id} value={s.studentId || s.studentName} className="text-xs font-bold">
                          {s.studentName} ({s.studentId || 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[11px] font-bold text-foreground">
                    {studentName} {selectedStudent?.studentId ? `(${selectedStudent.studentId})` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all relative"
              onClick={() => alert("Notifications have been enabled for your browser!")}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 text-red-500 border-red-500/20 hover:bg-red-500/5 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Enhanced Welcome Banner */}
          <motion.div
            variants={itemVariants}
            className="group relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background border border-primary/20 rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-primary/5"
          >
            <div className="relative z-10 max-w-2xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1">Welcome Back</Badge>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-[1.1] tracking-tight">
                Empowering your child's <span className="text-primary italic">academic journey.</span>
              </h2>
              <p className="text-muted-foreground text-lg font-medium opacity-80 mb-8 leading-relaxed">
                Stay updated with real-time performance metrics, school announcements, and maintain direct communication with the faculty.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="rounded-2xl px-6 py-6 h-auto font-black text-[10px] uppercase tracking-widest gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95">
                  View Latest Reports
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="rounded-2xl px-6 py-6 h-auto font-black text-[10px] uppercase tracking-widest gap-2 border-border/50 hover:bg-secondary/50 transition-all">
                  Contact Support
                </Button>
              </div>
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
            <Sparkles className="absolute top-8 right-8 w-12 h-12 text-primary/20 animate-pulse pointer-events-none" />
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs Navigation */}
              <div className="flex items-center gap-1 p-1 bg-secondary/30 rounded-2xl w-fit border border-border/50">
                {['overview', 'performance', 'reports'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                      ? 'bg-background text-primary shadow-sm border border-border/50'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <StudentDetailedPerformance studentName={studentName} studentId={selectedStudent?.studentId} />
                    <SchoolAnnouncements />
                  </motion.div>
                )}

                {activeTab === 'performance' && (
                  <motion.div
                    key="performance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Academic Growth Trend
                        </CardTitle>
                        <CardDescription>Performance across all subjects over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                              <defs>
                                {['hsl(var(--primary))', 'hsl(215 94% 68%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)'].map((color, idx) => (
                                  <linearGradient id={`colorScore-${idx}`} key={idx} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 700 }}
                                domain={[0, 100]}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--background))',
                                  borderRadius: '12px',
                                  border: '1px solid hsl(var(--border))',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}
                              />
                              <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />
                              {performanceData.length > 0 && Object.keys(performanceData[0])
                                .filter(key => key !== 'date')
                                .map((subject, idx) => {
                                  const colors = ['hsl(var(--primary))', 'hsl(215 94% 68%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)']
                                  const color = colors[idx % colors.length]
                                  return (
                                    <Area
                                      key={subject}
                                      type="monotone"
                                      dataKey={subject}
                                      name={subject}
                                      stroke={color}
                                      fillOpacity={1}
                                      fill={`url(#colorScore-${idx % colors.length})`}
                                      strokeWidth={3}
                                    />
                                  )
                                })}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-card border-border/50 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm font-bold uppercase tracking-widest">Subject Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={performanceData.slice(-1)}>
                                <XAxis dataKey="date" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip />
                                {performanceData.length > 0 && Object.keys(performanceData[0])
                                  .filter(key => key !== 'date')
                                  .map((subject, idx) => (
                                    <Bar key={subject} dataKey={subject} fill={`hsl(var(--primary) / ${0.3 + (idx * 0.2)})`} radius={[4, 4, 0, 0]} />
                                  ))}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border/50 shadow-sm flex flex-col justify-center p-8 text-center border-dashed">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-widest">AI Insights</h4>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                          {studentName} is showing exceptional growth in <span className="text-primary font-bold">Mathematics</span>. Suggesting advanced reading for the upcoming geometry module.
                        </p>
                      </Card>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reports' && (
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid gap-4"
                  >
                    {[
                      { title: 'Mid-term Assessment Report', date: 'March 2026', size: '2.4 MB' },
                      { title: 'January Attendance Summary', date: 'Feb 2026', size: '1.1 MB' },
                      { title: 'Extracurricular Participation', date: 'Jan 2026', size: '0.8 MB' }
                    ].map((report, idx) => (
                      <Card key={idx} className="bg-card border-border/50 hover:bg-secondary/20 transition-all cursor-pointer group">
                        <CardContent className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                              <Calendar className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{report.title}</h4>
                              <p className="text-[10px] font-medium text-muted-foreground uppercase">{report.date} • {report.size}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="rounded-xl group-hover:bg-primary/10 group-hover:text-primary"
                            onClick={() => handleDownloadReport(report.title)}
                          >
                            Download PDF
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar Area */}
            <div className="space-y-8 h-fit self-start">
              <UpcomingEvents />

              {/* Enhanced Submit Query form */}
              <Card className="bg-card border-border/50 shadow-sm overflow-hidden group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Submit Query
                  </CardTitle>
                  <CardDescription className="text-[11px] font-medium">Resolution target: <span className="text-primary font-bold">24 Hours</span></CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitQuery} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-0.5">Subject</label>
                      <Input
                        placeholder="e.g. Leave Request, Progress Meeting"
                        className="rounded-xl bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 h-10 text-sm font-medium"
                        value={newQuery.subject}
                        onChange={(e) => setNewQuery(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-0.5">Priority Level</label>
                      <Select value={newQuery.priority} onValueChange={(value) => setNewQuery(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="rounded-xl bg-secondary/30 border-none focus:ring-1 focus:ring-primary/30 h-10 text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/50">
                          <SelectItem value="Low" className="text-xs font-bold">Low Priority</SelectItem>
                          <SelectItem value="Medium" className="text-xs font-bold">Medium Priority</SelectItem>
                          <SelectItem value="High" className="text-xs font-bold text-red-500">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-0.5">Detailed Message</label>
                      <Textarea
                        placeholder="Provide details about your query..."
                        className="rounded-xl bg-secondary/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30 min-h-[120px] text-sm font-medium resize-none"
                        value={newQuery.message}
                        onChange={(e) => setNewQuery(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full rounded-xl py-6 h-auto font-black text-[10px] uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95 group-hover:shadow-lg transition-transform">
                      Send Query
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* My Queries Feed */}
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-xl font-bold">Communication History</CardTitle>
                <CardDescription className="text-xs">Track active and archived tickets</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-xl">
                <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary">{queries.length} Tickets</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-20 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Parsing Communications...</p>
                </div>
              ) : queries.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {queries.map((query: any, idx: number) => (
                    <motion.div
                      key={query._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group relative bg-secondary/20 hover:bg-secondary/40 border border-transparent hover:border-border/50 rounded-2xl p-5 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${getStatusColor(query.status)} text-[9px] font-black uppercase tracking-tighter border-none px-2 py-0.5`}>
                          {query.status}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(query.priority)} text-[8px] font-bold border-none`}>
                          {query.priority} Priority
                        </Badge>
                      </div>
                      <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">{query.subject}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 font-medium mb-4 italic opacity-80">"{query.message}"</p>
                      <div className="flex items-center justify-between border-t border-border/30 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase">{new Date(query.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          View Details
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {query.response && (
                        <div className="mt-4 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Faculty Response
                          </p>
                          <p className="text-[11px] text-emerald-900/80 font-medium line-clamp-3">{query.response}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-[2rem] border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No active communications found</p>
                  <p className="text-[11px] text-muted-foreground/50 font-medium mt-1">Submit your first query using the panel above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}