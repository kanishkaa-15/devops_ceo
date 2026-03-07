'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Users, UserCheck, UserX, Briefcase, PieChart as PieIcon, BarChart3, Loader2, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function StaffDetails() {
  const [staffData, setStaffData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/staff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setStaffData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching staff data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border/50 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-32 bg-secondary rounded mb-2" />
          <div className="h-4 w-48 bg-secondary rounded" />
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </CardContent>
      </Card>
    )
  }

  const safeStaff = Array.isArray(staffData) ? staffData : []
  const totalStaff = safeStaff.length
  const activeStaff = safeStaff.filter(s => s.status === 'Active').length
  const inactiveStaff = safeStaff.filter(s => s.status === 'Inactive').length

  const departmentCounts = safeStaff.reduce((acc: any, staff: any) => {
    acc[staff.department] = (acc[staff.department] || 0) + 1
    return acc
  }, {})

  const departmentData = Object.entries(departmentCounts).map(([name, value], index) => ({
    name,
    value,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`
  }))

  const experienceRanges = [
    { range: '0-5 Yrs', count: safeStaff.filter(s => (s.experience || 0) <= 5).length },
    { range: '5-10 Yrs', count: safeStaff.filter(s => (s.experience || 0) > 5 && (s.experience || 0) <= 10).length },
    { range: '10+ Yrs', count: safeStaff.filter(s => (s.experience || 0) > 10).length },
  ]

  return (
    <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Staff Composition</CardTitle>
            <CardDescription>Human capital & specialization</CardDescription>
          </div>
          <div className="p-2 bg-accent/10 rounded-lg">
            <Users className="w-5 h-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Vital Stats Strip */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary/30 rounded-2xl p-4 border border-transparent hover:border-border/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Force</span>
            </div>
            <h4 className="text-2xl font-black text-foreground">{activeStaff} <span className="text-xs font-bold text-muted-foreground">/ {totalStaff}</span></h4>
          </div>
          <div className="bg-secondary/30 rounded-2xl p-4 border border-transparent hover:border-border/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Briefcase className="w-4 h-4 text-accent" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Depts</span>
            </div>
            <h4 className="text-2xl font-black text-foreground">{Object.keys(departmentCounts).length} <span className="text-xs font-bold text-muted-foreground">Specializations</span></h4>
          </div>
        </div>

        {totalStaff === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm font-bold text-muted-foreground">Database synchronization pending...</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Dept Pie */}
            <div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <PieIcon className="w-3 h-3" /> Specialization Hub
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontWeight: 700 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Experience Bar */}
            <div>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> Seniority delta
              </h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experienceRanges} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Action Link Footer */}
        <div className="group pt-4 border-t border-border/50 flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-lg">
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Out-of-office Monitor</p>
              <p className="text-[10px] text-muted-foreground font-medium">{inactiveStaff} staff members currently inactive</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  )
}
