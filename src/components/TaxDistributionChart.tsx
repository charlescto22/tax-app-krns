import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const data = [
  { name: "Commercial Tax", value: 8500000, percentage: 35 },
  { name: "Customs Duty", value: 6800000, percentage: 28 },
  { name: "Property Tax", value: 4300000, percentage: 18 },
  { name: "Road Tax", value: 2900000, percentage: 12 },
  { name: "Excise Tax", value: 1700000, percentage: 7 },
];

const COLORS = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

export function TaxDistributionChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Type Distribution</CardTitle>
        <CardDescription>Breakdown by tax category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80">
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
                formatter={(value: number) => `MMK ${(value / 1000000).toFixed(2)}M`}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-gray-700">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-gray-600">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                ></div>
                <span className="text-sm sm:text-base">{item.name}</span>
              </div>
              <span className="text-sm sm:text-base">MMK {(item.value / 1000000).toFixed(1)}M</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}