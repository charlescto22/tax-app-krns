import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus, Download, Filter, Eye, Lock, Calculator } from "lucide-react";
import type { UserRole } from "../App";
import { useState } from "react";
import { TaxPayerForm } from "./TaxPayerForm";

const collections = [
  { id: "1", station: "Pasaela Gate", taxType: "Commercial Tax", amount: "MMK 1,245,000", collectors: 3, status: "Active" },
  { id: "2", station: "8-Mile Gate", taxType: "Customs Duty", amount: "MMK 2,850,000", collectors: 5, status: "Active" },
  { id: "3", station: "Central District", taxType: "Property Tax", amount: "MMK 980,000", collectors: 2, status: "Active" },
  { id: "4", station: "Township Office 4", taxType: "Land Tax", amount: "MMK 560,000", collectors: 2, status: "Inactive" },
  { id: "5", station: "Border Checkpoint 2", taxType: "Customs Duty", amount: "MMK 3,200,000", collectors: 6, status: "Active" },
];

interface TaxCollectionPageProps {
  userRole: UserRole;
  onNavigateToCalculation?: () => void;
}

export function TaxCollectionPage({ userRole, onNavigateToCalculation }: TaxCollectionPageProps) {
  const isReadOnly = userRole === "remittance-manager";
  const [showTaxPayerForm, setShowTaxPayerForm] = useState(false);
  
  // If showing the tax payer form, render it instead of the main view
  if (showTaxPayerForm) {
    return <TaxPayerForm onBack={() => setShowTaxPayerForm(false)} />;
  }
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 mb-2">Tax Collection</h1>
          <p className="text-gray-600">
            {isReadOnly ? "View tax collection stations and operations" : "Manage tax collection stations and daily operations"}
          </p>
          {isReadOnly && (
            <div className="flex items-center gap-2 mt-2">
              <Lock className="h-4 w-4 text-orange-600" />
              <span className="text-orange-600">View Only - Limited Access</span>
            </div>
          )}
        </div>
        {!isReadOnly && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              onClick={onNavigateToCalculation}
            >
              <Calculator className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Collection</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Action Card */}
      {!isReadOnly && (
        <Card className="border-blue-200 bg-blue-50/50 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Create New Tax Collection</h3>
                  <p className="text-gray-600">Use the Tax Calculation tool to create a new collection record with automatic calculations</p>
                </div>
              </div>
              <Button 
                onClick={onNavigateToCalculation}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto whitespace-nowrap"
              >
                Go to Tax Calculator
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Active Stations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">42</div>
            <p className="text-gray-500">Out of 45 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Today's Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">MMK 8.9M</div>
            <p className="text-green-600">+15% vs yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Active Collectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">128</div>
            <p className="text-gray-500">On duty now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">Avg. Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">MMK 245K</div>
            <p className="text-gray-500">Per collection</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection Stations</CardTitle>
          <CardDescription>Active tax collection points across all regions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Name</TableHead>
                  <TableHead>Tax Type</TableHead>
                  <TableHead>Today's Amount</TableHead>
                  <TableHead>Active Collectors</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell>{collection.station}</TableCell>
                    <TableCell>{collection.taxType}</TableCell>
                    <TableCell>{collection.amount}</TableCell>
                    <TableCell>{collection.collectors} collectors</TableCell>
                    <TableCell>
                      <Badge
                        variant={collection.status === "Active" ? "default" : "secondary"}
                        className={
                          collection.status === "Active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {collection.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View {isReadOnly ? "" : "Details"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {collections.map((collection) => (
              <div key={collection.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-gray-900">{collection.station}</div>
                    <div className="text-gray-500">{collection.taxType}</div>
                  </div>
                  <Badge
                    variant={collection.status === "Active" ? "default" : "secondary"}
                    className={
                      collection.status === "Active"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                    }
                  >
                    {collection.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-gray-500">Today's Amount</div>
                    <div className="text-gray-900">{collection.amount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Collectors</div>
                    <div className="text-gray-900">{collection.collectors} active</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View {isReadOnly ? "" : "Details"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}