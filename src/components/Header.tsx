import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Menu } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { BrandMark } from "./BrandMark";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "./ui/button";
import type { User } from "../App";

interface HeaderProps {
  onMenuClick: () => void;
  currentUser: User;
  onLogout: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const handleStatusChange = () => setIsOnline(navigator.onLine);

    const checkQueue = setInterval(() => {
      const queue = JSON.parse(localStorage.getItem("offlineTaxQueue") || "[]");
      setOfflineCount(queue.length);
    }, 2000);

    window.addEventListener("online", handleStatusChange);
    window.addEventListener("offline", handleStatusChange);

    return () => {
      window.removeEventListener("online", handleStatusChange);
      window.removeEventListener("offline", handleStatusChange);
      clearInterval(checkQueue);
    };
  }, []);

  const handleSync = () => {
    if (offlineCount === 0) return;

    if (confirm(t("syncConfirm"))) {
      localStorage.removeItem("offlineTaxQueue");
      setOfflineCount(0);
      alert(`✅ ${t("syncComplete")}`);
    }
  };

  return (
    <header className="bg-card border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-semibold text-foreground hidden sm:inline">
              {t("appName")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mr-2">
          <LanguageSwitcher />
          {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              <Wifi className="h-3 w-3" />
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
      </div>
    </header>
  );
}
