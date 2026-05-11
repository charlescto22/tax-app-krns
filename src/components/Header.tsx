import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Menu } from "lucide-react"; // Add these icons
// ... existing imports
import { LanguageSwitcher } from "./LanguageSwitcher"; // Import LanguageSwitcher
// 1. Import the hook
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";

export function Header({ onMenuClick, currentUser, onLogout }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);

  // 2. Call the hook to get the 't' (translate) function
  const { t } = useLanguage();
  // Monitor network status and offline queue
  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);

    // Check offline queue every 2 seconds
    const checkQueue = setInterval(() => {
      const queue = JSON.parse(localStorage.getItem("offlineTaxQueue") || "[]");
      setOfflineCount(queue.length);
    }, 2000);

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      clearInterval(checkQueue);
    };
  }, []);

  const handleSync = () => {
    if (offlineCount === 0) return;

    // 3. Use t() for alerts and confirms
    if (confirm(t("syncConfirm"))) {
      const queue = JSON.parse(localStorage.getItem("offlineTaxQueue") || "[]");
      localStorage.removeItem("offlineTaxQueue");
      setOfflineCount(0);
      alert(`✅ ${t("syncComplete")}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">

        {/* 👇 1. LEFT SIDE: Menu Button + Logo 👇 */}
        <div className="flex items-center gap-2">

          {/* THE MISSING MENU BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden" /* This ensures it ONLY shows on mobile/tablet */
            onClick={onMenuClick} /* This opens the sidebar! */
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Your existing IEC Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">IEC</span>
            </div>
            {/* If you translated the app name, it will use t("appName") here */}
            <span className="font-bold text-gray-900 hidden sm:inline">{t("appName")}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <LanguageSwitcher />
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              <Wifi className="h-3 w-3" />
              {/* 4. Replace hardcoded text with {t("key")} */}
              <span className="hidden sm:inline">{t("online")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 animate-pulse">
              <WifiOff className="h-3 w-3" />
              <span>{t("offline")}</span>
            </div>
          )}

          {offlineCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              onClick={handleSync}
              disabled={!isOnline}
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isOnline ? "" : "animate-spin"}`} />
              {t("sync")} ({offlineCount})
            </Button>
          )}
        </div>

        {/* ... User Profile ... */}
      </div>
    </header>
  );
}