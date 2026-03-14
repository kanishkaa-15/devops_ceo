'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { ArrowLeft, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react'
import { API_URL } from '@/lib/api-config'

interface AdmissionApplication {
  _id: string
  studentName: string
  parentName: string
  email: string
  phone: string
  grade: string
  status: 'Pending' | 'Approved' | 'Rejected'
  applicationDate: string
  notes?: string
}

const CLASS_LEVELS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const STATUSES = ['Pending', 'Approved', 'Rejected'] as const

interface AdminAdmissionsPageProps {
  onNavigate: (page: 'admin-staff' | 'admin-admissions' | 'admin-queries' | 'admin' | 'dashboard') => void
}

export default function AdminAdmissionsPage({ onNavigate }: AdminAdmissionsPageProps) {
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<AdmissionApplication>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAdmissions()
  }, [])

  const fetchAdmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setAdmissions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching admissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const grades = Array.from(new Set(admissions.map(a => a.grade))).sort()
  const statuses = ['Pending', 'Approved', 'Rejected'] as const

  const filteredAdmissions = useMemo(() => {
    return admissions.filter(app => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm)

      const matchesGrade = gradeFilter === 'all' || app.grade === gradeFilter
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter

      return matchesSearch && matchesGrade && matchesStatus
    })
  }, [admissions, searchTerm, gradeFilter, statusFilter])

  const stats = {
    total: admissions.length,
    approved: admissions.filter(a => a.status === 'Approved').length,
    pending: admissions.filter(a => a.status === 'Pending').length,
    rejected: admissions.filter(a => a.status === 'Rejected').length,
  }

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({
      studentName: '',
      parentName: '',
      email: '',
      phone: '',
      grade: '',
      status: 'Pending',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: '',
    })
    setOpenDialog(true)
  }

  const handleEditClick = (application: AdmissionApplication) => {
    setEditingId(application._id)
    setFormData({
      studentName: application.studentName,
      parentName: application.parentName,
      email: application.email,
      phone: application.phone,
      grade: application.grade,
      status: application.status,
      applicationDate: application.applicationDate.split('T')[0],
      notes: application.notes || '',
    })
    setOpenDialog(true)
  }

  const handleSave = async () => {
    if (!formData.studentName || !formData.parentName || !formData.email || !formData.phone || !formData.grade) {
      alert('Please fill all required fields')
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (editingId) {
        await fetch(`${API_URL}/admissions/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
      } else {
        await fetch(`${API_URL}/admissions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        })
      }
      fetchAdmissions()
      setOpenDialog(false)
    } catch (error) {
      console.error('Error saving admission:', error)
      alert('Error saving admission application')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`${API_URL}/admissions/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        fetchAdmissions()
      } catch (error) {
        console.error('Error deleting admission:', error)
        alert('Error deleting admission application')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setGradeFilter('all')
    setStatusFilter('all')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading admissions data...</div>
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
              <h1 className="text-3xl font-bold text-foreground">Admissions Management</h1>
              <p className="text-muted-foreground mt-1">Create, update, and delete admission applications</p>
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
        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Total Applications</div>
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Approved</div>
              <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Pending</div>
              <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border border-border">
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground mb-2">Rejected</div>
              <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Showing {filteredAdmissions.length} of {admissions.length} applications</p>
          </div>
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Application
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Application' : 'Add New Application'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Student Name</label>
                  <Input
                    value={formData.studentName || ''}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Parent Name</label>
                  <Input
                    value={formData.parentName || ''}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Parent name"
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
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Grade</label>
                  <Select value={formData.grade || ''} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASS_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Application Date</label>
                  <Input
                    type="date"
                    value={formData.applicationDate || ''}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <Select value={formData.status || 'Pending'} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
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
                  <label className="text-sm font-medium text-foreground">Notes</label>
                  <Input
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes"
                  />
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingId ? 'Update Application' : 'Add Application'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by student name, parent name, email, or phone..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Grade
                  </label>
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {grades.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {STATUSES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.length > 0 ? (
                    filteredAdmissions.map((application) => (
                      <TableRow key={application._id}>
                        <TableCell className="font-medium">{application.studentName}</TableCell>
                        <TableCell>{application.parentName}</TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.grade}</TableCell>
                        <TableCell>{new Date(application.applicationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(application)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => handleDelete(application._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {admissions.length === 0 ? 'No applications found' : 'No applications found matching your criteria'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
