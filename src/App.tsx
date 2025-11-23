import { useState, useEffect, useRef } from "react";
import { LoginPage } from "./components/LoginPage";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { MetricsCards } from "./components/MetricsCards";
import { RevenueChart } from "./components/RevenueChart";
import { TransactionsTable } from "./components/TransactionsTable";
import { TaxDistributionChart } from "./components/TaxDistributionChart";
import { TaxCollectionPage } from "./components/TaxCollectionPage";
import { TaxCalculationPage } from "./components/TaxCalculationPage";
import { TaxRateManagementPage } from "./components/TaxRateManagementPage";
import { RemittancePage } from "./components/RemittancePage";
import { MonthlyReconciliationPage } from "./components/MonthlyReconciliationPage";
import { RevenueDistributionPage } from "./components/RevenueDistributionPage";
import { ReportsPage } from "./components/ReportsPage";
import { SettingsPage } from "./components/SettingsPage";
import { UserManagementPage } from "./components/UserManagementPage";

// User roles
export type UserRole = "administrator" | "remittance-manager" | "tax-collector";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

// Session timeout: 15 minutes
const SESSION_TIMEOUT = 15 * 60 * 1000;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const throttleTimer = useRef(Date.now());

  // Session timeout monitoring
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSession = () => {
      const sessionData = sessionStorage.getItem("userSession");
      
      if (!sessionData) {
        handleLogout();
        return;
      }

      try {
        const session = JSON.parse(sessionData);
        const sessionAge = Date.now() - session.timestamp;
        
        if (sessionAge > SESSION_TIMEOUT) {
          alert("Your session has expired. Please log in again.");
          handleLogout();
        }
      } catch (e) {
        handleLogout();
      }
    };

    // Check session every minute
    const interval = setInterval(checkSession, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

 // Activity tracking with Throttling
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      const now = Date.now();
      
      // THROTTE LOGIC: 
      // If less than 30 seconds (30,000ms) have passed, STOP here.
      if (now - throttleTimer.current < 30000) {
        return;
      }

      // If we pass the check, update the "sticky note" to the new time
      throttleTimer.current = now;
      setLastActivity(now);
      
      // Update session timestamp in storage
      const sessionData = sessionStorage.getItem("userSession");
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData);
          session.timestamp = now;
          sessionStorage.setItem("userSession", JSON.stringify(session));
          console.log("Session updated at:", new Date(now).toLocaleTimeString()); // Optional: to verify it works
        } catch (e) {
          // Ignore errors
        }
      }
    };

    // Track user activity
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("scroll", updateActivity);
    window.addEventListener("touchstart", updateActivity);

    return () => {
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
    };
  }, [isAuthenticated]);

  // Check for existing session on mount
  useEffect(() => {
    const sessionData = sessionStorage.getItem("userSession");
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const sessionAge = Date.now() - session.timestamp;
        
        if (sessionAge < SESSION_TIMEOUT) {
          setCurrentUser(session.user);
          setIsAuthenticated(true);
          
          // Set default page based on role
          if (session.user.role === "administrator") {
            setActivePage("dashboard");
          } else {
            setActivePage("tax-collection");
          }
        } else {
          sessionStorage.removeItem("userSession");
        }
      } catch (e) {
        sessionStorage.removeItem("userSession");
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setLastActivity(Date.now());
    
    // Set default page based on role
    if (user.role === "administrator") {
      setActivePage("dashboard");
    } else {
      setActivePage("tax-collection");
    }
  };

  const handleLogout = () => {
    // Clear all session data
    sessionStorage.removeItem("userSession");
    sessionStorage.removeItem("loginLockout");
    
    // Reset state
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActivePage("dashboard");
    setSidebarOpen(false);
  };

  // If not authenticated, show login page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPageContent = () => {
    // Check role-based access
    const canAccessDashboard = currentUser.role === "administrator";
    const canAccessTaxCollection = true; // All roles can access
    const canAccessRemittance = currentUser.role === "administrator" || currentUser.role === "remittance-manager";
    const canAccessReports = currentUser.role === "administrator" || currentUser.role === "remittance-manager";
    const canAccessUserManagement = currentUser.role === "administrator";

    switch (activePage) {
      case "dashboard":
        if (!canAccessDashboard) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          );
        }
        return (
          <>
            <div>
              <h1 className="text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Monitor tax collection and revenue across all departments</p>
            </div>
            
            <MetricsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
              <div>
                <TaxDistributionChart />
              </div>
            </div>
            
            <TransactionsTable userRole={currentUser.role} />
          </>
        );
      case "tax-collection":
        return <TaxCollectionPage userRole={currentUser.role} onNavigateToCalculation={() => setActivePage("tax-calculation")} />;
      case "tax-calculation":
        return <TaxCalculationPage onNavigateToCollection={() => setActivePage("tax-collection")} />;
      case "tax-rate-management":
        if (!canAccessUserManagement) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">Only administrators can manage tax rates.</p>
            </div>
          );
        }
        return <TaxRateManagementPage />;
      case "remittance":
        if (!canAccessRemittance) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          );
        }
        return <RemittancePage userRole={currentUser.role} />;
      case "monthly-reconciliation":
        if (!canAccessRemittance) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          );
        }
        return <MonthlyReconciliationPage userRole={currentUser.role} />;
      case "revenue-distribution":
        return <RevenueDistributionPage userRole={currentUser.role} />;
      case "reports":
        if (!canAccessReports) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to view this page.</p>
            </div>
          );
        }
        return <ReportsPage />;
      case "user-management":
        if (!canAccessUserManagement) {
          return (
            <div className="text-center py-12">
              <h2 className="text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">Only administrators can manage users.</p>
            </div>
          );
        }
        return <UserManagementPage />;
      case "settings":
        return <SettingsPage currentUser={currentUser} />;
      default:
        return null;
    }
  };

  const handleNavigate = (pageId: string) => {
    setActivePage(pageId);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />
      <div className="flex">
        <Sidebar 
          activePage={activePage} 
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={currentUser.role}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 ml-0 lg:ml-64 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderPageContent()}
          </div>
        </main>
      </div>
    </div>
  );
}