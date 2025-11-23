import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox"; // Need to import Checkbox
import { Plus, Edit, Trash2, UserCheck, Users as UsersIcon, Loader2, ShieldCheck } from "lucide-react";
import type { UserRole } from "../App";

// Firebase Imports
import { db, auth } from "../firebase"; 
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Re-import config for secondary app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Updated Interface with Granular Permissions
interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  station?: string;
  department?: string; // New Field
  allowedTaxTypes?: string[]; // New Field
  status: "active" | "inactive";
  lastLogin?: string;
  createdAt?: string;
}

// Available Departments & Tax Types (This could also come from Firestore later)
const DEPARTMENTS = [
  { id: "trade", label: "Trade & Commerce" },
  { id: "agriculture", label: "Agriculture & Irrigation" },
  { id: "transport", label: "Transport & Construction" },
  { id: "finance", label: "Planning & Finance (Central)" },
];

const TAX_TYPES = [
  { id: "commercial", label: "Commercial Tax" },
  { id: "customs", label: "Customs Duty" },
  { id: "road", label: "Road Tax" },
  { id: "bridge", label: "Bridge Tax" },
  { id: "land", label: "Land Tax" },
  { id: "irrigation", label: "Irrigation Tax" },
  { id: "agriculture", label: "Agriculture Tax" },
  { id: "import-export", label: "Import/Export Tax" },
];

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "administrator": return "Administrator";
    case "remittance-manager": return "Remittance Manager";
    case "tax-collector": return "Tax Collector";
    default: return role;
  }
};

const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case "administrator": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "remittance-manager": return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "tax-collector": return "bg-green-100 text-green-800 hover:bg-green-100";
    default: return "bg-gray-100 text-gray-800";
  }
};

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const superAdminEmail = "testadmin1@krns.tax.app"; 
  const isSuperAdmin = auth.currentUser?.email === superAdminEmail;

  // Updated Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "tax-collector" as UserRole,
    station: "",
    department: "",
    allowedTaxTypes: [] as string[],
    password: ""
  });

  // Fetch Users
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentUser = auth.currentUser;
      const userList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserData))
        .filter(user => {
          if (!currentUser) return false;
          if (currentUser.email === superAdminEmail) return true;
          if (user.email === superAdminEmail) return false;
          return true;
        });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({ 
      name: "", email: "", role: "tax-collector", station: "", department: "", allowedTaxTypes: [], password: "" 
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      station: user.station || "", 
      department: user.department || "",
      allowedTaxTypes: user.allowedTaxTypes || [],
      password: "" 
    });
    setIsDialogOpen(true);
  };

  const handleTaxTypeToggle = (taxId: string) => {
    setFormData(prev => {
      const currentTypes = prev.allowedTaxTypes;
      if (currentTypes.includes(taxId)) {
        return { ...prev, allowedTaxTypes: currentTypes.filter(id => id !== taxId) };
      } else {
        return { ...prev, allowedTaxTypes: [...currentTypes, taxId] };
      }
    });
  };

  const handleSaveUser = async () => {
    setLoading(true);
    try {
      const userDataToSave = {
        name: formData.name,
        role: formData.role,
        station: formData.station,
        department: formData.department,
        allowedTaxTypes: formData.allowedTaxTypes
      };

      if (editingUser) {
        const userRef = doc(db, "users", editingUser.id);
        await updateDoc(userRef, userDataToSave);
        alert("User updated successfully!");
      } else {
        if (!formData.password || formData.password.length < 6) {
          alert("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        const secondaryApp = initializeApp(firebaseConfig, "Secondary");
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const newUser = userCredential.user;

        await setDoc(doc(db, "users", newUser.uid), {
          ...userDataToSave,
          email: formData.email,
          status: "active",
          createdAt: new Date().toISOString(),
          lastLogin: "Never"
        });

        alert(`User created successfully!\nEmail: ${formData.email}`);
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
    if (userId === auth.currentUser?.uid) {
      alert("You cannot delete your own account.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error("Error deleting:", error);
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
          <p className="text-gray-600">Manage accounts, departments, and tax permissions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              Configure user role, department access, and tax permissions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!!editingUser} 
                />
              </div>
            </div>

            {/* Role & Station */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">System Role</Label>
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
                  value={formData.station}
                  onChange={(e) => setFormData({...formData, station: e.target.value})}
                  placeholder="e.g., Pasaela Gate"
                />
              </div>
            </div>

            {/* Department Selection (New) */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(val) => setFormData({...formData, department: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Granular Tax Permissions (New - Only show if Tax Collector) */}
            {formData.role === "tax-collector" && (
              <div className="space-y-3 border rounded-md p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <Label className="text-blue-900 font-medium">Authorized Tax Types</Label>
                </div>
                <p className="text-xs text-gray-500">Select which taxes this user is allowed to collect.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {TAX_TYPES.map((tax) => (
                    <div key={tax.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`tax-${tax.id}`} 
                        checked={formData.allowedTaxTypes.includes(tax.id)}
                        onCheckedChange={() => handleTaxTypeToggle(tax.id)}
                      />
                      <label
                        htmlFor={`tax-${tax.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {tax.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Password */}
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

      {/* User Table (Keep your existing layout here, just adding Department column maybe?) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* ... Stats Cards (Same as before) ... */}
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
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead> 
                  <TableHead>Station</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 capitalize">
                      {DEPARTMENTS.find(d => d.id === user.department)?.label || "-"}
                    </TableCell>
                    <TableCell>{user.station || "-"}</TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
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
                          disabled={user.role === "administrator" && !isSuperAdmin}
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