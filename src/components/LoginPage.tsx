import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, CheckCircle2, Loader2 } from "lucide-react";
import type { User } from "../App";

// Firebase Imports
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Check for saved email on mount
  useEffect(() => {
    const savedRemember = localStorage.getItem("rememberMe");
    if (savedRemember) {
      try {
        const remember = JSON.parse(savedRemember);
        setEmail(remember.email);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem("rememberMe");
      }
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const checkPasswordStrength = (pwd: string) => {
    setPasswordStrength({
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Fetch User Role & Name from Firestore
      // (We assume there is a 'users' collection with documents matching the UID)
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: User;

      if (userDoc.exists()) {
        const data = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: data.name || "Unknown User",
          role: data.role || "tax-collector", // Default role if missing
        };
      } else {
        // Fallback for initial admin setup (or if user doc is missing)
        // WARNING: In production, you should ensure every user has a Firestore doc.
        console.warn("User document not found in Firestore. Using fallback.");
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.email?.split('@')[0] || "User",
          role: "administrator", // Temporary fallback for testing your first user
        };
      }

      // 3. Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem("rememberMe", JSON.stringify({ email: email }));
      } else {
        localStorage.removeItem("rememberMe");
      }

      // 4. Create Session
      sessionStorage.setItem("userSession", JSON.stringify({
        user: userData,
        timestamp: Date.now(),
      }));

      onLoginSuccess(userData);

    } catch (err: any) {
      console.error("Login error:", err);
      
      // Handle Firebase specific errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Account temporarily locked due to too many failed attempts. Please try again later.");
      } else {
        setError("An error occurred. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-2xl">IEC</span>
            </div>
          </div>
          <h1 className="text-gray-900">Tax Administration Portal</h1>
          <p className="text-gray-600">Secure Government Access</p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Shield className="h-4 w-4" />
            <span className="text-sm">Secured by Firebase Auth</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@taxadmin.gov"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={isLoading}
                    autoComplete="current-password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasLength ? 'text-green-600' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    {/* ... (rest of strength indicators can remain or be simplified) */}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-700 px-0"
                  disabled={isLoading}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 Tax Administration Department</p>
          <p>Government Portal - Authorized Access Only</p>
        </div>
      </div>
    </div>
  );
}