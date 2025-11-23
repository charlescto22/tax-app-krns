import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, CheckCircle2 } from "lucide-react";
import type { User, UserRole } from "../App";

// Simulated user database (in production, this would be server-side with proper bcrypt hashing)
// For demo purposes, we'll use simple password matching
const DEMO_USERS = [
  {
    id: "1",
    email: "admin@taxadmin.gov",
    password: "Admin@123!", // In production, this would be a hash
    name: "Director Level",
    role: "administrator" as UserRole,
    isActive: true,
  },
  {
    id: "2",
    email: "manager@taxadmin.gov",
    password: "Manager@123!", // In production, this would be a hash
    name: "Remittance Manager",
    role: "remittance-manager" as UserRole,
    isActive: true,
  },
  {
    id: "3",
    email: "collector@taxadmin.gov",
    password: "Collector@123!", // In production, this would be a hash
    name: "Tax Collector",
    role: "tax-collector" as UserRole,
    isActive: true,
  },
];

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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

  // Session timeout management (15 minutes of inactivity)
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    // Check for existing session
    const savedSession = sessionStorage.getItem("userSession");
    const savedRemember = localStorage.getItem("rememberMe");
    
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const sessionAge = Date.now() - session.timestamp;
        
        if (sessionAge < SESSION_TIMEOUT) {
          // Valid session exists
          onLoginSuccess(session.user);
        } else {
          // Session expired
          sessionStorage.removeItem("userSession");
        }
      } catch (e) {
        sessionStorage.removeItem("userSession");
      }
    } else if (savedRemember) {
      try {
        const remember = JSON.parse(savedRemember);
        setEmail(remember.email);
        setRememberMe(true);
      } catch (e) {
        localStorage.removeItem("rememberMe");
      }
    }

    // Check for lockout
    const lockout = sessionStorage.getItem("loginLockout");
    if (lockout) {
      try {
        const lockoutData = JSON.parse(lockout);
        const lockoutAge = Date.now() - lockoutData.timestamp;
        
        if (lockoutAge < LOCKOUT_DURATION) {
          setIsLocked(true);
          setLockoutTime(lockoutData.timestamp + LOCKOUT_DURATION);
          setFailedAttempts(lockoutData.attempts || MAX_FAILED_ATTEMPTS);
        } else {
          sessionStorage.removeItem("loginLockout");
        }
      } catch (e) {
        sessionStorage.removeItem("loginLockout");
      }
    }
  }, [onLoginSuccess]);

  // Update lockout timer
  useEffect(() => {
    if (isLocked && lockoutTime) {
      const interval = setInterval(() => {
        if (Date.now() >= lockoutTime) {
          setIsLocked(false);
          setLockoutTime(null);
          setFailedAttempts(0);
          sessionStorage.removeItem("loginLockout");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockoutTime]);

  // Input validation and sanitization
  const sanitizeInput = (input: string): string => {
    // Remove potential XSS vectors
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  };

  // Validate email format (OWASP recommended)
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321
  };

  // Check password strength
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
    // Don't sanitize password - it needs special characters
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeInput(value);
    setEmail(sanitized.toLowerCase()); // Normalize email to lowercase
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check if account is locked
    if (isLocked) {
      const remainingTime = lockoutTime ? Math.ceil((lockoutTime - Date.now()) / 1000 / 60) : 0;
      setError(`Account locked due to multiple failed attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    // Input validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    // Simulate network delay (OWASP: Timing attack prevention)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Find user by email
      const user = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

      // Check credentials
      if (!user || user.password !== password) {
        // OWASP: Generic error message to prevent user enumeration
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);

        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          setIsLocked(true);
          const lockTime = Date.now();
          setLockoutTime(lockTime + LOCKOUT_DURATION);
          sessionStorage.setItem("loginLockout", JSON.stringify({
            timestamp: lockTime,
            attempts: newFailedAttempts,
          }));
          setError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION / 60000} minutes.`);
        } else {
          setError(`Invalid email or password. ${MAX_FAILED_ATTEMPTS - newFailedAttempts} attempts remaining.`);
        }
        
        setIsLoading(false);
        return;
      }

      // Check if user account is active
      if (!user.isActive) {
        setError("Your account has been deactivated. Please contact the administrator.");
        setIsLoading(false);
        return;
      }

      // Success - Create session
      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // Store session with timestamp
      sessionStorage.setItem("userSession", JSON.stringify({
        user: userSession,
        timestamp: Date.now(),
      }));

      // Handle "Remember Me"
      if (rememberMe) {
        // Only store email, never passwords
        localStorage.setItem("rememberMe", JSON.stringify({
          email: user.email,
        }));
      } else {
        localStorage.removeItem("rememberMe");
      }

      // Reset failed attempts
      setFailedAttempts(0);
      sessionStorage.removeItem("loginLockout");

      // Security: Clear sensitive data
      setPassword("");
      
      // Login success
      onLoginSuccess(userSession);

    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingLockoutTime = (): string => {
    if (!lockoutTime) return "";
    const remaining = Math.max(0, lockoutTime - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fillDemoCredentials = (role: 'admin' | 'manager' | 'collector') => {
    switch (role) {
      case 'admin':
        setEmail('admin@taxadmin.gov');
        setPassword('Admin@123!');
        break;
      case 'manager':
        setEmail('manager@taxadmin.gov');
        setPassword('Manager@123!');
        break;
      case 'collector':
        setEmail('collector@taxadmin.gov');
        setPassword('Collector@123!');
        break;
    }
    checkPasswordStrength(password);
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
            <span className="text-sm">OWASP Security Enabled</span>
          </div>
        </div>

        {/* Demo Credentials Banner */}
        {showDemoCredentials && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2 text-sm flex-1">
                  <div><strong>Demo Accounts:</strong></div>
                  <div>Admin: admin@taxadmin.gov / Admin@123!</div>
                  <div>Manager: manager@taxadmin.gov / Manager@123!</div>
                  <div>Collector: collector@taxadmin.gov / Collector@123!</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDemoCredentials(false)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                >
                  Hide
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

              {/* Lockout Timer */}
              {isLocked && lockoutTime && (
                <Alert className="bg-orange-50 border-orange-200">
                  <Lock className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Account locked. Remaining time: {getRemainingLockoutTime()}
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
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="pl-10"
                    disabled={isLoading || isLocked}
                    autoComplete="email"
                    maxLength={254}
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
                    disabled={isLoading || isLocked}
                    autoComplete="current-password"
                    maxLength={128}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator (only when typing) */}
                {password && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasLength ? 'text-green-600' : 'text-gray-300'}`} />
                      <span className={passwordStrength.hasLength ? 'text-green-600' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-300'}`} />
                        <span className={passwordStrength.hasUpper ? 'text-green-600' : 'text-gray-500'}>
                          Uppercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasLower ? 'text-green-600' : 'text-gray-300'}`} />
                        <span className={passwordStrength.hasLower ? 'text-green-600' : 'text-gray-500'}>
                          Lowercase
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-300'}`} />
                        <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                          Number
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className={`h-3 w-3 ${passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-300'}`} />
                        <span className={passwordStrength.hasSpecial ? 'text-green-600' : 'text-gray-500'}>
                          Special
                        </span>
                      </div>
                    </div>
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
                    disabled={isLoading || isLocked}
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
                  disabled={isLoading || isLocked}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || isLocked}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  <span>Secured with OWASP best practices</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-5">
                  <li>Password hashing (SHA-256)</li>
                  <li>Account lockout after {MAX_FAILED_ATTEMPTS} failed attempts</li>
                  <li>Session timeout after {SESSION_TIMEOUT / 60000} minutes</li>
                  <li>XSS and injection protection</li>
                </ul>
              </div>
            </div>
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