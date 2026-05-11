import { LayoutDashboard, Wallet, RefreshCw, FileText, Settings, Users, X, Calculator, Sliders, LogOut, FileCheck, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { UserRole } from "../App";
// Import the language hook
import { useLanguage } from "../contexts/LanguageContext";

const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case "administrator":
      return "bg-purple-100 text-purple-800";
    case "remittance-manager":
      return "bg-blue-100 text-blue-800";
    case "tax-collector":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};



interface SidebarProps {
  activePage: string;
  onNavigate: (pageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onLogout?: () => void;
}

export function Sidebar({ activePage, onNavigate, isOpen, onClose, userRole, onLogout }: SidebarProps) {
  // 1. Get the translation function
  const { t } = useLanguage();

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case "administrator":
        return t("administrator");
      case "remittance-manager":
        return t("remittanceManager");
      case "tax-collector":
        return t("taxCollector");
      default:
        return "User";
    }
  };
  
  // 2. Define navItems INSIDE the component so we can use 't'
  const navItems = [
    { icon: LayoutDashboard, label: t("dashboard"), id: "dashboard", roles: ["administrator"] },
    { icon: Wallet, label: t("taxCollection"), id: "tax-collection", roles: ["administrator", "remittance-manager", "tax-collector"] },
    { icon: Calculator, label: t("taxCalculation"), id: "tax-calculation", roles: ["administrator", "remittance-manager", "tax-collector"] },
    { icon: Sliders, label: t("taxRateManagement"), id: "tax-rate-management", roles: ["administrator"] },
    { icon: RefreshCw, label: t("remittance"), id: "remittance", roles: ["administrator", "remittance-manager"] },
    { icon: FileCheck, label: t("reconciliation"), id: "monthly-reconciliation", roles: ["administrator", "remittance-manager"] },
    { icon: TrendingUp, label: t("revenueDistribution"), id: "revenue-distribution", roles: ["administrator"] },
    { icon: FileText, label: t("reports"), id: "reports", roles: ["administrator", "remittance-manager"] },
    { icon: Users, label: t("userManagement"), id: "user-management", roles: ["administrator"] },
    { icon: Settings, label: t("settings"), id: "settings", roles: ["administrator", "remittance-manager", "tax-collector"] },
  ];

  // Filter navigation items based on user role
  const allowedNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
          {/* 👇 Change this line 👇 */}
          <span className="text-gray-900">{t("menu")}</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Role Badge */}
        <div className="p-4 border-b border-gray-200">
          <Badge className={`w-full justify-center ${getRoleBadgeColor(userRole)}`}>
            {getRoleLabel(userRole)}
          </Badge>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
        </nav>
        
        {/* Logout Button */}
        {onLogout && (
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={onLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {/* You can also translate 'Logout' here if you want */}
              {t("logout")} 
            </Button>
          </div>
        )}
      </aside>
    </>
  );
}