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
import { Search, Filter, Menu, Plus, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import CEOSidebar from '@/components/dashboard/CEOSidebar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { API_URL } from '@/lib/api-config'

const DEPARTMENTS = ['Mathematics', 'English', 'Science', 'Social Studies', 'Languages', 'Physical Education', 'Arts', 'Technology', 'Administration', 'Support Staff', 'Special Education'];
const POSITIONS = ['Teacher', 'Senior Teacher', 'Department Head', 'Lab Coordinator', 'Counselor', 'Administrator', 'Principal', 'Vice Principal', 'IT Coordinator', 'Librarian', 'Maintenance Supervisor'];
const STATUSES = ['Active', 'Inactive'] as const;

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  experience: number;
}

interface StaffManagementPageProps {
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'student-performance') => void
}

export default function StaffManagementPage({ onNavigate }: StaffManagementPageProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<StaffMember>>({});

  // Detect user role from localStorage
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role || 'admin');
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/staff`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = Array.from(new Set(staff.map(s => s.department))).sort();
  const statuses = ['Active', 'Inactive'];

  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = departmentFilter === 'all' || member.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [staff, searchTerm, departmentFilter, statusFilter]);

  const handleAddStaff = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      joinDate: '',
      status: 'Active',
      experience: 0,
    });
    setOpenDialog(true);
  }

  const handleEditStaff = (member: StaffMember) => {
    setEditingId(member._id);
    setFormData({
      name: member.name,
      email: member.email,
      department: member.department,
      position: member.position,
      joinDate: member.joinDate ? member.joinDate.split('T')[0] : '',
      status: member.status,
      experience: member.experience,
    });
    setOpenDialog(true);
  }

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.joinDate) {
      alert('Please fill all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token')
      if (editingId) {
        const response = await fetch(`${API_URL}/staff/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to update staff');
      } else {
        const response = await fetch(`${API_URL}/staff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error('Failed to add staff');
      }
      fetchStaff();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving staff:', error);
      alert('Error saving staff member');
    }
  }

  const handleDeleteStaff = async (id: string) => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/staff/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to delete staff');
        fetchStaff(); // Refresh the list
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Error deleting staff member');
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading staff data...</div>
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

      <div className="flex-1 flex flex-col overflow-hidden text-foreground">
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
              <h1 className="text-2xl font-bold">Staff Management</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 bg-background overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-muted-foreground">Manage and search through all staff members</p>
            </div>

            <Card className="border border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle>Staff Directory ({staff.length} members)</CardTitle>
                  {userRole === 'ceo' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
                      <span className="text-xs text-blue-800 font-medium">Read-Only View</span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={handleAddStaff}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Staff
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md text-foreground">
                          <DialogHeader>
                            <DialogTitle>
                              {editingId ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Name</label>
                              <Input
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Full name"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Email</label>
                              <Input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email address"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <Select value={formData.department || ''} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DEPARTMENTS.map(dept => (
                                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Position</label>
                                <Select value={formData.position || ''} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {POSITIONS.map(pos => (
                                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Join Date</label>
                                <Input
                                  type="date"
                                  value={formData.joinDate || ''}
                                  onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Experience (Years)</label>
                                <Input
                                  type="number"
                                  value={formData.experience || 0}
                                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
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
                            <Button onClick={handleSave} className="w-full mt-4">
                              {editingId ? 'Update Staff Member' : 'Add Staff Member'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or position..."
                      className="pl-10 text-foreground"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Department
                      </label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                          setDepartmentFilter('all');
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
                  Showing {filteredStaff.length} of {staff.length} staff members
                </div>

                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Status</TableHead>
                        {userRole !== 'ceo' && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.length > 0 ? (
                        filteredStaff.map(member => (
                          <TableRow key={member._id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.department}</TableCell>
                            <TableCell>{member.position}</TableCell>
                            <TableCell>{member.experience} years</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                            </TableCell>
                            {userRole !== 'ceo' && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleEditStaff(member)}>
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteStaff(member._id)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {staff.length === 0 ? 'No staff members found' : 'No staff members found matching your criteria'}
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
