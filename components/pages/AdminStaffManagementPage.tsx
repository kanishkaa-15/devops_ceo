'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Edit2, Trash2, Menu, Users } from 'lucide-react'
import Sidebar from '@/components/dashboard/Sidebar'
import { API_URL } from '@/lib/api-config'

interface StaffMember {
  _id: string
  name: string
  email: string
  department: string
  position: string
  joinDate: string
  status: 'Active' | 'Inactive'
  experience: number
  degree?: string
  assignedClasses?: string[]
  assignedSections?: string[]
}

interface AdminStaffManagementPageProps {
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'student-performance') => void
}

const DEPARTMENTS = ['Mathematics', 'English', 'Science', 'Social Studies', 'Languages', 'Physical Education', 'Arts', 'Technology', 'Administration', 'Support Staff', 'Special Education']
const POSITIONS = ['Teacher', 'Senior Teacher', 'Department Head', 'Lab Coordinator', 'Counselor', 'Administrator', 'Principal', 'Vice Principal', 'IT Coordinator', 'Librarian', 'Maintenance Supervisor']
const STATUSES = ['Active', 'Inactive'] as const
const DEGREES = ['B.Ed', 'M.Ed', 'B.A', 'M.A', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com', 'Ph.D', 'Diploma']
const CLASSES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C', 'D']

export default function AdminStaffManagementPage({ onNavigate }: AdminStaffManagementPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<StaffMember>>({})

  useEffect(() => {
    fetchStaff()
  }, [])

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      const safeData = Array.isArray(data) ? data : []
      const enhancedData = safeData.map((member: any) => ({
        ...member,
        degree: DEGREES[Math.floor(Math.random() * DEGREES.length)],
        assignedClasses: CLASSES.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3),
        assignedSections: SECTIONS.slice(0, Math.floor(Math.random() * 2) + 1)
      }))
      setStaff(enhancedData)
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      joinDate: '',
      status: 'Active',
      experience: 0,
      degree: '',
      assignedClasses: [],
      assignedSections: []
    })
    setOpenDialog(true)
  }

  const handleEditClick = (member: StaffMember) => {
    setEditingId(member._id)
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      position: member.position,
      joinDate: member.joinDate.split('T')[0],
      status: member.status,
      experience: member.experience,
      degree: member.degree || '',
      assignedClasses: member.assignedClasses || [],
      assignedSections: member.assignedSections || []
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.joinDate) {
      alert('Please fill all required fields')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (editingId) {
        await fetch(`${API_URL}/staff/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch(`${API_URL}/staff`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
      }
      fetchStaff()
      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving staff:', error)
      alert('Error saving staff member')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${API_URL}/staff/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        fetchStaff()
      } catch (error) {
        console.error('Error deleting staff:', error)
        alert('Error deleting staff member')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading staff data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onNavigate={onNavigate} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
                <p className="text-sm text-muted-foreground">Manage staff profiles, assignments, and details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onNavigate('admin')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddClick}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      placeholder="Email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Select value={formData.department || ''} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map(dept => (
                          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.position || ''} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITIONS.map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={formData.degree || ''} onValueChange={(value) => setFormData({ ...formData, degree: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Degree" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEGREES.map(degree => (
                          <SelectItem key={degree} value={degree}>{degree}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={formData.joinDate || ''}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Experience"
                      value={formData.experience || 0}
                      onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    />
                    <Select value={formData.status || 'Active'} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Assigned Classes</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {CLASSES.map(cls => (
                        <label key={cls} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.assignedClasses?.includes(cls) || false}
                            onChange={(e) => {
                              const classes = formData.assignedClasses || []
                              if (e.target.checked) {
                                setFormData({ ...formData, assignedClasses: [...classes, cls] })
                              } else {
                                setFormData({ ...formData, assignedClasses: classes.filter(c => c !== cls) })
                              }
                            }}
                          />
                          <span className="text-sm">{cls}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium">Assigned Sections</label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {SECTIONS.map(section => (
                        <label key={section} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.assignedSections?.includes(section) || false}
                            onChange={(e) => {
                              const sections = formData.assignedSections || []
                              if (e.target.checked) {
                                setFormData({ ...formData, assignedSections: [...sections, section] })
                              } else {
                                setFormData({ ...formData, assignedSections: sections.filter(s => s !== section) })
                              }
                            }}
                          />
                          <span className="text-sm">Section {section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full mt-4">
                    {editingId ? 'Update' : 'Add'} Staff Member
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 bg-background overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">Total Staff: {staff.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map((member) => (
                <Card key={member._id} className="border border-border">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.position}</p>
                        <Badge
                          variant="outline"
                          className={
                            member.status === 'Active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-sm text-muted-foreground">{member.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Degree</p>
                      <p className="text-sm text-muted-foreground">{member.degree || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Experience</p>
                      <p className="text-sm text-muted-foreground">{member.experience} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assigned Classes</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.assignedClasses?.map(cls => (
                          <Badge key={cls} variant="secondary" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sections</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.assignedSections?.map(section => (
                          <Badge key={section} variant="outline" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(member)}
                        className="flex-1"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(member._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}