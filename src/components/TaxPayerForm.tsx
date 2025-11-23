import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Save, User, Building2, MapPin, FileText } from "lucide-react";

interface TaxPayerFormProps {
  onBack: () => void;
}

export function TaxPayerForm({ onBack }: TaxPayerFormProps) {
  const [formData, setFormData] = useState({
    taxpayerName: "",
    taxpayerType: "",
    nrcOrRegistration: "",
    phoneNumber: "",
    email: "",
    address: "",
    township: "",
    state: "",
    taxType: "",
    collectionStation: "",
    taxableAmount: "",
    taxRate: "",
    calculatedTax: "",
    paymentMethod: "",
    receiptNumber: "",
    remarks: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate tax if taxable amount and tax rate are present
      if (field === "taxableAmount" || field === "taxRate") {
        const amount = parseFloat(field === "taxableAmount" ? value : updated.taxableAmount) || 0;
        const rate = parseFloat(field === "taxRate" ? value : updated.taxRate) || 0;
        updated.calculatedTax = (amount * rate / 100).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically send the data to your backend
    alert("Tax collection record created successfully!");
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>

      <div>
        <h1 className="text-gray-900 mb-2">Tax Payer Registration Form</h1>
        <p className="text-gray-600">Create a new tax collection record</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax Payer Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle>Tax Payer Information</CardTitle>
            </div>
            <CardDescription>Basic information about the tax payer</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxpayerName">Tax Payer Name *</Label>
              <Input
                id="taxpayerName"
                placeholder="Enter full name"
                value={formData.taxpayerName}
                onChange={(e) => handleInputChange("taxpayerName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxpayerType">Tax Payer Type *</Label>
              <Select
                value={formData.taxpayerType}
                onValueChange={(value) => handleInputChange("taxpayerType", value)}
                required
              >
                <SelectTrigger id="taxpayerType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="government">Government Entity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nrcOrRegistration">NRC / Registration No. *</Label>
              <Input
                id="nrcOrRegistration"
                placeholder="e.g., 12/OUKAMA(N)123456"
                value={formData.nrcOrRegistration}
                onChange={(e) => handleInputChange("nrcOrRegistration", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+95 9XXXXXXXXX"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="taxpayer@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle>Address Information</CardTitle>
            </div>
            <CardDescription>Location details of the tax payer</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="township">Township *</Label>
              <Select
                value={formData.township}
                onValueChange={(value) => handleInputChange("township", value)}
                required
              >
                <SelectTrigger id="township">
                  <SelectValue placeholder="Select township" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yangon-downtown">Yangon Downtown</SelectItem>
                  <SelectItem value="north-okkalapa">North Okkalapa</SelectItem>
                  <SelectItem value="south-okkalapa">South Okkalapa</SelectItem>
                  <SelectItem value="hlaing">Hlaing</SelectItem>
                  <SelectItem value="kamayut">Kamayut</SelectItem>
                  <SelectItem value="dagon">Dagon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Region *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleInputChange("state", value)}
                required
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select state/region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yangon">Yangon Region</SelectItem>
                  <SelectItem value="mandalay">Mandalay Region</SelectItem>
                  <SelectItem value="shan">Shan State</SelectItem>
                  <SelectItem value="kachin">Kachin State</SelectItem>
                  <SelectItem value="kayah">Kayah State</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle>Tax Collection Details</CardTitle>
            </div>
            <CardDescription>Tax type and payment information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxType">Tax Type *</Label>
              <Select
                value={formData.taxType}
                onValueChange={(value) => handleInputChange("taxType", value)}
                required
              >
                <SelectTrigger id="taxType">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">Commercial Tax</SelectItem>
                  <SelectItem value="customs">Customs Duty</SelectItem>
                  <SelectItem value="property">Property Tax</SelectItem>
                  <SelectItem value="land">Land Tax</SelectItem>
                  <SelectItem value="road">Road Tax</SelectItem>
                  <SelectItem value="excise">Excise Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionStation">Collection Station *</Label>
              <Select
                value={formData.collectionStation}
                onValueChange={(value) => handleInputChange("collectionStation", value)}
                required
              >
                <SelectTrigger id="collectionStation">
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pasaela">Pasaela Gate</SelectItem>
                  <SelectItem value="8mile">8-Mile Gate</SelectItem>
                  <SelectItem value="central">Central District</SelectItem>
                  <SelectItem value="township4">Township Office 4</SelectItem>
                  <SelectItem value="border2">Border Checkpoint 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxableAmount">Taxable Amount (MMK) *</Label>
              <Input
                id="taxableAmount"
                type="number"
                placeholder="0.00"
                value={formData.taxableAmount}
                onChange={(e) => handleInputChange("taxableAmount", e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%) *</Label>
              <Input
                id="taxRate"
                type="number"
                placeholder="0.00"
                value={formData.taxRate}
                onChange={(e) => handleInputChange("taxRate", e.target.value)}
                required
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calculatedTax">Calculated Tax (MMK)</Label>
              <Input
                id="calculatedTax"
                type="text"
                value={formData.calculatedTax}
                readOnly
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
                required
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number *</Label>
              <Input
                id="receiptNumber"
                placeholder="e.g., RCP-2024-001234"
                value={formData.receiptNumber}
                onChange={(e) => handleInputChange("receiptNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Remarks / Notes</Label>
              <Textarea
                id="remarks"
                placeholder="Any additional notes or comments"
                value={formData.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button type="button" variant="outline" onClick={onBack} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Collection Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
