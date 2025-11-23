import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Edit, Trash2, UserCheck, Users as UsersIcon } from "lucide-react";
import type { UserRole } from "../App";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: string;
  status: "active" | "inactive";
  lastLogin: string;
}

const mockUsers: UserData[] = [
  { id: "1", name: "Director Level", email: "director@taxadmin.gov", role: "administrator", status: "active", lastLogin: "2025-11-20 14:35" },
  { id: "2", name: "John Collector", email: "john.c@taxadmin.gov", role: "tax-collector", station: "Pasaela Gate", status: "active", lastLogin: "2025-11-20 13:20" },
  { id: "3", name: "Mary Manager", email: "mary.m@taxadmin.gov", role: "remittance-manager", status: "active", lastLogin: "2025-11-20 12:15" },
  { id: "4", name: "David Tax", email: "david.t@taxadmin.gov", role: "tax-collector", station: "8-Mile Gate", status: "active", lastLogin: "2025-11-20 11:45" },
  { id: "5", name: "Sarah Remit", email: "sarah.r@taxadmin.gov", role: "remittance-manager", status: "active", lastLogin: "2025-11-19 16:30" },
  { id: "6", name: "Tom Collector", email: "tom.c@taxadmin.gov", role: "tax-collector", station: "Central District", status: "inactive", lastLogin: "2025-11-18 09:00" },
];

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "administrator":
      return "Administrator";
    case "remittance-manager":
      return "Remittance Manager";
    case "tax-collector":
      return "Tax Collector";
  }
};

const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case "administrator":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "remittance-manager":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "tax-collector":
      return "bg-green-100 text-green-800 hover:bg-green-100";
  }
};

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const activeUsers = users.filter(u => u.status === "active").length;
  const administratorCount = users.filter(u => u.role === "administrator").length;
  const remittanceManagerCount = users.filter(u => u.role === "remittance-manager").length;
  const taxCollectorCount = users.filter(u => u.role === "tax-collector").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and role assignments</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" 
          onClick={handleAddUser}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information and role" : "Add a new user to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter full name" defaultValue={editingUser?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="user@taxadmin.gov" defaultValue={editingUser?.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue={editingUser?.role || "tax-collector"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrator">Administrator</SelectItem>
                  <SelectItem value="remittance-manager">Remittance Manager</SelectItem>
                  <SelectItem value="tax-collector">Tax Collector</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="station">Station (Optional)</Label>
              <Input id="station" placeholder="e.g., Pasaela Gate" defaultValue={editingUser?.station} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder={editingUser ? "Leave blank to keep current" : "Enter password"} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => setIsDialogOpen(false)}>
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Total Users</CardTitle>
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{users.length}</div>
            <p className="text-green-600">{activeUsers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Administrators</CardTitle>
              <UserCheck className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{administratorCount}</div>
            <p className="text-gray-500">Full access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Remittance Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{remittanceManagerCount}</div>
            <p className="text-gray-500">Limited access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Tax Collectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{taxCollectorCount}</div>
            <p className="text-gray-500">Collection only</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>Manage system users and their access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="text-gray-600">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.station || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{user.lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={user.role === "administrator"}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>Overview of what each role can access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Dashboard access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Tax collection (full)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Remittance management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> User management
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-purple-100 text-purple-800">Remittance Manager</Badge>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> Dashboard access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Tax collection (view only)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Remittance management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> User management
                </li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-green-100 text-green-800">Tax Collector</Badge>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> Dashboard access
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Tax collection only
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> Remittance management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> Reports
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-600">✗</span> User management
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}