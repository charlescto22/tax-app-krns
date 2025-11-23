import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Send, Clock, CheckCircle } from "lucide-react";
import type { UserRole } from "../App";

const remittances = [
  { id: "1", date: "2025-11-20", station: "Pasaela Gate", amount: "MMK 1,245,000", status: "Completed", reference: "RMT-2025-001" },
  { id: "2", date: "2025-11-20", station: "8-Mile Gate", amount: "MMK 2,850,000", status: "Processing", reference: "RMT-2025-002" },
  { id: "3", date: "2025-11-19", station: "Central District", amount: "MMK 980,000", status: "Completed", reference: "RMT-2025-003" },
  { id: "4", date: "2025-11-19", station: "Township Office 4", amount: "MMK 560,000", status: "Pending", reference: "RMT-2025-004" },
  { id: "5", date: "2025-11-19", station: "Border Checkpoint 2", amount: "MMK 3,200,000", status: "Completed", reference: "RMT-2025-005" },
];

interface RemittancePageProps {
  userRole: UserRole;
}

export function RemittancePage({ userRole }: RemittancePageProps) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Remittance Management</h1>
          <p className="text-gray-600">Track and manage fund transfers to central treasury</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
          <Send className="h-4 w-4 mr-2" />
          New Remittance
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Pending</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">MMK 4.2M</div>
            <p className="text-gray-500">8 remittances waiting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Processing</CardTitle>
              <div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">MMK 2.8M</div>
            <p className="text-gray-500">5 in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-600">Completed Today</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">MMK 12.5M</div>
            <p className="text-green-600">42 completed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Remittances</CardTitle>
          <CardDescription>Fund transfers from collection stations to central treasury</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remittances.map((remittance) => (
                  <TableRow key={remittance.id}>
                    <TableCell>{remittance.date}</TableCell>
                    <TableCell className="text-gray-600">{remittance.reference}</TableCell>
                    <TableCell>{remittance.station}</TableCell>
                    <TableCell>{remittance.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          remittance.status === "Completed"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : remittance.status === "Processing"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                        }
                      >
                        {remittance.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}