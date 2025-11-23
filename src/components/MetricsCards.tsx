import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, Activity, Clock, MapPin } from "lucide-react";

const metrics = [
  {
    title: "Total Revenue",
    value: "MMK 45.8M",
    subtitle: "THB 685K | USD 21.5K",
    icon: DollarSign,
    trend: "+12.5% from last month",
    trendPositive: true,
  },
  {
    title: "Total Transactions Today",
    value: "1,247",
    subtitle: "Verified: 1,089 | Pending: 158",
    icon: Activity,
    trend: "+8.2% from yesterday",
    trendPositive: true,
  },
  {
    title: "Pending Approvals",
    value: "158",
    subtitle: "Requires attention",
    icon: Clock,
    trend: "23 urgent items",
    trendPositive: false,
  },
  {
    title: "Active Gates/Townships",
    value: "42/45",
    subtitle: "93% operational",
    icon: MapPin,
    trend: "3 offline stations",
    trendPositive: true,
  },
];

export function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-gray-600">{metric.title}</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-gray-900 mb-1">{metric.value}</div>
              <p className="text-gray-500 mb-2">{metric.subtitle}</p>
              <p className={`${metric.trendPositive ? "text-green-600" : "text-orange-600"}`}>
                {metric.trend}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
