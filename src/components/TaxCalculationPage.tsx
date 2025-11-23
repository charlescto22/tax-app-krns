import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { Calculator, DollarSign, Truck, TreePine, Package, AlertCircle, CheckCircle, Printer, Save } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";

// Import Firestore Tools
import { db, auth } from "../firebase"; 
import { collection, addDoc, doc, getDoc } from "firebase/firestore"; 

// Import Printing Tools
import { useReactToPrint } from "react-to-print";
import { ReceiptTemplate } from "./ReceiptTemplate";

// Lookup tables for rates
const COMMODITY_RATES = {
  fuel: 8.5,
  construction: 12.0,
  foodstuff: 5.0,
  electronics: 15.0,
  textiles: 10.0,
  other: 7.5,
};

const VEHICLE_RATES = {
  motorcycle: 5000,
  car: 10000,
  "6-wheel-truck": 20000,
  "heavy-truck": 35000,
  bus: 15000,
};

const ZONE_RATES = {
  urban: 25000,
  suburban: 15000,
  rural: 8000,
  highland: 5000,
};

// Centralized list of all tax types to match IDs used in UserManagementPage
const ALL_TAX_TYPES = [
  { id: "customs", label: "Customs Duty" },
  { id: "commercial", label: "Commercial Tax" },
  { id: "import-export", label: "Import/Export Tax" },
  { id: "road", label: "Road Tax" },
  { id: "bridge", label: "Bridge Tax" },
  { id: "land", label: "Land Tax" },
  { id: "irrigation", label: "Irrigation Tax" },
  { id: "agriculture", label: "Agriculture Tax" },
];

interface TaxCalculationPageProps {
  onNavigateToCollection?: () => void;
}

// Helper for offline saving (PWA Feature)
const saveOfflineRecord = (record: any) => {
  const existingQueue = JSON.parse(localStorage.getItem("offlineTaxQueue") || "[]");
  const offlineRecord = { 
    ...record, 
    status: "Offline-Pending", 
    synced: false 
  };
  
  localStorage.setItem("offlineTaxQueue", JSON.stringify([...existingQueue, offlineRecord]));
  return offlineRecord;
};

export function TaxCalculationPage({ onNavigateToCollection }: TaxCalculationPageProps) {
  const [taxCategory, setTaxCategory] = useState("");
  const [calculationPath, setCalculationPath] = useState<"trade" | "road" | "land" | null>(null);
  
  // Path A: Trade & Customs
  const [goodsType, setGoodsType] = useState("");
  const [cargoValue, setCargoValue] = useState("");
  const [taxRate, setTaxRate] = useState("");
  
  // Path B: Gate & Road Usage
  const [vehicleType, setVehicleType] = useState("");
  
  // Path C: Land & Property
  const [landArea, setLandArea] = useState("");
  const [zoneType, setZoneType] = useState("");
  
  // Common fields
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [currency, setCurrency] = useState("MMK");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [taxpayerName, setTaxpayerName] = useState("");
  const [taxpayerNRC, setTaxpayerNRC] = useState("");
  const [collectionStation, setCollectionStation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Permission State
  const [allowedTaxTypes, setAllowedTaxTypes] = useState<string[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Ref for printing
  const receiptRef = useRef<HTMLDivElement>(null);

  // Fetch User Permissions on Mount
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // If admin/manager, allow all. If collector, use specific list.
          if (userData.role === 'administrator' || userData.role === 'remittance-manager') {
            setAllowedTaxTypes(ALL_TAX_TYPES.map(t => t.id));
          } else {
            setAllowedTaxTypes(userData.allowedTaxTypes || []);
          }
          
          // Pre-fill station if assigned to user
          if (userData.station) {
             setCollectionStation(userData.station);
          }
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      } finally {
        setIsLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  // Determine calculation path based on tax category
  useEffect(() => {
    if (taxCategory === "customs" || taxCategory === "commercial" || taxCategory === "import-export") {
      setCalculationPath("trade");
    } else if (taxCategory === "road" || taxCategory === "bridge") {
      setCalculationPath("road");
    } else if (taxCategory === "land" || taxCategory === "irrigation" || taxCategory === "agriculture") {
      setCalculationPath("land");
    } else {
      setCalculationPath(null);
    }
    // Reset fields when category changes
    setCalculatedTax(0);
    setErrors({});
  }, [taxCategory]);

  // Path A: Trade & Customs Calculation
  useEffect(() => {
    if (calculationPath === "trade" && cargoValue && taxRate) {
      const value = parseFloat(cargoValue);
      const rate = parseFloat(taxRate);
      if (!isNaN(value) && !isNaN(rate)) {
        setCalculatedTax(value * (rate / 100));
      }
    }
  }, [calculationPath, cargoValue, taxRate]);

  // Auto-set tax rate when goods type is selected
  useEffect(() => {
    if (goodsType && COMMODITY_RATES[goodsType as keyof typeof COMMODITY_RATES]) {
      setTaxRate(COMMODITY_RATES[goodsType as keyof typeof COMMODITY_RATES].toString());
    }
  }, [goodsType]);

  // Path B: Road Usage Calculation
  useEffect(() => {
    if (calculationPath === "road" && vehicleType) {
      const rate = VEHICLE_RATES[vehicleType as keyof typeof VEHICLE_RATES];
      if (rate) {
        setCalculatedTax(rate);
      }
    }
  }, [calculationPath, vehicleType]);

  // Path C: Land & Property Calculation
  useEffect(() => {
    if (calculationPath === "land" && landArea && zoneType) {
      const area = parseFloat(landArea);
      const rate = ZONE_RATES[zoneType as keyof typeof ZONE_RATES];
      if (rate && !isNaN(area)) {
        setCalculatedTax(area * rate);
      }
    }
  }, [calculationPath, landArea, zoneType]);

  // Generate receipt number
  useEffect(() => {
    if (!receiptNumber) {
      const timestamp = Date.now();
      setReceiptNumber(`RCP-${timestamp.toString().slice(-8)}`);
    }
  }, [receiptNumber]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!taxpayerName.trim()) {
      newErrors.taxpayerName = "Taxpayer name is required";
    }
    if (!taxCategory) {
      newErrors.taxCategory = "Tax category is required";
    }
    if (!collectionStation) {
      newErrors.collectionStation = "Collection station is required";
    }

    // Path-specific validation
    if (calculationPath === "trade") {
      if (!goodsType) newErrors.goodsType = "Goods type is required";
      if (!cargoValue || parseFloat(cargoValue) <= 0 || isNaN(parseFloat(cargoValue))) newErrors.cargoValue = "Valid cargo value is required";
      if (!taxRate || parseFloat(taxRate) <= 0 || isNaN(parseFloat(taxRate))) newErrors.taxRate = "Valid tax rate is required";
    } else if (calculationPath === "road") {
      if (!vehicleType) newErrors.vehicleType = "Vehicle type is required";
    } else if (calculationPath === "land") {
      if (!landArea || parseFloat(landArea) <= 0 || isNaN(parseFloat(landArea))) newErrors.landArea = "Valid land area is required";
      if (!zoneType) newErrors.zoneType = "Zone type is required";
    }

    if (calculatedTax <= 0) {
      newErrors.calculatedTax = "Calculated tax must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setTaxCategory("");
    setGoodsType("");
    setCargoValue("");
    setTaxRate("");
    setVehicleType("");
    setLandArea("");
    setZoneType("");
    setCalculatedTax(0);
    setReceiptNumber("");
    setTaxpayerName("");
    setTaxpayerNRC("");
    setCollectionStation("");
    setRemarks("");
    setErrors({});
    // Generate new receipt number
    const timestamp = Date.now();
    setReceiptNumber(`RCP-${timestamp.toString().slice(-8)}`);
  };

  const handleSave = async () => { 
    if (validateForm()) {
      const isOnline = navigator.onLine; 
      
      const record = {
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        taxType: taxCategory,
        station: collectionStation,
        amount: `MMK ${calculatedTax.toLocaleString()}`,
        rawAmount: calculatedTax,
        status: isOnline ? "Pending" : "Offline-Pending", 
        
        details: {
          receiptNumber,
          taxpayerName,
          taxpayerNRC,
          calculationPath,
          remarks,
          goodsType: calculationPath === "trade" ? goodsType : null,
          cargoValue: calculationPath === "trade" ? cargoValue : null,
          vehicleType: calculationPath === "road" ? vehicleType : null,
          landArea: calculationPath === "land" ? landArea : null,
        },
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser?.email || "Tax Collector" // Use real email
      };
      
      try {
        if (isOnline) {
          const docRef = await addDoc(collection(db, "transactions"), record);
          console.log("Document written with ID: ", docRef.id);
          alert(`✓ Submission Sent to Cloud!\n\nReceipt: ${receiptNumber}\nID: ${docRef.id}\nStatus: PENDING VERIFICATION`);
        } else {
          const offlineRecord = saveOfflineRecord(record);
          console.log("Offline Record Saved:", offlineRecord);
          alert(`⚠️ OFFLINE MODE\n\nReceipt: ${receiptNumber}\nStatus: SAVED TO DEVICE\n\nRecord saved locally. Sync when internet returns.`);
        }
        handleReset();
      } catch (e) {
        console.error("Error adding document: ", e);
        alert("❌ Error saving to database. Please check your Firebase configuration or network.");
      }
    } else {
      alert("⚠️ Please complete all required fields correctly.");
    }
  };

  // Prepare data for the receipt template
  const receiptData = {
    receiptNumber,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    station: collectionStation || "Unknown Station",
    collector: auth.currentUser?.email || "Tax Collector",
    taxpayerName: taxpayerName || "Guest",
    taxType: taxCategory || "General",
    amount: `MMK ${calculatedTax.toLocaleString()}`,
    // Include new fields for detailed receipt
    goodsType: calculationPath === "trade" ? goodsType : undefined,
    cargoValue: calculationPath === "trade" ? cargoValue : undefined,
    vehicleType: calculationPath === "road" ? vehicleType : undefined,
    landArea: calculationPath === "land" ? landArea : undefined,
    department: "Tax Department" // You might want to fetch this dynamically if needed
  };

  // Setup Print Handler
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${receiptNumber}`,
    onAfterPrint: () => console.log("Print successful"),
    onPrintError: (error) => console.error("Print failed:", error),
  });

  const getPathColor = () => {
    switch (calculationPath) {
      case "trade": return "bg-blue-100 text-blue-800";
      case "road": return "bg-orange-100 text-orange-800";
      case "land": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPathIcon = () => {
    switch (calculationPath) {
      case "trade": return <Package className="h-5 w-5" />;
      case "road": return <Truck className="h-5 w-5" />;
      case "land": return <TreePine className="h-5 w-5" />;
      default: return <Calculator className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Tax Calculation</h1>
        <p className="text-gray-600">Dynamic calculation based on tax category and type</p>
      </div>

      {/* Current Calculation Path Indicator */}
      {calculationPath && (
        <Alert className={getPathColor()}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            {getPathIcon()}
            <span>
              <strong>Active Path:</strong>{" "}
              {calculationPath === "trade" && "Trade & Customs"}
              {calculationPath === "road" && "Gate & Road Usage"}
              {calculationPath === "land" && "Land & Property"}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Tax Category Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <CardTitle>Step 1: Select Tax Category</CardTitle>
          </div>
          <CardDescription>Choose the type of tax to calculate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxCategory">Tax Category *</Label>
            
            {/* UPDATED SELECT: Filters options based on allowedTaxTypes */}
            <Select value={taxCategory} onValueChange={setTaxCategory} disabled={isLoadingPermissions}>
              <SelectTrigger id="taxCategory">
                <SelectValue placeholder={isLoadingPermissions ? "Loading permissions..." : "Select tax category..."} />
              </SelectTrigger>
              <SelectContent>
                {ALL_TAX_TYPES
                  .filter(type => allowedTaxTypes.includes(type.id)) // <--- THE FILTER
                  .map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            {allowedTaxTypes.length === 0 && !isLoadingPermissions && (
               <p className="text-xs text-red-500 mt-1">You are not authorized to collect any taxes. Contact Admin.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxpayerName">Taxpayer Name *</Label>
              <Input
                id="taxpayerName"
                placeholder="Enter taxpayer name"
                value={taxpayerName}
                onChange={(e) => setTaxpayerName(e.target.value)}
              />
              {errors.taxpayerName && <p className="text-red-500 text-sm">{errors.taxpayerName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxpayerNRC">NRC / Registration No.</Label>
              <Input
                id="taxpayerNRC"
                placeholder="e.g., 12/OUKAMA(N)123456"
                value={taxpayerNRC}
                onChange={(e) => setTaxpayerNRC(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionStation">Collection Station *</Label>
              <Select value={collectionStation} onValueChange={setCollectionStation}>
                <SelectTrigger id="collectionStation">
                  <SelectValue placeholder="Select station..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pasaela">Pasaela Gate</SelectItem>
                  <SelectItem value="8mile">8-Mile Gate</SelectItem>
                  <SelectItem value="central">Central District</SelectItem>
                  <SelectItem value="township4">Township Office 4</SelectItem>
                  <SelectItem value="border2">Border Checkpoint 2</SelectItem>
                </SelectContent>
              </Select>
              {errors.collectionStation && <p className="text-red-500 text-sm">{errors.collectionStation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">Receipt Number</Label>
              <Input
                id="receiptNumber"
                placeholder="Auto-generated"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks / Additional Notes</Label>
            <Textarea
              id="remarks"
              placeholder="Enter any additional notes or comments"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* PATH A: Trade & Customs */}
      {calculationPath === "trade" && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <CardTitle>Path A: Trade & Customs Calculation</CardTitle>
            </div>
            <CardDescription>Calculate tax for commercial goods and imports/exports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goodsType">Goods Type *</Label>
              <Select value={goodsType} onValueChange={setGoodsType}>
                <SelectTrigger id="goodsType">
                  <SelectValue placeholder="Select goods type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">Fuel (8.5%)</SelectItem>
                  <SelectItem value="construction">Construction Materials (12%)</SelectItem>
                  <SelectItem value="foodstuff">Foodstuff (5%)</SelectItem>
                  <SelectItem value="electronics">Electronics (15%)</SelectItem>
                  <SelectItem value="textiles">Textiles (10%)</SelectItem>
                  <SelectItem value="other">Other Goods (7.5%)</SelectItem>
                </SelectContent>
              </Select>
              {errors.goodsType && <p className="text-red-500 text-sm">{errors.goodsType}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoValue">Total Cargo Value *</Label>
                <Input
                  id="cargoValue"
                  type="number"
                  placeholder="Enter cargo value"
                  value={cargoValue}
                  onChange={(e) => setCargoValue(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.cargoValue && <p className="text-red-500 text-sm">{errors.cargoValue}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%) *</Label>
                <Input
                  id="taxRate"
                  type="number"
                  placeholder="Auto-filled or manual"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.taxRate && <p className="text-red-500 text-sm">{errors.taxRate}</p>}
              </div>
            </div>

            <Alert className="bg-blue-100 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Formula:</strong> Calculated Tax = Cargo Value × (Tax Rate ÷ 100)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* PATH B: Gate & Road Usage */}
      {calculationPath === "road" && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-600" />
              <CardTitle>Path B: Gate & Road Usage Calculation</CardTitle>
            </div>
            <CardDescription>Calculate fixed rate tax for vehicle types (Demoso-Mawchi Section)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Vehicle Type *</Label>
              <RadioGroup value={vehicleType} onValueChange={setVehicleType}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="motorcycle" id="motorcycle" />
                    <Label htmlFor="motorcycle" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>Motorcycle</span>
                        <Badge variant="outline" className="bg-white">MMK 5,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="car" id="car" />
                    <Label htmlFor="car" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>Car</span>
                        <Badge variant="outline" className="bg-white">MMK 10,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="6-wheel-truck" id="6-wheel-truck" />
                    <Label htmlFor="6-wheel-truck" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>6-Wheel Truck</span>
                        <Badge variant="outline" className="bg-white">MMK 20,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="heavy-truck" id="heavy-truck" />
                    <Label htmlFor="heavy-truck" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>Heavy Truck</span>
                        <Badge variant="outline" className="bg-white">MMK 35,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="bus" id="bus" />
                    <Label htmlFor="bus" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>Bus</span>
                        <Badge variant="outline" className="bg-white">MMK 15,000</Badge>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              {errors.vehicleType && <p className="text-red-500 text-sm">{errors.vehicleType}</p>}
            </div>

            <Alert className="bg-orange-100 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Formula:</strong> Fixed Rate from Database (No calculation needed)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* PATH C: Land & Property */}
      {calculationPath === "land" && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-600" />
              <CardTitle>Path C: Land & Property Calculation</CardTitle>
            </div>
            <CardDescription>Calculate tax based on land area and zone classification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landArea">Land Area (Acres) *</Label>
                <Input
                  id="landArea"
                  type="number"
                  placeholder="Enter area in acres"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.landArea && <p className="text-red-500 text-sm">{errors.landArea}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneType">Zone Type *</Label>
                <Select value={zoneType} onValueChange={setZoneType}>
                  <SelectTrigger id="zoneType">
                    <SelectValue placeholder="Select zone..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban Zone (MMK 25,000/acre)</SelectItem>
                    <SelectItem value="suburban">Suburban Zone (MMK 15,000/acre)</SelectItem>
                    <SelectItem value="rural">Rural Zone (MMK 8,000/acre)</SelectItem>
                    <SelectItem value="highland">Highland Zone (MMK 5,000/acre)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.zoneType && <p className="text-red-500 text-sm">{errors.zoneType}</p>}
              </div>
            </div>

            <Alert className="bg-green-100 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Formula:</strong> Calculated Tax = Land Area (acres) × Rate per Acre
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Convergence Node: Total Payable Amount */}
      {calculationPath && (
        <Card className="border-2 border-blue-600">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <CardTitle>Total Payable Amount</CardTitle>
            </div>
            <CardDescription>Final calculated tax amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-gray-600 mb-1">Calculated Tax Amount</p>
                <div className="flex items-center gap-3">
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MMK">MMK</SelectItem>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-gray-900">{calculatedTax.toLocaleString()}</div>
                </div>
              </div>
              {calculatedTax > 0 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {calculatedTax > 0 ? (
              <Alert className="bg-green-100 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✓ Validation Passed: Amount is greater than 0
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-gray-100 border-gray-200">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-gray-600">
                  Please complete all required fields to calculate tax amount
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 sm:flex-none"
              >
                Reset Form
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={calculatedTax <= 0}
                className="flex-1 sm:flex-none"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                onClick={handleSave}
                disabled={calculatedTax <= 0 || !taxpayerName}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                Save & Record
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      {!calculationPath && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 space-y-2">
              <Calculator className="h-12 w-12 mx-auto text-gray-400" />
              <p>Select a tax category above to begin calculation</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left">
                <div className="border rounded-lg p-4">
                  <Package className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">Trade & Customs</h3>
                  <p className="text-gray-600">For commercial goods, imports, and exports</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Truck className="h-6 w-6 text-orange-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">Gate & Road Usage</h3>
                  <p className="text-gray-600">Fixed rates for vehicles on toll roads</p>
                </div>
                <div className="border rounded-lg p-4">
                  <TreePine className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">Land & Property</h3>
                  <p className="text-gray-600">Based on land area and zone type</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hidden Receipt Template for Printing */}
      <div style={{ display: "none" }}>
        <ReceiptTemplate ref={receiptRef} data={receiptData} />
      </div>
    </div>
  );
}