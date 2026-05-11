import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe", "#1e40af", "#1e3a8a"];

export function TaxDistributionChart() {
  const [data, setData] = useState<{ name: string; value: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Query only Verified transactions
    const q = query(collection(db, "transactions"), where("status", "==", "Verified"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taxTypeMap: Record<string, number> = {};
      let total = 0;

      snapshot.docs.forEach((doc) => {
        const tx = doc.data();
        // Parse amount: prefer 'rawAmount' (number), otherwise parse string "MMK 1,000"
        const amount = tx.rawAmount || parseFloat(String(tx.amount).replace(/[^0-9.-]+/g, "")) || 0;
        const type = tx.taxType || "Other";

        if (taxTypeMap[type]) {
          taxTypeMap[type] += amount;
        } else {
          taxTypeMap[type] = amount;
        }
        total += amount;
      });

      // Convert map to array and calculate percentages
      const chartData = Object.keys(taxTypeMap).map((key) => ({
        name: key,
        value: taxTypeMap[key],
        percentage: total > 0 ? Math.round((taxTypeMap[key] / total) * 100) : 0
      }));

      // Sort by value (highest first)
      chartData.sort((a, b) => b.value - a.value);

      setData(chartData);
      setTotalRevenue(total);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("taxDistribution")}</CardTitle>
        <CardDescription>{t("taxDistributionDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`MMK ${(value / 1000000).toFixed(2)}M`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-gray-700 text-xs sm:text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p>No verified data available</p>
            </div>
          )}
        </div>

        {/* List View below chart */}
        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm truncate max-w-[120px] sm:max-w-none">{item.name}</span>
              </div>
              <span className="text-sm font-medium">
                {((item.value / totalRevenue) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}