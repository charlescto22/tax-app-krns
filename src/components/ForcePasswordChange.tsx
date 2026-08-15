import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, KeyRound, Shield } from "lucide-react";
import { updatePassword } from "firebase/auth";
import { auth } from "../firebase";
import { markMustChangePassword } from "../utils/userAdminApi";

interface ForcePasswordChangeProps {
  userId: string;
  onCompleted: () => void;
}

export function ForcePasswordChange({ userId, onCompleted }: ForcePasswordChangeProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!auth.currentUser) {
      setError("Session expired. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(auth.currentUser, password);
      await markMustChangePassword(userId, false);
      onCompleted();
    } catch (err: any) {
      console.error(err);
      if (err?.code === "auth/requires-recent-login") {
        setError("For security, please log out and sign in again, then change your password.");
      } else {
        setError(err?.message || "Failed to update password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-blue-600" />
            <CardTitle>Password change required</CardTitle>
          </div>
          <CardDescription>
            An administrator reset or generated your password. Set a new password before continuing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Shield className="h-3 w-3 mt-0.5" />
              Use at least 8 characters with upper, lower, number, and a symbol when possible.
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save new password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
