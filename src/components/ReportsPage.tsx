import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Loader2 } from "lucide-react";
import { exportToCSV } from "../utils/exportUtils";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "./ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";

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
  // ... add other report types if needed
];

export function ReportsPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch data based on report type
  const fetchReportData = async (reportTitle: string) => {
    setIsLoading(true);
    let data = [];

    try {
      if (reportTitle === "Revenue Report") {
        // Real Query: Get all Verified transactions
        // In a real app, you might add date range filters here too
        const q = query(collection(db, "transactions"), where("status", "==", "Verified"));
        const querySnapshot = await getDocs(q);
        
        data = querySnapshot.docs.map(doc => {
          const docData = doc.data();
          return {
            Date: docData.date,
            Time: docData.time,
            TaxType: docData.taxType,
            Station: docData.station,
            // Clean the amount string (remove "MMK " and commas) for raw data if needed
            Amount: docData.amount, 
            Status: docData.status
          };
        });
      } else {
        // Fallback for other report types not yet connected to real queries
        console.log(`Real data export for "${reportTitle}" is not yet implemented. Using mock data.`);
        data = [
          { Note: "This report type is not yet connected to live data.", Date: new Date().toISOString() }
        ];
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Failed to fetch data. Please check your connection.");
    } finally {
      setIsLoading(false);
    }

    return data;
  };

  const handleViewReport = async (reportTitle: string) => {
    setSelectedReportType(reportTitle);
    setPreviewOpen(true);
    const data = await fetchReportData(reportTitle);
    setPreviewData(data);
  };

  const handleGenerateReport = async (reportTitle: string) => {
    const data = await fetchReportData(reportTitle);
    if (data && data.length > 0) {
      exportToCSV(data, reportTitle.replace(/\s+/g, "_"));
    } else {
      alert("No records found for this report.");
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Generate and download various tax administration reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`h-12 w-12 rounded-lg bg-${report.color}-100 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${report.color}-600`} />
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewReport(report.title)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleGenerateReport(report.title)}
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

      {/* Report Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedReportType} - Preview</DialogTitle>
            <DialogDescription>
              Snapshot of data. Click "Download" for the full CSV file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md overflow-auto flex-1 my-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : previewData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No data found for this report.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    {/* Dynamically generate headers based on data keys */}
                    {Object.keys(previewData[0]).map((key) => (
                      <TableHead key={key} className="whitespace-nowrap">{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).map((val: any, idx) => (
                        <TableCell key={idx} className="whitespace-nowrap">
                          {String(val)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {previewData.length > 10 && (
            <p className="text-xs text-gray-500 text-center mb-2">
              Showing first 10 rows of {previewData.length} records.
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>Close</Button>
            <Button 
              onClick={() => {
                setPreviewOpen(false);
                // Use the data we already fetched to avoid refetching
                if (previewData && previewData.length > 0) {
                   exportToCSV(previewData, selectedReportType.replace(/\s+/g, "_"));
                }
              }}
              disabled={isLoading || previewData.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}