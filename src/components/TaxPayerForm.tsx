import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { ArrowLeft, Save, User, Building2, MapPin, FileText } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  // Helper to generate the receipt number based on tax type
  const generateReceiptNumber = (taxType: string) => {
    if (!taxType) return "";
    
    // Map tax types to a 3-letter prefix
    const prefixMap: Record<string, string> = {
      commercial: "COM",
      customs: "CUS",
      property: "PRP",
      land: "LND",
      road: "ROD",
      excise: "EXC",
    };
    
    const prefix = prefixMap[taxType] || "TAX";
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, ''); // e.g. 20260512
    const randomId = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    
    return `${prefix}-${dateStr}-${randomId}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-calculate tax if taxable amount and tax rate are present
      if (field === "taxableAmount" || field === "taxRate") {
        const amount = parseFloat(field === "taxableAmount" ? value : updated.taxableAmount) || 0;
        const rate = parseFloat(field === "taxRate" ? value : updated.taxRate) || 0;
        updated.calculatedTax = (amount * rate / 100).toFixed(2);
      }

      // Auto-generate receipt number if tax type changes
      if (field === "taxType") {
        updated.receiptNumber = generateReceiptNumber(value);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const todayStr = new Date().toISOString().split('T')[0];

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.calculatedTax) || 0,
        date: todayStr,
        station: formData.collectionStation,
        status: "Verified",
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, "transactions"), transactionData);

      alert(`✅ ${t("saveSuccess")}`);
      onBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(`❌ ${t("saveError")}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToCollections")}
        </Button>
      </div>

      <div>
        <h1 className="text-gray-900 mb-2">{t("taxPayerRegistrationForm")}</h1>
        <p className="text-gray-600">{t("taxCalculatorDesc")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tax Payer Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle>{t("taxPayerInformation")}</CardTitle>
            </div>
            <CardDescription>{t("taxPayerInformationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxpayerName">{t("taxPayerName")}</Label>
              <Input
                id="taxpayerName"
                placeholder={t("taxPayerNamePlaceholder")}
                value={formData.taxpayerName}
                onChange={(e) => handleInputChange("taxpayerName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxpayerType">{t("taxPayerType")}</Label>
              <Select
                value={formData.taxpayerType}
                onValueChange={(value) => handleInputChange("taxpayerType", value)}
                required
              >
                <SelectTrigger id="taxpayerType">
                  <SelectValue placeholder={t("selectTaxPayerType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">{t("individual")}</SelectItem>
                  <SelectItem value="company">{t("company")}</SelectItem>
                  <SelectItem value="partnership">{t("partnership")}</SelectItem>
                  <SelectItem value="government">{t("government")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nrcOrRegistration">{t("nrcOrRegistration")}</Label>
              <Input
                id="nrcOrRegistration"
                placeholder="e.g., 12/OUKAMA(N)123456"
                value={formData.nrcOrRegistration}
                onChange={(e) => handleInputChange("nrcOrRegistration", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t("phoneNumber")}</Label>
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
              <Label htmlFor="email">{t("email")}</Label>
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
              <CardTitle>{t("addressInformation")}</CardTitle>
            </div>
            <CardDescription>{t("addressInformationDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Textarea
                id="address"
                placeholder={t("addressPlaceholder")}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="township">{t("township")}</Label>
              <Select
                value={formData.township}
                onValueChange={(value) => handleInputChange("township", value)}
                required
              >
                <SelectTrigger id="township">
                  <SelectValue placeholder={t("selectTownship")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deemawhso">{t("deemawhso")}</SelectItem>
                  <SelectItem value="deebaungkhu">{t("deebaungkhu")}</SelectItem>
                  <SelectItem value="hoyo">{t("hoyo")}</SelectItem>
                  <SelectItem value="hubaw">{t("hubaw")}</SelectItem>
                  <SelectItem value="kaylyar">{t("kaylyar")}</SelectItem>
                  <SelectItem value="hsomo_phayhsoelay">{t("hsomo_phayhsoelay")}</SelectItem>
                  <SelectItem value="lomukho">{t("lomukho")}</SelectItem>
                  <SelectItem value="loinanpha">{t("loinanpha")}</SelectItem>
                  <SelectItem value="loikaw">{t("loikaw")}</SelectItem>
                  <SelectItem value="melse">{t("melse")}</SelectItem>
                  <SelectItem value="nanmakhon">{t("nanmakhon")}</SelectItem>
                  <SelectItem value="paulwart">{t("paulwart")}</SelectItem>
                  <SelectItem value="phunbawkhun">{t("phunbawkhun")}</SelectItem>
                  <SelectItem value="pekhon">{t("pekhon")}</SelectItem>
                  <SelectItem value="sotashar">{t("sotashar")}</SelectItem>
                  <SelectItem value="ywarthit">{t("ywarthit")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">{t("stateRegion")}</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => handleInputChange("state", value)}
                required
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder={t("selectStateRegion")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yangon">{t("yangon")}</SelectItem>
                  <SelectItem value="mandalay">{t("mandalay")}</SelectItem>
                  <SelectItem value="shan">{t("shan")}</SelectItem>
                  <SelectItem value="kachin">{t("kachin")}</SelectItem>
                  <SelectItem value="karenni">{t("karenni")}</SelectItem>
                  <SelectItem value="karen">{t("karen")}</SelectItem>
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
              <CardTitle>{t("taxCollectionDetails")}</CardTitle>
            </div>
            <CardDescription>{t("taxTypeAndPaymentInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxType">{t("taxType")} *</Label>
              <Select
                value={formData.taxType}
                onValueChange={(value) => handleInputChange("taxType", value)}
                required
              >
                <SelectTrigger id="taxType">
                  <SelectValue placeholder={t("selectTaxType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercial">{t("commercialTax")}</SelectItem>
                  <SelectItem value="customs">{t("customsDuty")}</SelectItem>
                  <SelectItem value="property">{t("propertyTax")}</SelectItem>
                  <SelectItem value="land">{t("landTax")}</SelectItem>
                  <SelectItem value="road">{t("roadTax")}</SelectItem>
                  <SelectItem value="excise">{t("exciseTax")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionStation">{t("collectionStation")} *</Label>
              <Select
                value={formData.collectionStation}
                onValueChange={(value) => handleInputChange("collectionStation", value)}
                required
              >
                <SelectTrigger id="collectionStation">
                  <SelectValue placeholder={t("selectStation")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pasaela">{t("pasaelaGate")}</SelectItem>
                  <SelectItem value="8mile">{t("eightMileGate")}</SelectItem>
                  <SelectItem value="central">{t("centralDistrict")}</SelectItem>
                  <SelectItem value="township4">{t("townshipOffice4")}</SelectItem>
                  <SelectItem value="border2">{t("borderCheckpoint2")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxableAmount">{t("taxableAmount")}</Label>
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
              <Label htmlFor="taxRate">{t("taxRate")}</Label>
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
              <Label htmlFor="calculatedTax">{t("calculatedTax")}</Label>
              <Input
                id="calculatedTax"
                type="text"
                value={formData.calculatedTax}
                readOnly
                className="bg-gray-50 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">{t("paymentMethod")}</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange("paymentMethod", value)}
                required
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder={t("selectPaymentMethod")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t("cash")}</SelectItem>
                  <SelectItem value="bank-transfer">{t("bankTransfer")}</SelectItem>
                  <SelectItem value="mobile-payment">{t("mobilePayment")}</SelectItem>
                  <SelectItem value="cheque">{t("cheque")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">{t("receiptNumber")}</Label>
              <Input
                id="receiptNumber"
                placeholder={t("receiptNumberPlaceholder")}
                value={formData.receiptNumber}
                readOnly
                className="bg-gray-50 text-blue-700 font-bold tracking-wider"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">{t("remarks")}</Label>
              <Textarea
                id="remarks"
                placeholder={t("remarksPlaceholder")}
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
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? t("saving") : t("saveRecord")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}