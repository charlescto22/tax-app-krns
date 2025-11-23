import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  TrendingUp,
  Search,
  Filter,
  CheckCheck,
  FileX,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import type { UserRole } from "../App";
import { exportToCSV } from "../utils/exportUtils"; 

const handleExportToExcel = () => {
  if (!selectedReport) return;

  // Create a structured object for this specific report
  const reportData = [{
    ReportID: selectedReport.id,
    Gate: selectedReport.gateLocation,
    Month: selectedReport.month,
    Year: selectedReport.year,
    Status: selectedReport.status,
    SubmittedBy: selectedReport.submittedBy,
    SubmittedDate: selectedReport.submittedDate,
    CashAmount: selectedReport.totalCash,
    DigitalAmount: selectedReport.totalDigital,
    TotalRecords: selectedReport.totalRecords,
    VerifiedBy: selectedReport.verifiedBy || "N/A",
    VerifiedDate: selectedReport.verifiedDate || "N/A",
    RejectionReason: selectedReport.rejectionReason || "N/A"
  }];

  exportToCSV(reportData, `Reconciliation_${selectedReport.gateLocation}`);
  
  setSuccessMessage("Report exported successfully!");
  setTimeout(() => setSuccessMessage(""), 3000);
};

interface RemittanceReport {
  id: string;
  gateLocation: string;
  month: string;
  year: number;
  status: "submitted" | "verified" | "rejected";
  submittedBy: string;
  submittedDate: string;
  totalCash: number;
  totalDigital: number;
  totalRecords: number;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  remarks?: string;
}

// Mock data
const mockReports: RemittanceReport[] = [
  {
    id: "REM-2024-11-001",
    gateLocation: "BP-14 Gate",
    month: "November",
    year: 2024,
    status: "submitted",
    submittedBy: "John Collector",
    submittedDate: "2024-11-15",
    totalCash: 1250000,
    totalDigital: 1850000,
    totalRecords: 245,
  },
  {
    id: "REM-2024-11-002",
    gateLocation: "Highway Toll Plaza",
    month: "November",
    year: 2024,
    status: "verified",
    submittedBy: "Sarah Manager",
    submittedDate: "2024-11-14",
    totalCash: 980000,
    totalDigital: 1620000,
    totalRecords: 198,
    verifiedBy: "Director Level",
    verifiedDate: "2024-11-16",
  },
  {
    id: "REM-2024-11-003",
    gateLocation: "Port Customs",
    month: "November",
    year: 2024,
    status: "rejected",
    submittedBy: "Mike Collector",
    submittedDate: "2024-11-13",
    totalCash: 2100000,
    totalDigital: 1950000,
    totalRecords: 312,
    verifiedBy: "Director Level",
    verifiedDate: "2024-11-15",
    rejectionReason: "Cash amount discrepancy detected. Physical count does not match recorded amount.",
  },
  {
    id: "REM-2024-10-001",
    gateLocation: "BP-14 Gate",
    month: "October",
    year: 2024,
    status: "verified",
    submittedBy: "John Collector",
    submittedDate: "2024-10-31",
    totalCash: 1180000,
    totalDigital: 1720000,
    totalRecords: 231,
    verifiedBy: "Director Level",
    verifiedDate: "2024-11-02",
  },
  {
    id: "REM-2024-10-002",
    gateLocation: "City Center Gate",
    month: "October",
    year: 2024,
    status: "verified",
    submittedBy: "Emma Collector",
    submittedDate: "2024-10-30",
    totalCash: 850000,
    totalDigital: 1350000,
    totalRecords: 176,
    verifiedBy: "Director Level",
    verifiedDate: "2024-11-01",
  },
  {
    id: "REM-2024-11-004",
    gateLocation: "Industrial Zone Gate",
    month: "November",
    year: 2024,
    status: "submitted",
    submittedBy: "David Collector",
    submittedDate: "2024-11-16",
    totalCash: 1450000,
    totalDigital: 2100000,
    totalRecords: 289,
  },
];

interface MonthlyReconciliationPageProps {
  userRole: UserRole;
}

export function MonthlyReconciliationPage({ userRole }: MonthlyReconciliationPageProps) {
  const [reports, setReports] = useState<RemittanceReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<RemittanceReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionRemarks, setCorrectionRemarks] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);

  const canApprove = userRole === "administrator";

  // Auto-select first report when filters change
  useEffect(() => {
    const filtered = reports.filter((report) => {
      const matchesSearch =
        report.gateLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || report.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (filtered.length > 0 && !filtered.find(r => r.id === selectedReport?.id)) {
      setSelectedReport(filtered[0]);
    } else if (filtered.length === 0) {
      setSelectedReport(null);
    }
  }, [searchTerm, statusFilter, reports]);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.gateLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleApprove = () => {
    if (!selectedReport) return;

    setIsProcessing(true);
    setReports(
      reports.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              status: "verified" as const,
              verifiedBy: "Director Level",
              verifiedDate: new Date().toISOString().split("T")[0],
            }
          : r
      )
    );

    setSelectedReport({
      ...selectedReport,
      status: "verified",
      verifiedBy: "Director Level",
      verifiedDate: new Date().toISOString().split("T")[0],
    });

    setShowApprovalModal(false);
    setSuccessMessage("Remittance approved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsProcessing(false);
  };

  const handleRequestCorrection = () => {
    if (!selectedReport || !correctionRemarks.trim()) return;

    setIsProcessing(true);
    setReports(
      reports.map((r) =>
        r.id === selectedReport.id
          ? {
              ...r,
              status: "rejected" as const,
              verifiedBy: "Director Level",
              verifiedDate: new Date().toISOString().split("T")[0],
              rejectionReason: correctionRemarks,
            }
          : r
      )
    );

    setSelectedReport({
      ...selectedReport,
      status: "rejected",
      verifiedBy: "Director Level",
      verifiedDate: new Date().toISOString().split("T")[0],
      rejectionReason: correctionRemarks,
    });

    setShowCorrectionModal(false);
    setCorrectionRemarks("");
    setSuccessMessage("Correction request sent successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsProcessing(false);
  };

  const handleExportToExcel = () => {
    if (!selectedReport) return;

    // In production, this would generate and download an actual Excel file
    const csvContent = `Remittance Report Export
Remittance ID: ${selectedReport.id}
Gate Location: ${selectedReport.gateLocation}
Month: ${selectedReport.month} ${selectedReport.year}
Status: ${selectedReport.status.toUpperCase()}
Submitted By: ${selectedReport.submittedBy}
Submitted Date: ${selectedReport.submittedDate}

Financial Summary:
Total Cash Collected: ${selectedReport.totalCash.toLocaleString()} RWF
Total Digital Records: ${selectedReport.totalDigital.toLocaleString()} RWF
Total Records: ${selectedReport.totalRecords}
Grand Total: ${(selectedReport.totalCash + selectedReport.totalDigital).toLocaleString()} RWF

${selectedReport.verifiedBy ? `Verified By: ${selectedReport.verifiedBy}\nVerified Date: ${selectedReport.verifiedDate}` : ''}
${selectedReport.rejectionReason ? `\nRejection Reason: ${selectedReport.rejectionReason}` : ''}
`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport.id}_${selectedReport.gateLocation.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setSuccessMessage("Report exported successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const totalAmount = selectedReport
    ? selectedReport.totalCash + selectedReport.totalDigital
    : 0;
  const cashPercentage = selectedReport
    ? (selectedReport.totalCash / totalAmount) * 100
    : 0;
  const digitalPercentage = selectedReport
    ? (selectedReport.totalDigital / totalAmount) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900">Monthly Reconciliation</h1>
          <p className="text-gray-600">
            Review and approve monthly remittance reports from collection gates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <FileText className="h-3 w-3 mr-1" />
            {filteredReports.length} Reports
          </Badge>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Access Control Message for Non-Admin */}
      {!canApprove && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You have view-only access. Only Administrators can approve or request corrections.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Layout - Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel - List */}
        <Card className="lg:col-span-1 border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Remittance Reports</CardTitle>
            <CardDescription>Select a report to view details</CardDescription>

            {/* Search and Filter */}
            <div className="space-y-2 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileX className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedReport?.id === report.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate text-gray-900">
                          {report.gateLocation}
                        </div>
                        <div className="text-xs text-gray-500">
                          {report.month} {report.year}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(report.status)} text-xs shrink-0`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1 capitalize">{report.status}</span>
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">
                      <div className="truncate">ID: {report.id}</div>
                      <div className="truncate">By: {report.submittedBy}</div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Total:</span>
                      <span className="text-gray-900">
                        {(report.totalCash + report.totalDigital).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Details */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedReport ? (
            <Card className="border-2">
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Select a report to view details</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Header Card */}
              <Card className="border-2">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{selectedReport.gateLocation}</CardTitle>
                        <Badge className={getStatusColor(selectedReport.status)}>
                          {getStatusIcon(selectedReport.status)}
                          <span className="ml-1 capitalize">{selectedReport.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        {selectedReport.month} {selectedReport.year} Report
                      </CardDescription>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Report Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>Remittance ID:</span>
                      </div>
                      <div className="pl-6 text-gray-900">{selectedReport.id}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted Date:</span>
                      </div>
                      <div className="pl-6 text-gray-900">
                        {new Date(selectedReport.submittedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Submitted By:</span>
                      </div>
                      <div className="pl-6 text-gray-900">{selectedReport.submittedBy}</div>
                    </div>

                    {selectedReport.verifiedBy && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <CheckCheck className="h-4 w-4" />
                          <span>Verified By:</span>
                        </div>
                        <div className="pl-6 text-gray-900">
                          {selectedReport.verifiedBy}
                          {selectedReport.verifiedDate && (
                            <div className="text-xs text-gray-500">
                              {new Date(selectedReport.verifiedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Rejection Alert */}
              {selectedReport.status === "rejected" && selectedReport.rejectionReason && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="space-y-1">
                      <div>
                        <strong>Correction Required:</strong>
                      </div>
                      <div>{selectedReport.rejectionReason}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary Card */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Total Collections */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-700 mb-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Cash Collected</span>
                      </div>
                      <div className="text-2xl text-green-900">
                        {selectedReport.totalCash.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {cashPercentage.toFixed(1)}% of total
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm">Digital Records</span>
                      </div>
                      <div className="text-2xl text-blue-900">
                        {selectedReport.totalDigital.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {digitalPercentage.toFixed(1)}% of total
                      </div>
                    </div>

                    <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Grand Total</span>
                      </div>
                      <div className="text-2xl text-purple-900">
                        {totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">RWF</div>
                    </div>
                  </div>

                  {/* Records Count */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Transaction Records:</span>
                      <span className="text-gray-900 text-lg">
                        {selectedReport.totalRecords} records
                      </span>
                    </div>
                  </div>

                  {/* Comparison Indicator */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-sm">
                        <div className="text-gray-900">Reconciliation Status</div>
                        <div className="text-gray-600">
                          Cash vs Digital comparison: Physical verification required to confirm
                          accuracy
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Review the report and take appropriate action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canApprove && selectedReport.status === "submitted" && (
                      <>
                        <Button
                          onClick={() => setShowApprovalModal(true)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Remittance
                        </Button>
                        <Button
                          onClick={() => setShowCorrectionModal(true)}
                          variant="outline"
                          className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Request Correction
                        </Button>
                      </>
                    )}

                    {selectedReport.status === "verified" && (
                      <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span>This report has been approved</span>
                      </div>
                    )}

                    {selectedReport.status === "rejected" && (
                      <div className="flex-1 bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
                        <XCircle className="h-5 w-5" />
                        <span>Correction requested - awaiting resubmission</span>
                      </div>
                    )}

                    <Button
                      onClick={handleExportToExcel}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                  </div>

                  {!canApprove && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Only Administrators can approve or request corrections for remittance
                        reports.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Remittance Report
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this remittance report?
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report ID:</span>
                  <span className="text-gray-900">{selectedReport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gate Location:</span>
                  <span className="text-gray-900">{selectedReport.gateLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="text-gray-900">
                    {selectedReport.month} {selectedReport.year}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="text-gray-900">
                    {(selectedReport.totalCash + selectedReport.totalDigital).toLocaleString()}{" "}
                    RWF
                  </span>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Once approved, this report will be marked as verified and the submitter will be
                  notified.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correction Request Modal */}
      <Dialog open={showCorrectionModal} onOpenChange={setShowCorrectionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              Request Correction
            </DialogTitle>
            <DialogDescription>
              Provide detailed remarks explaining what needs to be corrected
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Report ID:</span>
                  <span className="text-gray-900">{selectedReport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gate Location:</span>
                  <span className="text-gray-900">{selectedReport.gateLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted By:</span>
                  <span className="text-gray-900">{selectedReport.submittedBy}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correction-remarks">
                  Correction Remarks <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="correction-remarks"
                  placeholder="Explain what needs to be corrected and why. Be specific about discrepancies found..."
                  value={correctionRemarks}
                  onChange={(e) => setCorrectionRemarks(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  This message will be sent to the submitter for review and correction.
                </p>
              </div>

              <Alert className="bg-orange-50 border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800 text-sm">
                  The report will be marked as "Rejected" and returned to the submitter with your
                  remarks. They will need to correct and resubmit.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCorrectionModal(false);
                setCorrectionRemarks("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestCorrection}
              disabled={!correctionRemarks.trim() || isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Send Correction Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}