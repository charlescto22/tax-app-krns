import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Edit, Trash2, UserCheck, Users as UsersIcon, Loader2 } from "lucide-react";
import type { UserRole } from "../App";

// Firebase Imports
import { db } from "../firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Need to re-import config for the secondary app instance
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: string;
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt?: string;
}

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "administrator":
      return "Administrator";
    case "remittance-manager":
      return "Remittance Manager";
    case "tax-collector":
      return "Tax Collector";
    default:
      return role;
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
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "tax-collector" as UserRole,
    station: "",
    password: ""
  });

  // 1. Fetch Users Real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserData));
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "tax-collector", station: "", password: "" });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      station: user.station || "", 
      password: "" // Password empty on edit
    });
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    setLoading(true);
    try {
      if (editingUser) {
        // Update Existing User (Firestore Only)
        const userRef = doc(db, "users", editingUser.id);
        await updateDoc(userRef, {
          name: formData.name,
          role: formData.role,
          station: formData.station,
          // Note: Changing email/password requires Admin SDK or user re-auth
        });
        alert("User updated successfully!");
      } else {
        // Create New User
        if (!formData.password || formData.password.length < 6) {
          alert("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        // Workaround: Use a secondary app to create user without logging out admin
        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const newUser = userCredential.user;

        // Save user profile to Firestore (Main DB)
        await setDoc(doc(db, "users", newUser.uid), {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          station: formData.station,
          status: "active",
          createdAt: new Date().toISOString(),
          lastLogin: "Never"
        });

        // Cleanup secondary app
        // Note: In older Firebase versions, deleteApp() might be needed. 
        // In v9 modular, letting it go out of scope usually works, but explicit cleanup is safer if supported.
        // await deleteApp(secondaryApp); 

        alert(`User created successfully!\nEmail: ${formData.email}\nPassword: ${formData.password}`);
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user from the database? (This does not delete their Auth account)")) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user.");
      }
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
              <Input 
                id="name" 
                placeholder="Enter full name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="user@taxadmin.gov" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!!editingUser} // Disable email edit for now
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val) => setFormData({...formData, role: val as UserRole})}
              >
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
              <Input 
                id="station" 
                placeholder="e.g., Pasaela Gate" 
                value={formData.station}
                onChange={(e) => setFormData({...formData, station: e.target.value})}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700" 
              onClick={handleSaveUser}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    <TableCell className="text-gray-600">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString() 
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user.id)}
                          // Optional: Prevent deleting admins or yourself
                          // disabled={user.role === "administrator"} 
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
    </>
  );
}