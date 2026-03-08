'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react'
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
}

const DEPARTMENTS = ['Mathematics', 'English', 'Science', 'Social Studies', 'Languages', 'Physical Education', 'Arts', 'Technology', 'Administration', 'Support Staff', 'Special Education']
const POSITIONS = ['Teacher', 'Senior Teacher', 'Department Head', 'Lab Coordinator', 'Counselor', 'Administrator', 'Principal', 'Vice Principal', 'IT Coordinator', 'Librarian', 'Maintenance Supervisor']
const STATUSES = ['Active', 'Inactive'] as const

interface AdminStaffPageProps {
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'student-performance') => void
}

export default function AdminStaffPage({ onNavigate }: AdminStaffPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
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
      setStaff(Array.isArray(data) ? data : [])
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
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.joinDate) {
      alert('Please fill all fields')
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading staff data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
              <p className="text-muted-foreground mt-1">Create, update, and delete staff members</p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate('admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Staff: {staff.length}</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <Select value={formData.department || ''} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Position</label>
                  <Select value={formData.position || ''} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(pos => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Join Date</label>
                  <Input
                    type="date"
                    value={formData.joinDate || ''}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={formData.status || 'Active'} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Experience (Years)</label>
                  <Input
                    type="number"
                    value={formData.experience || 0}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? 'Update Staff' : 'Add Staff'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>{member.experience} yrs</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(member._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
