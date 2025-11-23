import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  {
    department: "Planning & Finance",
    revenue: 15800000,
  },
  {
    department: "Home Affairs",
    revenue: 12400000,
  },
  {
    department: "Agriculture",
    revenue: 9600000,
  },
  {
    department: "Trade",
    revenue: 8000000,
  },
];

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Department</CardTitle>
        <CardDescription>Monthly collection across government departments (MMK)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="department" 
                tick={{ fill: '#6b7280', fontSize: 11 }}
                angle={-15}
                textAnchor="end"
                height={80}
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
              <Bar dataKey="revenue" fill="#2563eb" radius={[8, 8, 0, 0]} name="Revenue (MMK)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}