'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { io } from 'socket.io-client'
import { API_URL, SOCKET_URL } from '@/lib/api-config'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  GraduationCap,
  LogOut,
  Plus,
  Save,
  Search,
  Users,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  User,
  GraduationCap as GradIcon,
  BookOpen,
  FileSpreadsheet,
  Upload,
  Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Student {
  _id: string
  studentId?: string
  studentName: string
  grade: string
  section: string
  riskScore?: number
  riskStatus?: 'High' | 'Medium' | 'Low'
}

interface AttendanceRecord {
  studentName: string
  status: 'Present' | 'Absent'
  date: string
}

const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C', 'D']
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies']

export default function StaffDashboardPage({ onLogout }: { onLogout: () => void }) {
  const [selectedClass, setSelectedClass] = useState('Class 9')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedSubject, setSelectedSubject] = useState('Mathematics')
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({})
  const [grades, setGrades] = useState<any[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([])
  const [risks, setRisks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('performance')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [recentStudentIds, setRecentStudentIds] = useState<Set<string>>(new Set())
  const [userContext, setUserContext] = useState<any>(null)
  const { toast } = useToast()

  // Student Edit Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentFormData, setStudentFormData] = useState<any>({})
  const [updatingStudent, setUpdatingStudent] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserContext(parsedUser)
      if (parsedUser.role === 'staff') {
        const targetClass = parsedUser.activeClass || parsedUser.assignedClass
        const targetSection = parsedUser.activeSection || parsedUser.assignedSection
        if (targetClass) setSelectedClass(targetClass)
        if (targetSection) setSelectedSection(targetSection)
      }
    }
  }, [])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // Get user context
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const isStaff = user?.role === 'staff'

      // Prioritize active session context from login
      const currentClass = isStaff ? (user.activeClass || user.assignedClass || selectedClass) : selectedClass
      const currentSection = isStaff ? (user.activeSection || user.assignedSection || selectedSection) : selectedSection

      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [studentRes, riskRes, gradeRes, attendanceRes] = await Promise.all([
        fetch(`${API_URL}/admissions?status=Approved&grade=${encodeURIComponent(currentClass)}&section=${encodeURIComponent(currentSection)}`, { headers }),
        fetch(`${API_URL}/analytics/predictions/risk-assessment?grade=${encodeURIComponent(currentClass)}&section=${encodeURIComponent(currentSection)}`, { headers }),
        fetch(`${API_URL}/grades?grade=${encodeURIComponent(currentClass)}&section=${encodeURIComponent(currentSection)}`, { headers }),
        fetch(`${API_URL}/attendance?grade=${encodeURIComponent(currentClass)}&section=${encodeURIComponent(currentSection)}`, { headers })
      ])

      const studentData = await studentRes.json()
      const riskData = await riskRes.json()
      const gradeData = await gradeRes.json()
      const attendanceData = await attendanceRes.json()

      setStudents(Array.isArray(studentData) ? studentData : [])
      setRisks(Array.isArray(riskData) ? riskData : [])
      setGrades(Array.isArray(gradeData) ? gradeData : [])
      setAttendanceHistory(Array.isArray(attendanceData) ? attendanceData : [])

      // Initialize attendance state
      const initialAttendance: Record<string, 'Present' | 'Absent'> = {}
      if (Array.isArray(studentData)) {
        studentData.forEach((s: any) => {
          const key = s.studentId || s.studentName
          initialAttendance[key] = 'Present'
        })
      }
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedClass, selectedSection])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshTrigger])

  // Socket.io Connection for Real-time Staff Dashboard
  useEffect(() => {
    const socket = io(SOCKET_URL)

    socket.on('connect', () => {
      console.log('Staff Portal: Neural Link Established')
    })

    const handleAdmissionEvent = (data: any) => {
      const incomingGrade = (data.grade || '').toString().trim()
      const incomingSection = (data.section || 'A').toString().trim()

      console.log(`Staff Portal: Event received - Grade: "${incomingGrade}", Section: "${incomingSection}", Status: ${data.status}`)
      console.log(`Staff Portal: Current View - Grade: "${selectedClass}", Section: "${selectedSection}"`)

      // If the student belongs to the currently viewed class/section (resilient match)
      if (incomingGrade === selectedClass.trim() && incomingSection === selectedSection.trim()) {
        console.log('Staff Portal: Relevant event detected, updating UI...')

        // Notify for any new student or status change to Approved
        const isNewApproval = data.status === 'Approved'

        toast({
          title: isNewApproval ? "New Student Enrolled!" : "Admission Update",
          description: `${data.studentName} - ${data.status} for ${data.grade}${data.section}`,
          className: isNewApproval ? "bg-emerald-600 text-white font-black" : "bg-primary text-white font-bold"
        })

        if (data._id && isNewApproval) {
          setRecentStudentIds(prev => new Set(prev).add(data._id))
        }

        // Always trigger a refresh to be safe
        setRefreshTrigger(prev => prev + 1)
      } else {
        console.log('Staff Portal: Event ignored (mismatch)')
      }
    }

    socket.on('newAdmission', handleAdmissionEvent)
    socket.on('updateAdmission', handleAdmissionEvent)
    socket.on('gradesUpdated', () => {
      console.log('Staff Portal: Grades updated via Excel, refreshing...')
      setRefreshTrigger(prev => prev + 1)
    })
    socket.on('deleteAdmission', (data: any) => {
      if (data?.id) {
        setRecentStudentIds(prev => {
          const next = new Set(prev)
          next.delete(data.id)
          return next
        })
      }
      setRefreshTrigger(prev => prev + 1)
    })

    return () => {
      socket.disconnect()
    }
  }, [selectedClass, selectedSection])

  const studentListWithRisks = useMemo(() => {
    if (!Array.isArray(students)) return []
    return students.map(s => {
      const riskInfo = Array.isArray(risks) ? risks.find(r => r.studentId === s.studentId) : null
      return {
        ...s,
        riskScore: riskInfo?.riskScore || 0,
        riskStatus: riskInfo?.status || 'Low'
      }
    })
  }, [students, risks])

  const classAverages = useMemo(() => {
    // Proficiency Calculation
    const totalScore = grades.length > 0 ? grades.reduce((acc: number, g: any) => acc + g.score, 0) : 0
    const proficiency = grades.length > 0 ? Math.round(totalScore / grades.length) : 0

    // Attendance Rate Calculation
    const totalAttendance = attendanceHistory.length
    const presentCount = attendanceHistory.filter((a: any) => a.status === 'Present').length
    const rate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0

    return {
      overall: proficiency,
      attendanceRate: rate
    }
  }, [grades, attendanceHistory])

  const submitAttendance = async () => {
    setSaving(true)
    const records = students.map(student => {
      const key = student.studentId || student.studentName
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        class: selectedClass,
        section: selectedSection,
        subject: selectedSubject,
        status: attendance[key] || 'Present',
        date: new Date().toISOString()
      }
    })

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(records)
      })
      if (res.ok) {
        toast({
          title: 'Success',
          description: `Attendance submitted for ${selectedSubject}`,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit attendance',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadClassReport = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/analytics/class-report?grade=${encodeURIComponent(selectedClass)}&section=${encodeURIComponent(selectedSection)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Class_Report_${selectedClass}_${selectedSection}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({ title: 'Success', description: 'Class report downloaded successfully' })
      } else {
        const error = await res.json()
        throw new Error(error.message || 'Download failed')
      }
    } catch (error: any) {
      toast({ title: 'Download Failed', description: error.message, variant: 'destructive' })
    }
  }

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/excel/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await res.json()
      if (res.ok) {
        toast({
          title: 'Import Success',
          description: `Added: ${result.details.added}, Updated: ${result.details.updated}`,
        })
        fetchData()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to upload Excel file',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleStudentClick = async (student: Student) => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }
      // Fetch full admission details to edit by _id for precision
      const res = await fetch(`${API_URL}/admissions/${student._id}`, { headers })
      const fullDetails = await res.json()

      if (res.ok && fullDetails) {
        setSelectedStudent(student)
        setStudentFormData(fullDetails)
      } else {
        toast({ title: "Error", description: "Could not find student details.", variant: "destructive" })
      }
    } catch (error) {
      console.error('Error fetching student details:', error)
    }
  }

  const handleUpdateStudent = async () => {
    if (!selectedStudent || !studentFormData._id) return
    setUpdatingStudent(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admissions/${studentFormData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentFormData)
      })

      if (response.ok) {
        toast({ title: "Success", description: "Student profile updated successfully." })
        setSelectedStudent(null)
        fetchData()
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      toast({ title: "Update Failed", description: "Could not update student details.", variant: "destructive" })
    } finally {
      setUpdatingStudent(false)
    }
  }

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      default: return 'text-green-500 bg-green-500/10 border-green-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Academic Portal</h1>
              <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Staff Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-full px-4 py-1.5 border border-slate-200 dark:border-slate-800">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Live Systems Active</span>
            </div>
            <Button
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase"
            >
              Manual Sync
            </Button>

            <div className="relative">
              <input
                type="file"
                id="excel-upload"
                className="hidden"
                accept=".xlsx,.xls,.csv"
                onChange={handleExcelUpload}
              />
              <Button
                onClick={() => document.getElementById('excel-upload')?.click()}
                variant="outline"
                size="sm"
                className="rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-[10px] font-bold uppercase"
                disabled={saving}
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <FileSpreadsheet className="w-3 h-3 mr-2" />}
                Import Excel
              </Button>
            </div>

            <Button
              onClick={handleDownloadClassReport}
              variant="outline"
              size="sm"
              className="rounded-full border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 text-[10px] font-bold uppercase"
            >
              <Download className="w-3 h-3 mr-2" />
              Class Report
            </Button>

            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="rounded-full hover:bg-red-500/10 hover:text-red-500 group transition-all"
            >
              <LogOut className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-tight">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome & Global Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Class Management</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring {selectedClass} - Section {selectedSection}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Select value={selectedClass} onValueChange={setSelectedClass} disabled={userContext?.role === 'staff'}>
              <SelectTrigger className={`w-[140px] h-10 border-none bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-tight ${userContext?.role === 'staff' ? 'opacity-80' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                {CLASSES.map(cls => <SelectItem key={cls} value={cls} className="text-xs font-bold uppercase">{cls}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={userContext?.role === 'staff'}>
              <SelectTrigger className={`w-[100px] h-10 border-none bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-xs uppercase tracking-tight ${userContext?.role === 'staff' ? 'opacity-80' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                {SECTIONS.map(s => <SelectItem key={s} value={s} className="text-xs font-bold uppercase">Sec {s}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            <div className="bg-primary/5 rounded-xl px-4 py-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-black text-primary uppercase">{students.length} Students</span>
            </div>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-blue-500/5 border-blue-500/20 shadow-none overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-blue-500/20 text-blue-600 bg-white/50 text-[10px] font-bold">Class Average</Badge>
              </div>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{classAverages.overall}%</h4>
              <p className="text-xs font-bold text-blue-600/80 uppercase tracking-widest">Academic Proficiency</p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-none overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-emerald-500/20 text-emerald-600 bg-white/50 text-[10px] font-bold">Today</Badge>
              </div>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-1">{classAverages.attendanceRate}%</h4>
              <p className="text-xs font-bold text-emerald-600/80 uppercase tracking-widest">Attendance Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-rose-500/5 border-rose-500/20 shadow-none overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <Badge variant="outline" className="border-rose-500/20 text-rose-600 bg-white/50 text-[10px] font-bold">AI Flagged</Badge>
              </div>
              <h4 className="text-4xl font-black text-slate-900 dark:text-white mb-1">
                {studentListWithRisks.filter(s => s.riskStatus === 'High').length}
              </h4>
              <p className="text-xs font-bold text-rose-600/80 uppercase tracking-widest">High Risk Students</p>
            </CardContent>
          </Card>
        </section>

        {/* Main Tabs */}
        <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 h-12 rounded-2xl w-full sm:w-auto">
            <TabsTrigger value="performance" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 text-xs font-bold uppercase tracking-tight">
              Performance List
            </TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white h-full px-8 text-xs font-bold uppercase tracking-tight">
              Attendance Mark
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={loading ? 'loading' : 'content'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary/20" />
                    <Loader2 className="w-12 h-12 animate-spin text-primary absolute top-0 left-0 [animation-delay:-0.5s]" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Campus Data...</p>
                </div>
              ) : (
                <>
                  <TabsContent value="performance" className="mt-0 border-none p-0 shadow-none">
                    <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden rounded-2xl">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                          <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                            <TableHead className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider">Student Profile</TableHead>
                            <TableHead className="py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">Attendance Risk</TableHead>
                            {SUBJECTS.map(sub => (
                              <TableHead key={sub} className="py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider font-bold">{sub}</TableHead>
                            ))}
                            <TableHead className="py-4 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">Overall</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {studentListWithRisks.map((student, idx) => {
                            const studentGrades = grades.filter(g => g.studentName === student.studentName)
                            return (
                              <TableRow
                                key={student._id || `student-${idx}`}
                                className="group border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                                onClick={() => handleStudentClick(student)}
                              >
                                <TableCell className="py-5 font-bold">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all">
                                      {student.studentName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{student.studentName}</p>
                                        {recentStudentIds.has(student._id) && (
                                          <Badge className="bg-primary text-[8px] h-4 px-1 font-black animate-pulse">NEW</Badge>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        ID: {student._id ? String(student._id).slice(-6) : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="outline" className={`rounded-lg px-3 py-1 font-black text-[10px] uppercase tracking-tighter shadow-sm border ${getRiskColor(student.riskStatus || 'Low')}`}>
                                    {student.riskStatus} Risk ({student.riskScore}%)
                                  </Badge>
                                </TableCell>
                                {SUBJECTS.map(sub => {
                                  const latest = studentGrades.find(g => g.subject === sub)?.score || 0
                                  return (
                                    <TableCell key={sub} className="text-center font-black text-sm">
                                      <span className={latest > 90 ? 'text-emerald-600' : latest < 60 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}>
                                        {latest > 0 ? `${latest}%` : '—'}
                                      </span>
                                    </TableCell>
                                  )
                                })}
                                <TableCell className="text-center">
                                  <div className="inline-flex items-center gap-2">
                                    <span className="text-sm font-black text-primary">
                                      {studentGrades.length > 0 ? (studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length).toFixed(1) : '0'}%
                                    </span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </Card>
                  </TabsContent>

                  <TabsContent value="attendance" className="mt-0 border-none p-0 shadow-none">
                    <div className="space-y-6">
                      <Card className="border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-white dark:bg-slate-900">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                              <CalendarIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Today's Attendance</h3>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                              <SelectTrigger className="w-[200px] h-11 border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs uppercase">
                                <SelectValue placeholder="Select Subject" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {SUBJECTS.map(sub => <SelectItem key={sub} value={sub} className="text-xs font-bold uppercase">{sub}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={submitAttendance}
                              disabled={saving}
                              className="h-11 px-8 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                              Submit Roll
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {students.map((student, idx) => {
                            const isPresent = attendance[student.studentId || student.studentName] === 'Present'
                            return (
                              <div
                                key={student._id || `attendance-${idx}`}
                                onClick={() => handleStudentClick(student)}
                                className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer hover:border-primary/30 ${isPresent
                                  ? 'bg-emerald-500/5 border-emerald-500/20'
                                  : 'bg-rose-500/5 border-rose-500/20 shadow-lg shadow-rose-500/10'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isPresent
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-rose-500 text-white'
                                    }`}>
                                    {student.studentName.split(' ').map(n => n[0]).join('')}
                                  </div>
                                  <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{student.studentName}</p>
                                    <Badge variant="outline" className={`text-[9px] font-black uppercase ${isPresent ? 'text-emerald-600 bg-white border-emerald-500/20' : 'text-rose-600 bg-white border-rose-500/20'
                                      }`}>
                                      {isPresent ? 'Marked Present' : 'Absent'}
                                    </Badge>
                                  </div>
                                </div>

                                <Switch
                                  checked={isPresent}
                                  onClick={(e) => e.stopPropagation()}
                                  onCheckedChange={(checked) => setAttendance(prev => ({
                                    ...prev,
                                    [(student.studentId || student.studentName)]: checked ? 'Present' : 'Absent'
                                  }))}
                                  className="data-[state=checked]:bg-emerald-500"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </Card>
                    </div>
                  </TabsContent>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Student Edit & History Modal */}
        <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 p-0 overflow-hidden rounded-[2rem]">
            <div className="p-8 space-y-8">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                    {studentFormData.studentName?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {studentFormData.studentName}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold uppercase tracking-widest mt-1 text-slate-500">
                      ID: {studentFormData.studentId || 'N/A'} • {studentFormData.grade} Sec {studentFormData.section}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Edit Form */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Profile Information</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><User className="w-3 h-3" /> Parent Name</label>
                      <Input
                        value={studentFormData.parentName || ''}
                        onChange={e => setStudentFormData({ ...studentFormData, parentName: e.target.value })}
                        className="h-9 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                      <Input
                        value={studentFormData.email || ''}
                        onChange={e => setStudentFormData({ ...studentFormData, email: e.target.value })}
                        className="h-9 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</label>
                      <Input
                        value={studentFormData.phone || ''}
                        onChange={e => setStudentFormData({ ...studentFormData, phone: e.target.value })}
                        className="h-9 bg-slate-50 dark:bg-slate-900 text-xs font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Class</label>
                        <Select value={studentFormData.grade || ''} onValueChange={v => setStudentFormData({ ...studentFormData, grade: v })}>
                          <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-900 text-xs font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent><ScrollArea className="h-[150px]">{CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</ScrollArea></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Section</label>
                        <Select value={studentFormData.section || ''} onValueChange={v => setStudentFormData({ ...studentFormData, section: v })}>
                          <SelectTrigger className="h-9 bg-slate-50 dark:bg-slate-900 text-xs font-bold"><SelectValue /></SelectTrigger>
                          <SelectContent>{SECTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpdateStudent}
                    disabled={updatingStudent}
                    className="w-full h-10 mt-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                  >
                    {updatingStudent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-slate-100 dark:bg-slate-800 absolute left-1/2 top-8 bottom-8" />

                {/* 30-Day Attendance Visualization */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">30-Day Attendance Heatmap</h4>
                    <div className="flex items-center gap-2 text-[9px] font-bold uppercase text-slate-400">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Present</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> Absent</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800" /> N/A</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap gap-1.5 list-none">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (29 - i)); // From past (left) to present (right)
                        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const record = attendanceHistory.find(a => 
                          a.studentName === studentFormData.studentName && 
                          new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) === dateStr
                        );
                        
                        let colorClass = "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700";
                        if (record?.status === 'Present') colorClass = "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]";
                        if (record?.status === 'Absent') colorClass = "bg-rose-500 hover:bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]";

                        return (
                          <div 
                            key={i} 
                            className={`w-6 h-6 md:w-8 md:h-8 rounded-md ${colorClass} transition-all cursor-crosshair relative group`}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              {record ? ` - ${record.status}` : ' - No Record'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mt-6">Detailed 30-Day Log</h4>
                  <ScrollArea className="h-[200px] w-full pr-4">
                    <div className="space-y-2">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i); // From present down to 30 days ago
                        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        
                        // Find all records for this specific day
                        const dayRecords = attendanceHistory.filter(a => 
                          a.studentName === studentFormData.studentName && 
                          new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) === dateString
                        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        
                        if (dayRecords.length === 0) {
                          return (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-transparent opacity-60">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                                   <CalendarIcon className="w-4 h-4" />
                                 </div>
                                 <div>
                                   <p className="text-xs font-bold text-slate-500">{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                   <p className="text-[9px] font-bold uppercase text-slate-400">No Record Found</p>
                                 </div>
                               </div>
                               <Badge variant="outline" className="border-none bg-slate-100 dark:bg-slate-800 text-slate-400">Unmarked</Badge>
                            </div>
                          );
                        }

                        // If records exist for this day
                        return dayRecords.map((record, rIdx) => (
                          <div key={`${i}-${rIdx}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                <CalendarIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                  {' • '}
                                  <span className="text-slate-500 font-medium whitespace-nowrap">
                                    {new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </p>
                                <p className="text-[9px] font-bold uppercase text-slate-400">{record.subject || 'Daily Attendance'}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`border-none ${record.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {record.status}
                            </Badge>
                          </div>
                        ));
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}