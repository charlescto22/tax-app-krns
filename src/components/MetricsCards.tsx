import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, Activity, Clock, MapPin, Loader2 } from "lucide-react";
import { db } from "../firebase";
import { collection, query, onSnapshot, where } from "firebase/firestore";

export function MetricsCards() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayCount: 0,
    todayRevenue: 0,
    pendingCount: 0,
    activeStations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to ALL transactions (In a large app, you might limit this to 'this month')
    const q = query(collection(db, "transactions"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0;
      let todayTx = 0;
      let todayRev = 0;
      let pending = 0;
      const stations = new Set();

      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      snapshot.docs.forEach(doc => {
        const data = doc.data();

        // Parse amount (remove "MMK " and commas)
        // Note: We saved 'rawAmount' in later versions, but fallback to parsing string if needed
        const amount = data.rawAmount || parseFloat(String(data.amount).replace(/[^0-9.-]+/g, "")) || 0;

        // 1. Calculate Total Revenue (Only Verified)
        if (data.status === 'Verified') {
          revenue += amount;

          // 2. Calculate Today's Stats
          if (data.date === todayStr) {
            todayRev += amount;
          }
        }

        // 3. Count Transactions Today (Regardless of status)
        if (data.date === todayStr) {
          todayTx++;
        }

        // 4. Count Pending
        if (data.status === 'Pending' || data.status === 'Offline-Pending') {
          pending++;
        }

        // 5. Track Active Stations
        if (data.station) {
          stations.add(data.station);
        }
      });

      setStats({
        totalRevenue: revenue,
        todayCount: todayTx,
        todayRevenue: todayRev,
        pendingCount: pending,
        activeStations: stations.size
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Create a color dictionary mapping
  const colorStyles: Record<string, { bg: string; text: string }> = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
  };

  const metrics = [
    {
      title: "Total Verified Revenue",
      value: `MMK ${(stats.totalRevenue / 1000000).toFixed(2)}M`,
      subtitle: "Lifetime Collection",
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Transactions Today",
      value: stats.todayCount.toString(),
      subtitle: `Today's Revenue: ${(stats.todayRevenue / 100000).toFixed(1)}Lakh`,
      icon: Activity,
      color: "green",
    },
    {
      title: "Pending Approvals",
      value: stats.pendingCount.toString(),
      subtitle: "Requires verification",
      icon: Clock,
      color: "orange",
      alert: stats.pendingCount > 0
    },
    {
      title: "Active Stations",
      value: stats.activeStations.toString(),
      subtitle: "Reporting data",
      icon: MapPin,
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="h-32 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        // 2. Look up the full Tailwind classes from our dictionary
        const currentColors = colorStyles[metric.color] || colorStyles.blue;

        return (
          <Card key={metric.title} className={metric.alert ? "border-orange-300 bg-orange-50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              {/* 3. Apply the full classes here */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentColors.bg}`}>
                <Icon className={`h-4 w-4 ${currentColors.text}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}