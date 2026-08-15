import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Plus, Edit, Trash2, UserCheck, Users as UsersIcon, Loader2, ShieldCheck,
  KeyRound, Smartphone, Shield, Ban, CheckCircle, RefreshCw, Copy, Mail,
  MonitorSmartphone, UserX, UserPlus
} from "lucide-react";
import type { UserRole } from "../App";
import type { DeviceRecord, ManagedUser, SsoAccessRequest } from "../types/userAdmin";
import { DEFAULT_MAX_DEVICES } from "../types/userAdmin";
import { db, auth, firebaseConfig } from "../firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { generateSecurePassword } from "../utils/passwordGen";
import {
  adminSendPasswordReset,
  listUserDevices,
  revokeDevice,
  setUserMaxDevices,
  setUserActiveStatus,
  listSsoRequests,
  approveSsoRequest,
  rejectSsoRequest,
  recordTempPasswordAction,
} from "../utils/userAdminApi";

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
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [ssoRequests, setSsoRequests] = useState<SsoAccessRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<{
    open: boolean;
    email: string;
    password: string;
    mode: "generated" | "reset";
  }>({ open: false, email: "", password: "", mode: "generated" });
  const [maxDevicesDraft, setMaxDevicesDraft] = useState("2");
  const [actionMsg, setActionMsg] = useState("");

  const superAdminEmail = "testadmin1@krns.tax.app";
  const isSuperAdmin = auth.currentUser?.email === superAdminEmail;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "tax-collector" as UserRole,
    station: "",
    department: "",
    allowedTaxTypes: [] as string[],
    password: "",
    maxDevices: DEFAULT_MAX_DEVICES,
  });

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentUser = auth.currentUser;
      const userList = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as ManagedUser))
        .filter((user) => {
          if (!currentUser) return false;
          if (currentUser.email === superAdminEmail) return true;
          if (user.email === superAdminEmail) return false;
          return true;
        });
      setUsers(userList);
    });

    const unsubSso = onSnapshot(collection(db, "ssoAccessRequests"), async () => {
      try {
        const list = await listSsoRequests();
        setSsoRequests(list);
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      unsubUsers();
      unsubSso();
    };
  }, []);

  const refreshDevices = async (user: ManagedUser) => {
    setDevicesLoading(true);
    try {
      const list = await listUserDevices(user.id);
      setDevices(list);
      setMaxDevicesDraft(String(user.maxDevices ?? DEFAULT_MAX_DEVICES));
    } catch (e) {
      console.error(e);
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  };

  const openDevicePanel = async (user: ManagedUser) => {
    setSelectedUser(user);
    await refreshDevices(user);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    const generated = generateSecurePassword();
    setFormData({
      name: "",
      email: "",
      role: "tax-collector",
      station: "",
      department: "",
      allowedTaxTypes: [],
      password: generated,
      maxDevices: DEFAULT_MAX_DEVICES,
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: ManagedUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      station: user.station || "",
      department: user.department || "",
      allowedTaxTypes: user.allowedTaxTypes || [],
      password: "",
      maxDevices: user.maxDevices ?? DEFAULT_MAX_DEVICES,
    });
    setIsDialogOpen(true);
  };

  const handleTaxTypeToggle = (taxId: string) => {
    setFormData((prev) => {
      const currentTypes = prev.allowedTaxTypes;
      if (currentTypes.includes(taxId)) {
        return { ...prev, allowedTaxTypes: currentTypes.filter((id) => id !== taxId) };
      }
      return { ...prev, allowedTaxTypes: [...currentTypes, taxId] };
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
        allowedTaxTypes: formData.allowedTaxTypes,
        maxDevices: Number(formData.maxDevices) || DEFAULT_MAX_DEVICES,
        deviceEnforcement: "strict" as const,
      };

      if (editingUser) {
        await updateDoc(doc(db, "users", editingUser.id), userDataToSave);
        setActionMsg("User updated successfully.");
      } else {
        if (!formData.password || formData.password.length < 8) {
          alert("Password must be at least 8 characters.");
          setLoading(false);
          return;
        }

        const appName = `Secondary-${Date.now()}`;
        const secondaryApp = initializeApp(firebaseConfig, appName);
        const secondaryAuth = getAuth(secondaryApp);

        try {
          const userCredential = await createUserWithEmailAndPassword(
            secondaryAuth,
            formData.email,
            formData.password
          );
          const newUser = userCredential.user;

          await setDoc(doc(db, "users", newUser.uid), {
            ...userDataToSave,
            email: formData.email,
            status: "active",
            mustChangePassword: true,
            ssoStatus: "none",
            createdAt: new Date().toISOString(),
            lastLogin: "Never",
          });

          setPasswordDialog({
            open: true,
            email: formData.email,
            password: formData.password,
            mode: "generated",
          });
        } finally {
          await fbSignOut(secondaryAuth).catch(() => undefined);
          const app = getApps().find((a) => a.name === appName);
          if (app) await deleteApp(app).catch(() => undefined);
        }
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
    if (confirm("Delete this user profile from Firestore? (Auth account may still exist.)")) {
      try {
        await deleteDoc(doc(db, "users", userId));
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete user.");
      }
    }
  };

  const handleSendReset = async (user: ManagedUser) => {
    try {
      await adminSendPasswordReset(user.email);
      await updateDoc(doc(db, "users", user.id), { mustChangePassword: true });
      setPasswordDialog({ open: true, email: user.email, password: "", mode: "reset" });
    } catch (e: any) {
      alert("Failed to send reset email: " + (e?.message || "unknown error"));
    }
  };

  const handleGeneratePassword = async (user: ManagedUser) => {
    const password = generateSecurePassword();
    try {
      await adminSendPasswordReset(user.email);
      await recordTempPasswordAction(user.id, user.email);
      setPasswordDialog({ open: true, email: user.email, password, mode: "generated" });
    } catch (e: any) {
      alert("Failed: " + (e?.message || "unknown error"));
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const next = user.status === "active" ? "inactive" : "active";
    if (!confirm(`${next === "inactive" ? "Deactivate" : "Activate"} ${user.email}?`)) return;
    try {
      await setUserActiveStatus(user.id, next);
      setActionMsg(`User marked ${next}.`);
    } catch (e: any) {
      alert(e?.message || "Failed to update status");
    }
  };

  const handleSaveMaxDevices = async () => {
    if (!selectedUser) return;
    const value = Math.max(1, Math.min(10, parseInt(maxDevicesDraft, 10) || 1));
    try {
      await setUserMaxDevices(selectedUser.id, value);
      setSelectedUser({ ...selectedUser, maxDevices: value });
      setActionMsg(`Device limit set to ${value} for ${selectedUser.email}`);
    } catch (e: any) {
      alert(e?.message || "Failed to update device limit");
    }
  };

  const handleRevokeDevice = async (device: DeviceRecord) => {
    if (!selectedUser || !auth.currentUser) return;
    if (!confirm(`Revoke device "${device.label}"?`)) return;
    try {
      await revokeDevice(selectedUser.id, device.id, auth.currentUser.uid);
      await refreshDevices(selectedUser);
    } catch (e: any) {
      alert(e?.message || "Failed to revoke device");
    }
  };

  const handleApproveSso = async (request: SsoAccessRequest) => {
    if (!auth.currentUser) return;
    const role = (request.requestedRole || "tax-collector") as UserRole;
    const linkedUid = request.providerUid || request.linkedUid;
    if (!linkedUid) {
      alert("Missing provider user id on this request.");
      return;
    }
    try {
      await approveSsoRequest(request, auth.currentUser.uid, linkedUid, role);
      setActionMsg(`Approved SSO for ${request.email}`);
    } catch (e: any) {
      alert(e?.message || "Failed to approve SSO request");
    }
  };

  const handleRejectSso = async (request: SsoAccessRequest) => {
    if (!auth.currentUser) return;
    const reason = prompt("Rejection reason:", "Not authorized for IEC Taxation") || "Rejected";
    try {
      await rejectSsoRequest(request.id, auth.currentUser.uid, reason);
      setActionMsg(`Rejected SSO for ${request.email}`);
    } catch (e: any) {
      alert(e?.message || "Failed to reject request");
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setActionMsg("Copied to clipboard.");
    } catch {
      alert(text);
    }
  };

  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingSso = ssoRequests.filter((r) => r.status === "pending").length;
  const administratorCount = users.filter((u) => u.role === "administrator").length;
  const remittanceManagerCount = users.filter((u) => u.role === "remittance-manager").length;
  const taxCollectorCount = users.filter((u) => u.role === "tax-collector").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Unified User Admin</h1>
          <p className="text-gray-600">
            Accounts, device limits, password controls, and SSO approval workflow
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {actionMsg && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{actionMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600 text-sm">Total Users</CardTitle>
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 text-xl">{users.length}</div>
            <p className="text-green-600 text-sm">{activeUsers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm">Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 text-xl">{administratorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm">Managers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 text-xl">{remittanceManagerCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600 text-sm">Collectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 text-xl">{taxCollectorCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600 text-sm">SSO Pending</CardTitle>
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 text-xl">{pendingSso}</div>
            <p className="text-orange-600 text-sm">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="sso">SSO Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>
                Manage roles, activation, passwords, and open device controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Devices</TableHead>
                      <TableHead>SSO</TableHead>
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
                          <Badge className={getRoleColor(user.role)}>{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {user.status || "active"}
                          </Badge>
                          {user.mustChangePassword && (
                            <div className="text-xs text-orange-600 mt-1">Must change password</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          Max {user.maxDevices ?? DEFAULT_MAX_DEVICES}
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {user.ssoStatus && user.ssoStatus !== "none" ? user.ssoStatus : "—"}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {user.lastLogin && user.lastLogin !== "Never"
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 flex-wrap">
                            <Button variant="ghost" size="sm" title="Edit" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Devices" onClick={() => openDevicePanel(user)}>
                              <Smartphone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Reset password email" onClick={() => handleSendReset(user)}>
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Generate password" onClick={() => handleGeneratePassword(user)}>
                              <KeyRound className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Activate/Deactivate" onClick={() => handleToggleStatus(user)}>
                              {user.status === "active" ? (
                                <UserX className="h-4 w-4 text-orange-600" />
                              ) : (
                                <UserPlus className="h-4 w-4 text-green-600" />
                              )}
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
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MonitorSmartphone className="h-5 w-5" />
                Device limitation
              </CardTitle>
              <CardDescription>
                Select a user from the Users tab (phone icon) or below to view and revoke devices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select
                  value={selectedUser?.id || ""}
                  onValueChange={(id) => {
                    const user = users.find((u) => u.id === id);
                    if (user) openDevicePanel(user);
                  }}
                >
                  <SelectTrigger className="sm:max-w-md">
                    <SelectValue placeholder="Select user…" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUser && (
                <>
                  <div className="flex flex-col sm:flex-row gap-3 items-end border rounded-md p-4 bg-gray-50">
                    <div className="space-y-2 flex-1">
                      <Label>Max devices for {selectedUser.email}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={maxDevicesDraft}
                        onChange={(e) => setMaxDevicesDraft(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleSaveMaxDevices} className="bg-blue-600 hover:bg-blue-700">
                      Save limit
                    </Button>
                    <Button variant="outline" onClick={() => refreshDevices(selectedUser)} disabled={devicesLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${devicesLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Device</TableHead>
                        <TableHead>Last seen</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500">
                            No registered devices yet.
                          </TableCell>
                        </TableRow>
                      )}
                      {devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>
                            <div className="font-medium">{device.label}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{device.deviceId}</div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={device.revoked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                              {device.revoked ? "Revoked" : "Active"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {!device.revoked && (
                              <Button variant="outline" size="sm" onClick={() => handleRevokeDevice(device)}>
                                <Ban className="h-4 w-4 mr-1" />
                                Revoke
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                SSO approval workflow
              </CardTitle>
              <CardDescription>
                Review Google / SSO sign-in requests. Approve to link the identity and grant app access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ssoRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500">
                        No SSO requests yet. Users can request access from the login page.
                      </TableCell>
                    </TableRow>
                  )}
                  {ssoRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.displayName || "—"}</div>
                        <div className="text-xs text-gray-500">{request.email}</div>
                      </TableCell>
                      <TableCell className="capitalize">{request.provider}</TableCell>
                      <TableCell className="text-sm">
                        {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            request.status === "pending"
                              ? "bg-orange-100 text-orange-800"
                              : request.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApproveSso(request)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectSso(request)}>
                              Reject
                            </Button>
                          </div>
                        )}
                        {request.status === "rejected" && request.rejectReason && (
                          <span className="text-xs text-gray-500">{request.rejectReason}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create New User"}</DialogTitle>
            <DialogDescription>
              Configure role, department, device limit, and credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>System Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
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
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                  placeholder="e.g., Pasaela Gate"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(val) => setFormData({ ...formData, department: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDevices">Max devices</Label>
                <Input
                  id="maxDevices"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.maxDevices}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDevices: parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>
            </div>

            {formData.role === "tax-collector" && (
              <div className="space-y-3 border rounded-md p-4 bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <Label className="text-blue-900 font-medium">Authorized Tax Types</Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {TAX_TYPES.map((tax) => (
                    <div key={tax.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tax-${tax.id}`}
                        checked={formData.allowedTaxTypes.includes(tax.id)}
                        onCheckedChange={() => handleTaxTypeToggle(tax.id)}
                      />
                      <label htmlFor={`tax-${tax.id}`} className="text-sm cursor-pointer">
                        {tax.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, password: generateSecurePassword() })}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">User will be required to change this password after first login.</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleSaveUser} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingUser ? "Update User" : "Create User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password result dialog */}
      <Dialog
        open={passwordDialog.open}
        onOpenChange={(open) => setPasswordDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {passwordDialog.mode === "reset" ? "Password reset email sent" : "Password generated"}
            </DialogTitle>
            <DialogDescription>
              {passwordDialog.mode === "reset"
                ? `A reset link was sent to ${passwordDialog.email}.`
                : `Share these credentials securely with ${passwordDialog.email}. A reset email was also sent so they can confirm access.`}
            </DialogDescription>
          </DialogHeader>
          {passwordDialog.password && (
            <div className="space-y-2">
              <Label>Temporary password</Label>
              <div className="flex gap-2">
                <Input readOnly value={passwordDialog.password} />
                <Button type="button" variant="outline" onClick={() => copyText(passwordDialog.password)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Ask the user to open the reset email and set this password (or a new one). They must change it again on first login.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPasswordDialog((p) => ({ ...p, open: false }))}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
