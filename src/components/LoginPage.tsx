import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield, CheckCircle2, Loader2 } from "lucide-react";
import type { User } from "../App";
import { BrandMark } from "./BrandMark";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../contexts/LanguageContext";
import { auth, db, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  AccountInactiveError,
  DeviceLimitError,
  SsoPendingError,
  createSsoAccessRequest,
  registerDeviceForUser,
  touchLastLogin,
} from "../utils/userAdminApi";
import type { ManagedUser } from "../types/userAdmin";

const SSO_REDIRECT_FLAG = "iec.googleSsoRedirect";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      } catch {
        localStorage.removeItem("rememberMe");
      }
    }
  }, []);

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  };

  const checkPasswordStrength = (pwd: string) => {
    setPasswordStrength({
      hasLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    });
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    checkPasswordStrength(value);
  };

  const completeLogin = async (firebaseUid: string, firebaseEmail: string, profile: ManagedUser | null) => {
    if (profile && profile.status === "inactive") {
      await signOut(auth);
      throw new AccountInactiveError();
    }

    if (profile?.ssoStatus === "pending") {
      await signOut(auth);
      throw new SsoPendingError();
    }

    if (profile) {
      await registerDeviceForUser(firebaseUid, profile);
      try {
        await touchLastLogin(firebaseUid);
      } catch {
        // Non-fatal if rules block lastLogin for missing fields on first bootstrap
      }
    }

    const userData: User = {
      id: firebaseUid,
      email: firebaseEmail,
      name: profile?.name || firebaseEmail.split("@")[0] || "User",
      role: profile?.role || "tax-collector",
      mustChangePassword: !!profile?.mustChangePassword,
    };

    // Bootstrap: missing Firestore profile → temporary administrator so first deploy can seed users.
    // Prefer creating users/{uid} in Console or via an existing admin afterward.
    if (!profile) {
      console.warn("User document missing in Firestore; using administrator bootstrap role.");
      userData.role = "administrator";
      userData.mustChangePassword = false;
    }

    if (rememberMe && email) {
      localStorage.setItem("rememberMe", JSON.stringify({ email }));
    } else if (!rememberMe) {
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
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      const profile = userDoc.exists() ? ({ id: firebaseUser.uid, ...userDoc.data() } as ManagedUser) : null;
      await completeLogin(firebaseUser.uid, firebaseUser.email || email, profile);
    } catch (err: any) {
      console.error("Login error:", err);
      await signOut(auth).catch(() => undefined);

      if (err instanceof DeviceLimitError || err instanceof AccountInactiveError || err instanceof SsoPendingError) {
        setError(err.message);
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Account temporarily locked due to too many failed attempts. Please try again later.");
      } else {
        setError(err?.message || "An error occurred. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email || !validateEmail(email)) {
      setError("Enter your account email first, then click Forgot password.");
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Could not send reset email.");
    } finally {
      setIsLoading(false);
    }
  };

  const mapGoogleSsoError = (err: any): string => {
    if (err instanceof DeviceLimitError || err instanceof AccountInactiveError || err instanceof SsoPendingError) {
      return err.message;
    }
    if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
      return "Google sign-in was cancelled.";
    }
    if (err?.code === "auth/operation-not-allowed") {
      return "Google SSO is not enabled in Firebase Console yet. Ask an admin to enable the Google provider.";
    }
    if (err?.code === "auth/unauthorized-domain") {
      return "This domain is not authorized for Google sign-in. Add it under Firebase Authentication → Settings → Authorized domains.";
    }
    if (err?.code === "auth/account-exists-with-different-credential") {
      return "An account already exists with this email using a different sign-in method. Sign in with email/password, or ask an admin to link Google SSO.";
    }
    return err?.message || "SSO sign-in failed.";
  };

  /** After Google Auth succeeds: enter app if approved/linked, else create SSO request. */
  const finishGoogleSignIn = async (firebaseUser: FirebaseUser) => {
    const emailAddr = (firebaseUser.email || "").toLowerCase();
    if (!emailAddr) {
      await signOut(auth);
      throw new Error("Google did not return an email address. Use a Gmail or Google Workspace account that has an email.");
    }

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const profile = { id: firebaseUser.uid, ...userDoc.data() } as ManagedUser;
      if (profile.ssoStatus === "pending") {
        await signOut(auth);
        throw new SsoPendingError();
      }
      if (profile.status === "inactive") {
        await signOut(auth);
        throw new AccountInactiveError();
      }
      await completeLogin(firebaseUser.uid, emailAddr, {
        ...profile,
        ssoEnabled: true,
        ssoStatus: profile.ssoStatus || "approved",
      });
      return;
    }

    // New Google identity → create SSO approval request and sign out
    await createSsoAccessRequest({
      email: emailAddr,
      displayName: firebaseUser.displayName || emailAddr.split("@")[0],
      provider: "google",
      providerUid: firebaseUser.uid,
      requestedRole: "tax-collector",
    });
    await signOut(auth);
    setInfo(
      `Access requested for ${emailAddr}. An administrator must approve this Google / Workspace account in User Admin → SSO Approvals before you can enter.`
    );
  };

  // Complete Google redirect when returning from accounts.google.com
  useEffect(() => {
    let cancelled = false;

    const consumeRedirect = async () => {
      const pending = sessionStorage.getItem(SSO_REDIRECT_FLAG) === "1";
      try {
        const result = await getRedirectResult(auth);
        if (cancelled) return;

        if (result?.user) {
          sessionStorage.removeItem(SSO_REDIRECT_FLAG);
          setIsGoogleLoading(true);
          setError("");
          setInfo("");
          try {
            await finishGoogleSignIn(result.user);
          } catch (err: any) {
            console.error("SSO redirect finish error:", err);
            await signOut(auth).catch(() => undefined);
            setError(mapGoogleSsoError(err));
          } finally {
            setIsGoogleLoading(false);
          }
          return;
        }

        if (pending) {
          // Redirect returned without a user (user cancelled on Google page)
          sessionStorage.removeItem(SSO_REDIRECT_FLAG);
          setError("Google sign-in was cancelled before an account was selected.");
        }
      } catch (err: any) {
        if (cancelled) return;
        sessionStorage.removeItem(SSO_REDIRECT_FLAG);
        console.error("SSO redirect error:", err);
        await signOut(auth).catch(() => undefined);
        setError(mapGoogleSsoError(err));
        setIsGoogleLoading(false);
      }
    };

    void consumeRedirect();
    return () => {
      cancelled = true;
    };
    // finishGoogleSignIn closes over latest completeLogin/onLoginSuccess; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSso = async () => {
    setError("");
    setInfo("");
    setIsGoogleLoading(true);
    try {
      // Redirect flow avoids Cross-Origin-Opener-Policy breakage with signInWithPopup
      // (popup often opens Google's email form and then fails to return the result).
      sessionStorage.setItem(SSO_REDIRECT_FLAG, "1");
      await signInWithRedirect(auth, googleProvider);
      // Page navigates away; loading stays until redirect returns.
    } catch (err: any) {
      console.error("SSO error:", err);
      sessionStorage.removeItem(SSO_REDIRECT_FLAG);
      await signOut(auth).catch(() => undefined);
      setError(mapGoogleSsoError(err));
      setIsGoogleLoading(false);
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
              {info && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{info}</AlertDescription>
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
                  onClick={handleForgotPassword}
                >
                  {t("loginForgotPassword")}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || isGoogleLoading}
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

            <div className="relative py-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-gray-500">
                or
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={isLoading || isGoogleLoading}
              onClick={handleGoogleSso}
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening Google account chooser…
                </>
              ) : (
                <>
                  <GoogleGlyph className="h-4 w-4" />
                  Continue with Google
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              You will be redirected to Google to choose a Gmail or Google Workspace account.
              New accounts need administrator approval before access is granted.
            </p>
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
