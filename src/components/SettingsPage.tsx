import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { User, Bell, Shield, Database, Mail, Lock } from "lucide-react";
import type { User as UserType } from "../App";

interface SettingsPageProps {
  currentUser: UserType;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={currentUser.name.split(' ')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={currentUser.name.split(' ').slice(1).join(' ')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={currentUser.email} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" defaultValue="Tax Administration" />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
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
                  <div className="text-gray-900">Transaction Alerts</div>
                  <div className="text-gray-500">Get notified of large transactions</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="text-gray-900">Daily Summary</div>
                  <div className="text-gray-500">Receive daily collection summaries</div>
                </div>
                <Switch />
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
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button variant="outline">Change Password</Button>
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
                <div className="text-gray-900">Director Level Admin</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Access Level</div>
                <div className="text-gray-900">Full Access</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Account Created</div>
                <div className="text-gray-900">Jan 15, 2024</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Last Login</div>
                <div className="text-gray-900">Nov 20, 2025 14:35</div>
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
                <div className="text-gray-600 mb-1">Version</div>
                <div className="text-gray-900">v2.5.1</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Database Status</div>
                <div className="text-green-600">Connected</div>
              </div>
              <Separator />
              <div>
                <div className="text-gray-600 mb-1">Last Backup</div>
                <div className="text-gray-900">Nov 20, 2025 02:00</div>
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
              <p className="text-gray-600 mb-4">Need help? Contact our support team</p>
              <Button variant="outline" className="w-full">Contact Support</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}