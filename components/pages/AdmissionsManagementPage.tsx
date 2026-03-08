'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Menu, Plus, Edit2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import CEOSidebar from '@/components/dashboard/CEOSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { API_URL } from '@/lib/api-config'

interface AdmissionApplication {
  _id: string;
  studentId?: string;
  studentName: string;
  parentName: string;
  email: string;
  phone: string;
  grade: string;
  section: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  applicationDate: string;
  notes?: string;
}

interface AdmissionsManagementPageProps {
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'student-performance') => void
}

export default function AdmissionsManagementPage({ onNavigate }: AdmissionsManagementPageProps) {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdmissionApplication>>({});

  // Detect user role from localStorage
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role || 'admin');
    }
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/admissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const grades = Array.from(new Set(applications.map(a => a.grade))).sort();
  const sections = ['A', 'B', 'C', 'D'];
  const statuses = ['Pending', 'Approved', 'Rejected'];
  const CLASS_LEVELS = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch =
        app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.phone.includes(searchTerm);

      const matchesGrade = gradeFilter === 'all' || app.grade === gradeFilter;
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [applications, searchTerm, gradeFilter, statusFilter]);

  const handleAddApplication = () => {
    setEditingId(null);
    setFormData({
      studentName: '',
      parentName: '',
      email: '',
      phone: '',
      grade: '',
      status: 'Pending',
      applicationDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setOpenDialog(true);
  }

  const handleEditApplication = (application: AdmissionApplication) => {
    setEditingId(application._id);
    setFormData({
      studentId: application.studentId || '',
      studentName: application.studentName,
      parentName: application.parentName,
      email: application.email,
      phone: application.phone,
      grade: application.grade,
      section: application.section || 'A',
      status: application.status,
      applicationDate: application.applicationDate.split('T')[0],
      notes: application.notes || '',
    });
    setOpenDialog(true);
  }

  const handleSave = async () => {
    if (!formData.studentName || !formData.parentName || !formData.email || !formData.phone || !formData.grade) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const cleanedData = {
        ...formData,
        studentName: formData.studentName?.trim(),
        grade: formData.grade?.trim(),
        section: formData.section?.trim() || 'A',
        studentId: formData.studentId?.trim()
      }

      if (editingId) {
        await fetch(`${API_URL}/admissions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData)
        });
      } else {
        await fetch(`${API_URL}/admissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData)
        });
      }
      fetchAdmissions();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving admission:', error);
      alert('Error saving admission application');
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      try {
        await fetch(`${API_URL}/admissions/${id}`, {
          method: 'DELETE'
        })
        fetchAdmissions()
      } catch (error) {
        console.error('Error deleting application:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    pending: applications.filter(a => a.status === 'Pending').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading admissions data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {userRole === 'ceo' ? (
        <CEOSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={onNavigate}
        />
      ) : (
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigate={onNavigate}
        />
      )}

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
              <h1 className="text-2xl font-bold text-foreground">Admissions Management</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 bg-background overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-muted-foreground">Review and manage student admission applications</p>
            </div>

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

            <Card className="border border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle>Applications ({applications.length} total)</CardTitle>
                  {userRole === 'ceo' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
                      <span className="text-xs text-blue-800 font-medium">Read-Only View</span>
                    </div>
                  ) : (
                    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" onClick={handleAddApplication}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Application
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md text-foreground">
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
                            <label className="text-sm font-medium text-foreground">Section</label>
                            <Select value={formData.section || 'A'} onValueChange={(value) => setFormData({ ...formData, section: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {sections.map(sec => (
                                  <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
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
                                {statuses.map(status => (
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
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
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
                          {statuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setGradeFilter('all');
                          setStatusFilter('all');
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredApplications.length} of {applications.length} applications
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead>Student Name</TableHead>
                        <TableHead>Parent Name</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date Applied</TableHead>
                        <TableHead>Status</TableHead>
                        {userRole !== 'ceo' && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map(app => (
                          <TableRow key={app._id}>
                            <TableCell className="font-medium">{app.studentName}</TableCell>
                            <TableCell>{app.parentName}</TableCell>
                            <TableCell>{app.grade}</TableCell>
                            <TableCell>{app.section || 'A'}</TableCell>
                            <TableCell>{app.email}</TableCell>
                            <TableCell>{app.phone}</TableCell>
                            <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(app.status)}>
                                {app.status}
                              </Badge>
                            </TableCell>
                            {userRole !== 'ceo' && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditApplication(app)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteApplication(app._id)}>
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {applications.length === 0 ? 'No applications found' : 'No applications found matching your criteria'}
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
      </div>
    </div>
  );
}
