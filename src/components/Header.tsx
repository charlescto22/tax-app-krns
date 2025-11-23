import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react"; // Add these icons
// ... existing imports
import { LanguageSwitcher } from "./LanguageSwitcher"; // Import LanguageSwitcher

export function Header({ onMenuClick, currentUser, onLogout }: HeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);

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
    
    if (confirm(`Sync ${offlineCount} offline records to server now?`)) {
      // Simulate Sync Process
      const queue = JSON.parse(localStorage.getItem("offlineTaxQueue") || "[]");
      console.log("Syncing records:", queue);
      
      // In real app: await api.post('/batch-sync', queue);
      
      // Clear queue after success
      localStorage.removeItem("offlineTaxQueue");
      setOfflineCount(0);
      alert("✅ Sync Complete! All records sent to server.");
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        
        {/* ... (Your existing Logo & Menu Button code) ... */}

        {/* 👇 ADD THIS NEW SECTION: Network Status Indicator 👇 */}
        <div className="flex items-center gap-2 mr-2">
          <LanguageSwitcher />
           {isOnline ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              <Wifi className="h-3 w-3" />
              <span className="hidden sm:inline">Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 animate-pulse">
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </div>
          )}

          {/* Sync Button - Only shows if there is data to sync */}
          {offlineCount > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
              onClick={handleSync}
              disabled={!isOnline} // Can't sync if no internet
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isOnline ? "" : "animate-spin"}`} />
              Sync ({offlineCount})
            </Button>
          )}
        </div>
        
        {/* ... (Your existing Search & User Profile code) ... */}
        
      </div>
    </header>
  );
}