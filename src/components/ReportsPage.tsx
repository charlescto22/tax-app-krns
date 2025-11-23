import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { exportToCSV } from "../utils/exportUtils";

const handleGenerateReport = (reportTitle: string) => {
  // In a real app, you would fetch data from Firestore based on the report type here.
  // For now, we simulate a report download.
  
  const mockReportData = [
    { Date: "2025-11-01", Revenue: 150000, Region: "North" },
    { Date: "2025-11-02", Revenue: 230000, Region: "South" },
    { Date: "2025-11-03", Revenue: 180000, Region: "East" },
  ];

  exportToCSV(mockReportData, reportTitle.replace(/\s/g, "_"));
};

const reportTypes = [
  {
    icon: BarChart3,
    title: "Revenue Report",
    description: "Detailed revenue analysis by department, tax type, and time period",
    lastGenerated: "2025-11-20 09:00",
    color: "blue",
  },
  {
    icon: PieChart,
    title: "Tax Distribution Report",
    description: "Breakdown of tax collections by category and region",
    lastGenerated: "2025-11-20 08:30",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Performance Report",
    description: "Station and collector performance metrics and trends",
    lastGenerated: "2025-11-19 17:00",
    color: "purple",
  },
  {
    icon: FileText,
    title: "Compliance Report",
    description: "Tax compliance status and pending verification items",
    lastGenerated: "2025-11-19 15:30",
    color: "orange",
  },
  {
    icon: Calendar,
    title: "Monthly Summary",
    description: "Comprehensive monthly tax collection summary",
    lastGenerated: "2025-11-01 00:00",
    color: "red",
  },
  {
    icon: Download,
    title: "Custom Report",
    description: "Generate custom reports with specific parameters",
    lastGenerated: "On demand",
    color: "gray",
  },
];

export function ReportsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download various tax administration reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Reports Generated Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">24</div>
            <p className="text-gray-500">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">8</div>
            <p className="text-gray-500">Auto-generated daily/weekly</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-gray-500 mb-4">
                  Last generated: {report.lastGenerated}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
  size="sm" 
  className="flex-1 bg-blue-600 hover:bg-blue-700"
  onClick={() => handleGenerateReport(report.title)} // Connect the button
>
  <Download className="h-4 w-4 mr-1" />
  Generate
</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}