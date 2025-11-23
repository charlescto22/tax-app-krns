import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";

export function RevenueChart() {
  const [data, setData] = useState<{ name: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query only Verified transactions to ensure accurate revenue reporting
    const q = query(collection(db, "transactions"), where("status", "==", "Verified"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taxTypeMap: Record<string, number> = {};

      snapshot.docs.forEach((doc) => {
        const tx = doc.data();
        // Parse amount: remove "MMK " prefix and commas, then convert to float
        // Uses 'rawAmount' if available, otherwise parses string
        const amount = tx.rawAmount || parseFloat(String(tx.amount).replace(/[^0-9.-]+/g, "")) || 0;
        const type = tx.taxType || "Other";

        if (taxTypeMap[type]) {
          taxTypeMap[type] += amount;
        } else {
          taxTypeMap[type] = amount;
        }
      });

      // Convert map to array for Recharts
      const chartData = Object.keys(taxTypeMap).map((key) => ({
        name: key,
        revenue: taxTypeMap[key],
      }));

      // Sort by revenue (highest first) for better visualization
      chartData.sort((a, b) => b.revenue - a.revenue);

      setData(chartData);
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
        <CardTitle>Revenue by Tax Type</CardTitle>
        <CardDescription>Total verified collection amount (MMK)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                interval={0} // Show all labels
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value: number) => [`MMK ${(value / 1000000).toFixed(2)}M`, 'Revenue']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#2563eb" 
                radius={[4, 4, 0, 0]} 
                name="Revenue (MMK)" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}