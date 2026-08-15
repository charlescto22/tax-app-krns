import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, CheckCircle2, Loader2 } from "lucide-react";
import type { User } from "../App";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";

// Firebase Imports
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
  });

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
      setError(t("loginErrorRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("loginErrorInvalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: User;

      if (userDoc.exists()) {
        const data = userDoc.data();
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: data.name || "Unknown User",
          role: data.role || "tax-collector",
        };
      } else {
        console.warn("User document not found in Firestore. Using fallback.");
        userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.email?.split("@")[0] || "User",
          role: "administrator",
        };
      }

      if (rememberMe) {
        localStorage.setItem("rememberMe", JSON.stringify({ email: email }));
      } else {
        localStorage.removeItem("rememberMe");
      }

      sessionStorage.setItem(
        "userSession",
        JSON.stringify({
          user: userData,
          timestamp: Date.now(),
        })
      );

      onLoginSuccess(userData);
    } catch (err: any) {
      console.error("Login error:", err);

      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError(t("loginErrorInvalidCredentials"));
      } else if (err.code === "auth/too-many-requests") {
        setError(t("loginErrorLocked"));
      } else {
        setError(t("loginErrorGeneric"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-atmosphere">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="login-panel space-y-6">
        <div className="text-center space-y-2 login-enter">
          <div className="flex justify-center mb-4">
            <BrandMark size="lg" />
          </div>
          <h1 className="text-white text-xl font-semibold">{t("appName")}</h1>
          <p className="text-white text-sm" style={{ opacity: 0.9 }}>
            {t("loginSubtitle")}
          </p>
          <div className="flex items-center justify-center gap-2 text-white text-sm" style={{ opacity: 0.85 }}>
            <Shield className="h-4 w-4" />
            <span>{t("loginSecureBadge")}</span>
          </div>
        </div>

        <Card className="border-2 login-enter-delay bg-card">
          <CardHeader>
            <CardTitle>{t("loginSignIn")}</CardTitle>
            <CardDescription>{t("loginSignInDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("loginEmail")} *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password">{t("loginPassword")} *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("loginPasswordPlaceholder")}
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

                {password && (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className={`h-3 w-3 ${passwordStrength.hasLength ? "text-green-600" : "text-gray-300"}`}
                      />
                      <span className={passwordStrength.hasLength ? "text-green-600" : "text-gray-500"}>
                        {t("loginPasswordLength")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer">
                    {t("loginRememberMe")}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-link-primary px-0"
                  disabled={isLoading}
                >
                  {t("loginForgotPassword")}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("loginSigningIn")}
                  </div>
                ) : (
                  t("loginSignIn")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-white login-enter-delay" style={{ opacity: 0.85 }}>
          <p>{t("loginFooterCopyright")}</p>
          <p>{t("loginFooterAuthorized")}</p>
        </div>
      </div>
    </div>
  );
}
