// 1. Add useEffect to the import list
import { useState, useEffect } from "react"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { User, Bell, Shield, Database, Mail, Lock, Loader2 } from "lucide-react";
import type { User as UserType } from "../App";
import { auth, db } from "../firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

// Add APP_VERSION constant
const APP_VERSION = "1.0.2 (Beta)";

interface SettingsPageProps {
  currentUser: UserType;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const [name, setName] = useState(currentUser.name);
  const [email] = useState(currentUser.email); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleUpdateProfile = async () => {
    if (!auth.currentUser) return;
    setProfileLoading(true);
    try {
      // 1. Update Auth Profile
      await updateProfile(auth.currentUser, {
        displayName: name
      });

      // 2. Update Firestore Document
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name: name
      });

      alert("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile: " + error.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!auth.currentUser) return;
    
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      
      alert("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("For security, please log out and log back in before changing your password.");
      } else {
        alert("Failed to change password: " + error.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">User Settings</h1>
        <p className="text-gray-600">Manage your account preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal information and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input 
                    id="displayName" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} disabled className="bg-gray-100" />
                <p className="text-xs text-gray-500">Email cannot be changed.</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleUpdateProfile}
                disabled={profileLoading}
              >
                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-gray-900">Email Notifications</div>
                  <div className="text-gray-500">Receive email updates for important events</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-gray-900">System Updates</div>
                  <div className="text-gray-500">Important system announcements</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password (Required for verification)</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Account Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-gray-600 mb-1">Role</div>
                <div className="text-gray-900 font-medium capitalize">
                  {currentUser.role.replace("-", " ")}
                </div>
              </div>
              
              {/* REMOVED User ID section */}
              
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Email</div>
                <div className="text-gray-900">{currentUser.email}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>System Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-gray-600 mb-1">App Version</div>
                <div className="text-gray-900">{APP_VERSION}</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Connection Status</div>
                <div className={`font-medium ${isOnline ? "text-green-600" : "text-orange-600"}`}>
                  {isOnline ? "● Connected (Online)" : "○ Offline Mode"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Need help? Contact our IT support team.</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = `mailto:itofficer@irt-iec.karennistategovernment.org?subject=Support Request from ${currentUser.name}`}
              >
                Contact Support via Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}