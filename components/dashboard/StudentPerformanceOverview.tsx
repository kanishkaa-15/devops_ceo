'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

interface Student {
  id: string
  name: string
  rollNumber: string
  class: string
  section: string
  mathematics: number
  english: number
  science: number
  socialStudies: number
  overall: number
  grade: string
}

import { TrendingUp, Users as UsersIcon, Award, Percent, BookOpen } from 'lucide-react'

export default function StudentPerformanceOverview() {
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    const loadStudents = () => {
      const savedStudents = localStorage.getItem('students')
      if (savedStudents) {
        setStudents(JSON.parse(savedStudents))
      }
    }

    loadStudents()

    const interval = setInterval(loadStudents, 2000)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'students') {
        loadStudents()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    const handleStudentsUpdate = () => {
      loadStudents()
    }

    window.addEventListener('studentsUpdated', handleStudentsUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('studentsUpdated', handleStudentsUpdate)
    }
  }, [])

  const totalStudents = students.length
  const averageMarks = students.length > 0 ? (students.reduce((sum, student) => sum + student.overall, 0) / students.length).toFixed(1) : 0
  const passCount = students.filter((student) => student.overall >= 60).length
  const passPercentage = totalStudents > 0 ? ((passCount / totalStudents) * 100).toFixed(1) : 0

  const gradeWisePerformance = [
    { grade: 'Class 6', students: students.filter((s) => s.class === 'Class 6').length, avgMarks: students.filter((s) => s.class === 'Class 6').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 6').length, 1) },
    { grade: 'Class 7', students: students.filter((s) => s.class === 'Class 7').length, avgMarks: students.filter((s) => s.class === 'Class 7').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 7').length, 1) },
    { grade: 'Class 8', students: students.filter((s) => s.class === 'Class 8').length, avgMarks: students.filter((s) => s.class === 'Class 8').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 8').length, 1) },
    { grade: 'Class 9', students: students.filter((s) => s.class === 'Class 9').length, avgMarks: students.filter((s) => s.class === 'Class 9').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 9').length, 1) },
    { grade: 'Class 10', students: students.filter((s) => s.class === 'Class 10').length, avgMarks: students.filter((s) => s.class === 'Class 10').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 10').length, 1) },
    { grade: 'Class 11', students: students.filter((s) => s.class === 'Class 11').length, avgMarks: students.filter((s) => s.class === 'Class 11').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 11').length, 1) },
    { grade: 'Class 12', students: students.filter((s) => s.class === 'Class 12').length, avgMarks: students.filter((s) => s.class === 'Class 12').reduce((sum, s) => sum + s.overall, 0) / Math.max(students.filter((s) => s.class === 'Class 12').length, 1) },
  ]

  const performanceDistribution = [
    { range: 'Excellent (90-100)', count: students.filter((s) => s.overall >= 90).length, fill: '#10b981' },
    { range: 'Good (75-89)', count: students.filter((s) => s.overall >= 75 && s.overall < 90).length, fill: '#3b82f6' },
    { range: 'Average (60-74)', count: students.filter((s) => s.overall >= 60 && s.overall < 75).length, fill: '#f59e0b' },
    { range: 'Below Average (<60)', count: students.filter((s) => s.overall < 60).length, fill: '#ef4444' },
  ]

  const performanceTrend = students
    .slice(0, 20)
    .map((student, idx) => ({
      student: `${idx + 1}`,
      marks: student.overall,
      name: student.name.split(' ')[0],
    }))

  const statsCards = [
    { label: 'Total Students', value: totalStudents, sub: 'Active in system', icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Avg. Score', value: averageMarks, sub: 'Out of 100', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pass Rate', value: `${passPercentage}%`, sub: `${passCount} Students`, icon: Percent, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Success Rate', value: `${students.filter((s) => s.grade !== 'F').length}/${totalStudents}`, sub: 'Passing Grades', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ]

  return (
    <div className="space-y-6">
      {/* Key Statistics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="bg-card border-border/50 overflow-hidden group hover:border-primary/50 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <h4 className="text-2xl font-black text-foreground">{stat.value}</h4>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Grade-wise Performance */}
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">Grade-wise Performance</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeWisePerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="avgMarks" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card className="bg-card border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${value} Students`, 'Count']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend */}
      <Card className="bg-card border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold">Academic Performance Trend</CardTitle>
            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">First 20 Students</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="marks"
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4, stroke: 'white' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Student Marks"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
