import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Progress } from "./ui/progress";
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
  DollarSign,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  TrendingUp,
  AlertCircle,
  Download,
  Edit2,
  Lock,
  Unlock,
  PieChart,
  Receipt,
  Banknote,
  Building2,
  Shield,
  AlertTriangle,
  Loader2,
  Check,
  FileCheck,
} from "lucide-react";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { UserRole } from "../App";

interface DistributionCategory {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  color: string;
  icon: React.ElementType;
  isPaid: boolean;
  paymentMethod?: "cash" | "bank" | "mobile" | "";
  paidDate?: string;
  evidenceFile?: string;
  bankReference?: string;
}

interface RevenueDistributionPageProps {
  userRole: UserRole;
}

export function RevenueDistributionPage({ userRole }: RevenueDistributionPageProps) {
  const isAdmin = userRole === "administrator";
  
  // Mock verified revenue from previous reconciliation
  const [totalRevenue] = useState(150000000); // 150M MMK
  const [isLocked, setIsLocked] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DistributionCategory | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [bankReference, setBankReference] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [categories, setCategories] = useState<DistributionCategory[]>([
    {
      id: "central",
      name: "IEC Central Fund",
      percentage: 30,
      amount: 0,
      color: "#3b82f6", // Blue
      icon: Building2,
      isPaid: false,
    },
    {
      id: "defense",
      name: "Defense/Coalition Group A",
      percentage: 40,
      amount: 0,
      color: "#ef4444", // Red
      icon: Shield,
      isPaid: false,
    },
    {
      id: "local",
      name: "Local Administration",
      percentage: 20,
      amount: 0,
      color: "#10b981", // Green
      icon: Banknote,
      isPaid: false,
    },
    {
      id: "reserve",
      name: "Emergency Reserve",
      percentage: 10,
      amount: 0,
      color: "#f59e0b", // Amber
      icon: AlertTriangle,
      isPaid: false,
    },
  ]);

  // Calculate amounts whenever percentages change
  useEffect(() => {
    const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);
    
    setCategories(prevCategories =>
      prevCategories.map(cat => ({
        ...cat,
        amount: Math.round((cat.percentage / 100) * totalRevenue),
      }))
    );
  }, [totalRevenue]);

  const handlePercentageChange = (id: string, value: number) => {
    if (isLocked) return;
    
    const newValue = Math.max(0, Math.min(100, value));
    
    setCategories(prevCategories =>
      prevCategories.map(cat =>
        cat.id === id
          ? { ...cat, percentage: newValue }
          : cat
      )
    );
  };

  const totalPercentage = categories.reduce((sum, cat) => sum + cat.percentage, 0);
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.amount, 0);
  const paidCount = categories.filter(cat => cat.isPaid).length;
  const progressPercentage = (paidCount / categories.length) * 100;
  const isFullyPaid = paidCount === categories.length;

  const handleMarkAsPaid = () => {
    if (!selectedCategory || !paymentMethod) return;

    setIsProcessing(true);
    
    setTimeout(() => {
      setCategories(prevCategories =>
        prevCategories.map(cat =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                isPaid: true,
                paymentMethod: paymentMethod as "cash" | "bank" | "mobile",
                paidDate: new Date().toISOString(),
                bankReference: bankReference || undefined,
                evidenceFile: evidenceFile?.name || undefined,
              }
            : cat
        )
      );

      setShowPaymentModal(false);
      setSelectedCategory(null);
      setPaymentMethod("");
      setBankReference("");
      setEvidenceFile(null);
      setSuccessMessage(`Payment to ${selectedCategory.name} marked as completed!`);
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsProcessing(false);
    }, 1000);
  };

  const handleGenerateReport = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // Generate CSV report
      const csvContent = `Revenue Distribution Report - November 2025\n\nTotal Verified Revenue: ${totalRevenue.toLocaleString()} MMK\nDistribution Date: ${new Date().toLocaleDateString()}\nStatus: ${isFullyPaid ? "Fully Distributed" : "In Progress"}\n\nDistribution Breakdown:\nCategory,Percentage,Amount (MMK),Status,Payment Method,Reference,Date\n${categories.map(cat => 
        `${cat.name},${cat.percentage}%,${cat.amount.toLocaleString()},${cat.isPaid ? "Paid" : "Pending"},${cat.paymentMethod || "N/A"},${cat.bankReference || "N/A"},${cat.paidDate ? new Date(cat.paidDate).toLocaleDateString() : "N/A"}`
      ).join('\n')}\n\nTotal Allocated: ${totalAllocated.toLocaleString()} MMK\nCompletion: ${paidCount}/${categories.length} (${progressPercentage.toFixed(0)}%)\n\nGenerated by: Administrator\nGenerated on: ${new Date().toLocaleString()}\n`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Revenue_Distribution_Nov2025_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setShowReportModal(false);
      setSuccessMessage("Distribution report generated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsProcessing(false);
    }, 1000);
  };

  const chartData = categories.map(cat => ({
    name: cat.name,
    value: cat.percentage,
    amount: cat.amount,
    color: cat.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.value}%</p>
          <p className="text-sm text-gray-900">{data.amount.toLocaleString()} MMK</p>
        </div>
      );
    }
    return null;
  };

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Access Denied: Only Administrators (Central Treasurer/Director General) can access revenue distribution.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-gray-900">November 2025 - Revenue Distribution Plan</h1>
          <p className="text-gray-600">
            Central Treasury: Coalition revenue split-sheet and payout execution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`${
              isFullyPaid
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {isFullyPaid ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Fully Distributed
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Ready for Distribution
              </>
            )}
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

      {/* Total Revenue Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm">Total Verified Revenue (From Reconciliation)</span>
              </div>
              <div className="text-4xl text-blue-900">{totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-blue-600 mt-1">MMK (Myanmar Kyat)</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700 mb-1">Distribution Progress</div>
              <div className="text-2xl text-blue-900">{paidCount}/{categories.length}</div>
              <div className="text-xs text-blue-600">Payments Completed</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">Overall Progress</span>
              <span className="text-blue-900">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid - Split Logic & Payout Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel - Split Logic */}
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Split Logic - Agreed Percentages
                  </CardTitle>
                  <CardDescription>Define coalition revenue distribution</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLocked(!isLocked)}
                  className={isLocked ? "border-red-300 text-red-700" : "border-blue-300 text-blue-700"}
                >
                  {isLocked ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Locked
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlocked
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Percentage Input Table */}
              <div className="space-y-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-900">{category.name}</span>
                        </div>
                        {category.isPaid && (
                          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Percentage</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={category.percentage}
                              onChange={(e) =>
                                handlePercentageChange(category.id, parseFloat(e.target.value) || 0)
                              }
                              disabled={isLocked}
                              className="h-9"
                            />
                            <span className="text-sm text-gray-600">%</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Auto-Calculated Amount</Label>
                          <div className="h-9 flex items-center px-3 bg-white border border-gray-300 rounded-md">
                            <span className="text-sm text-gray-900">
                              {category.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Range Slider */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={category.percentage}
                        onChange={(e) =>
                          handlePercentageChange(category.id, parseFloat(e.target.value))
                        }
                        disabled={isLocked}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-700">Total Percentage:</span>
                  <span
                    className={`text-lg ${
                      totalPercentage === 100
                        ? "text-green-600"
                        : totalPercentage < 100
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {totalPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-gray-700">Total Allocated:</span>
                  <span className="text-lg text-gray-900">
                    {totalAllocated.toLocaleString()} MMK
                  </span>
                </div>

                {totalPercentage !== 100 && (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-sm">
                      {totalPercentage < 100
                        ? `Warning: ${(100 - totalPercentage).toFixed(1)}% unallocated`
                        : `Warning: Over-allocation by ${(totalPercentage - 100).toFixed(1)}%`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Visual Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-sm">
                          {value} ({entry.payload.value}%)
                        </span>
                      )}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Payout Execution */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payout Execution Tracker
            </CardTitle>
            <CardDescription>Record actual transfers and attach evidence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Action Checklist */}
            <div className="space-y-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      category.isPaid
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              category.isPaid ? "bg-green-200" : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                category.isPaid ? "text-green-700" : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 mb-1">{category.name}</div>
                            <div className="text-lg text-gray-900">
                              {category.amount.toLocaleString()} MMK
                            </div>
                            {category.isPaid && category.paidDate && (
                              <div className="text-xs text-green-600 mt-1">
                                Paid on {new Date(category.paidDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {category.isPaid ? (
                          <Badge className="bg-green-600 text-white shrink-0">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Completed
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowPaymentModal(true);
                            }}
                            size="sm"
                            className="shrink-0"
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            Mark as Paid
                          </Button>
                        )}
                      </div>

                      {/* Payment Details (if paid) */}
                      {category.isPaid && (
                        <>
                          <Separator />
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-gray-600">Method:</span>
                              <span className="ml-2 text-gray-900 capitalize">
                                {category.paymentMethod}
                              </span>
                            </div>
                            {category.bankReference && (
                              <div>
                                <span className="text-gray-600">Reference:</span>
                                <span className="ml-2 text-gray-900">
                                  {category.bankReference}
                                </span>
                              </div>
                            )}
                            {category.evidenceFile && (
                              <div className="col-span-2">
                                <span className="text-gray-600">Evidence:</span>
                                <span className="ml-2 text-gray-900">
                                  <FileCheck className="h-3 w-3 inline mr-1" />
                                  {category.evidenceFile}
                                </span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Status */}
            <Separator />

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Completion Status</span>
                  <span className="text-sm text-gray-900">
                    {paidCount}/{categories.length} Completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {isFullyPaid && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All distributions completed! Ready to generate final report.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report Section */}
      <Card className="border-2 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">Final Distribution Report</span>
              </div>
              <p className="text-sm text-purple-600">
                Generate comprehensive report for Council review and audit trail
              </p>
            </div>
            <Button
              onClick={() => setShowReportModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={paidCount === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Generate Final Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Record Payment Execution
            </DialogTitle>
            <DialogDescription>
              Mark payment as completed and attach transfer evidence
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <div className="space-y-4 py-4">
              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recipient:</span>
                  <span className="text-sm text-gray-900">{selectedCategory.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg text-gray-900">
                    {selectedCategory.amount.toLocaleString()} MMK
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Percentage:</span>
                  <span className="text-sm text-gray-900">{selectedCategory.percentage}%</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">
                  Payment Method <span className="text-red-500">*</span>
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash Payment</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Reference (if bank transfer) */}
              {paymentMethod === "bank" && (
                <div className="space-y-2">
                  <Label htmlFor="bank-reference">Bank Reference Number</Label>
                  <Input
                    id="bank-reference"
                    placeholder="e.g., TXN123456789"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                  />
                </div>
              )}

              {/* Evidence Upload */}
              <div className="space-y-2">
                <Label htmlFor="evidence-upload">
                  Upload Evidence (Receipt/Bank Slip)
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="evidence-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setEvidenceFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="evidence-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    {evidenceFile ? (
                      <div>
                        <p className="text-sm text-green-600 mb-1">
                          <FileCheck className="h-4 w-4 inline mr-1" />
                          {evidenceFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(evidenceFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  This action will mark the payment as completed and record it in the audit trail.
                  Ensure all information is accurate before confirming.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentMethod("");
                setBankReference("");
                setEvidenceFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={!paymentMethod || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Report Confirmation Modal */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Generate Final Distribution Report
            </DialogTitle>
            <DialogDescription>
              Create comprehensive report for Council and audit purposes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Report Period:</span>
                <span className="text-gray-900">November 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="text-gray-900">{totalRevenue.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="text-gray-900">{categories.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payments Completed:</span>
                <span className="text-gray-900">
                  {paidCount}/{categories.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge
                  className={
                    isFullyPaid
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {isFullyPaid ? "Complete" : "In Progress"}
                </Badge>
              </div>
            </div>

            <Alert className="bg-purple-50 border-purple-200">
              <FileText className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800 text-sm">
                Report will include: Distribution breakdown, payment details, timestamps, and
                evidence references. Suitable for Council review and audit trail.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate & Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
