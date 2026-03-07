'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronDown, Menu, Edit2 } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Sidebar from '@/components/dashboard/Sidebar';
import CEOSidebar from '@/components/dashboard/CEOSidebar';

interface ParentQuery {
  _id: string;
  parentName: string;
  studentName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  response?: string;
  assignedTo?: string;
  createdAt: string;
}

interface ParentQueriesManagementPageProps {
  onNavigate: (page: 'dashboard' | 'staff' | 'admissions' | 'queries' | 'admin' | 'student-performance') => void
}

export default function ParentQueriesManagementPage({ onNavigate }: ParentQueriesManagementPageProps) {
  const [queries, setQueries] = useState<ParentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ParentQuery>>({});

  // Detect user role from localStorage
  const [userRole, setUserRole] = useState<string>('admin');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserRole(userData.role || 'admin');
    }
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/queries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setQueries(data);
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['Open', 'In Progress', 'Resolved'];
  const priorities = ['Low', 'Medium', 'High'];

  const filteredQueries = useMemo(() => {
    return queries.filter(query => {
      const matchesSearch =
        query.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        query.subject.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || query.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [queries, searchTerm, statusFilter, priorityFilter]);

  const handleEditQuery = (query: ParentQuery) => {
    setEditingId(query._id);
    setFormData({
      status: query.status,
      priority: query.priority,
      response: query.response || '',
      assignedTo: query.assignedTo || '',
    });
    setOpenDialog(true);
  }

  const handleSave = async () => {
    if (!formData.status) {
      alert('Please select a status');
      return;
    }

    try {
      if (editingId) {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/queries/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: formData.status,
            priority: formData.priority,
            response: formData.response,
            assignedTo: formData.assignedTo
          })
        });
      }
      fetchQueries();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating query:', error);
      alert('Error updating query');
    }
  }

  const handleDeleteQuery = async (id: string) => {
    if (confirm('Are you sure you want to delete this query?')) {
      try {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/queries/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        fetchQueries()
      } catch (error) {
        console.error('Error deleting query:', error)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'Open').length,
    inProgress: queries.filter(q => q.status === 'In Progress').length,
    resolved: queries.filter(q => q.status === 'Resolved').length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading queries data...</div>
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
              <h1 className="text-2xl font-bold text-foreground">Parent Queries</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 bg-background overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <p className="text-muted-foreground">Track and manage parent inquiries and concerns</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">Total Queries</div>
                  <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">Open</div>
                  <div className="text-3xl font-bold text-red-600">{stats.open}</div>
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">In Progress</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
                </CardContent>
              </Card>
              <Card className="border border-border">
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground mb-2">Resolved</div>
                  <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border border-border">
              <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle>Queries List ({queries.length} total)</CardTitle>
                  <div className="bg-blue-50 border border-blue-200 rounded px-3 py-1">
                    <span className="text-xs text-blue-800 font-medium">Status Management Only</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by parent name, student name, email, or subject..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-4">
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

                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Priority
                      </label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          {priorities.map(priority => (
                            <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setPriorityFilter('all');
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Reset Filters
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredQueries.length} of {queries.length} queries
                </div>

                <div className="space-y-3">
                  {filteredQueries.length > 0 ? (
                    filteredQueries.map(query => (
                      <Collapsible
                        key={query._id}
                        open={expandedId === query._id}
                        onOpenChange={() =>
                          setExpandedId(expandedId === query._id ? null : query._id)
                        }
                      >
                        <div className="border border-border rounded-lg overflow-hidden">
                          <CollapsibleTrigger asChild>
                            <button className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                              <div className="flex-1 text-left">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-semibold text-foreground">{query.subject}</h3>
                                  <Badge className={getStatusColor(query.status)}>
                                    {query.status}
                                  </Badge>
                                  <Badge className={getPriorityColor(query.priority)}>
                                    {query.priority}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {query.parentName} • {query.studentName}
                                </div>
                              </div>
                              <ChevronDown
                                className={`h-5 w-5 text-muted-foreground transition-transform ${expandedId === query._id ? 'rotate-180' : ''
                                  }`}
                              />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="border-t border-border bg-secondary/30 p-4">
                            <div className="space-y-3">
                              {userRole !== 'ceo' && (
                                <div className="flex justify-end gap-2 mb-4">
                                  <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="outline" onClick={() => handleEditQuery(query)}>
                                        <Edit2 className="h-4 w-4 mr-1" />
                                        Edit Status
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                      <DialogHeader>
                                        <DialogTitle>Edit Query Status</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-foreground">Status</label>
                                            <Select value={formData.status || 'Open'} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {statuses.map(status => (
                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-foreground">Priority</label>
                                            <Select value={formData.priority || 'Medium'} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                                              <SelectTrigger>
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {priorities.map(priority => (
                                                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-foreground">Response</label>
                                          <Textarea
                                            value={formData.response || ''}
                                            onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                                            placeholder="Response to the query"
                                            className="min-h-24"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-foreground">Assigned To</label>
                                          <Input
                                            value={formData.assignedTo || ''}
                                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                            placeholder="Staff member assigned"
                                          />
                                        </div>
                                        <Button onClick={handleSave} className="w-full">
                                          Update Query
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteQuery(query._id)}>
                                    Delete
                                  </Button>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground mb-1">Parent Email</div>
                                  <div className="text-foreground">{query.email}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Phone</div>
                                  <div className="text-foreground">{query.phone}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Date Submitted</div>
                                  <div className="text-foreground">{new Date(query.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground mb-1">Student</div>
                                  <div className="text-foreground">{query.studentName}</div>
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-2 text-sm">Message</div>
                                <p className="text-foreground text-sm leading-relaxed">{query.message}</p>
                              </div>
                              {query.response && (
                                <div>
                                  <div className="text-muted-foreground mb-2 text-sm">Response</div>
                                  <p className="text-foreground text-sm leading-relaxed bg-green-50 p-3 rounded">{query.response}</p>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border border-border rounded-lg">
                      {queries.length === 0 ? 'No queries found' : 'No queries found matching your criteria'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
