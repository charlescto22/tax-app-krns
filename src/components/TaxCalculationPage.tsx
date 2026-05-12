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
import { useLanguage } from "../contexts/LanguageContext";

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
  { id: "customs", labelKey: "customsDuty" },
  { id: "commercial", labelKey: "commercialTax" },
  { id: "import-export", labelKey: "importExportTax" }, // Ensure this is in translations if used
  { id: "road", labelKey: "roadTax" },
  { id: "bridge", labelKey: "bridgeTax" }, // Ensure this is in translations if used
  { id: "land", labelKey: "landTax" },
  { id: "irrigation", labelKey: "irrigationTax" }, // Ensure this is in translations if used
  { id: "agriculture", labelKey: "agricultureTax" }, // Ensure this is in translations if used
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
  const { t } = useLanguage();

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

  // Helper to generate the receipt number based on tax category AND station
  const generateReceiptNumber = (category: string, station: string) => {
    if (!category) return "";
    
    // 1. Get Tax Prefix
    const prefixMap: Record<string, string> = {
      "commercial": "COM", "customs": "CUS", "import-export": "IMP",
      "road": "ROD", "bridge": "BRG", "land": "LND",
      "irrigation": "IRR", "agriculture": "AGR",
    };
    const taxPrefix = prefixMap[category] || "TAX";

    // 2. Get Station Prefix
    const stationMap: Record<string, string> = {
      "pasaela": "PSL", "8mile": "8MI", "central": "CEN",
      "township4": "TS4", "border2": "BD2",
    };
    const stationPrefix = stationMap[station] || "UNK";
    
    // 3. Get Date
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, ''); 
    
    // 4. Generate 5-character alphanumeric secure random string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < 5; i++) {
      randomString += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `${taxPrefix}-${stationPrefix}-${dateStr}-${randomString}`;
  };

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
          if (userData.role === 'administrator' || userData.role === 'remittance-manager') {
            setAllowedTaxTypes(ALL_TAX_TYPES.map(t => t.id));
          } else {
            setAllowedTaxTypes(userData.allowedTaxTypes || []);
          }
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
    setCalculatedTax(0);
    setErrors({});
  // 👇 UPGRADE: Now it requires both Category AND Station to generate the final receipt
    if (taxCategory && collectionStation) {
      setReceiptNumber(generateReceiptNumber(taxCategory, collectionStation));
    } else {
      setReceiptNumber(""); // Keep empty until both are selected
    }
  }, [taxCategory, collectionStation]);

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
      newErrors.taxpayerName = "Required";
    }
    if (!taxCategory) {
      newErrors.taxCategory = "Required";
    }
    if (!collectionStation) {
      newErrors.collectionStation = "Required";
    }

    if (calculationPath === "trade") {
      if (!goodsType) newErrors.goodsType = "Required";
      if (!cargoValue || parseFloat(cargoValue) <= 0 || isNaN(parseFloat(cargoValue))) newErrors.cargoValue = "Required";
      if (!taxRate || parseFloat(taxRate) <= 0 || isNaN(parseFloat(taxRate))) newErrors.taxRate = "Required";
    } else if (calculationPath === "road") {
      if (!vehicleType) newErrors.vehicleType = "Required";
    } else if (calculationPath === "land") {
      if (!landArea || parseFloat(landArea) <= 0 || isNaN(parseFloat(landArea))) newErrors.landArea = "Required";
      if (!zoneType) newErrors.zoneType = "Required";
    }

    if (calculatedTax <= 0) {
      newErrors.calculatedTax = "Required";
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
    const timestamp = Date.now();
    setReceiptNumber("");
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
        createdBy: auth.currentUser?.email || "Tax Collector"
      };

      try {
        if (isOnline) {
          const docRef = await addDoc(collection(db, "transactions"), record);
          alert(`✅ ${t("saveSuccess")}\n\nReceipt: ${receiptNumber}\nID: ${docRef.id}`);
        } else {
          saveOfflineRecord(record);
          alert(`⚠️ OFFLINE MODE\n\nReceipt: ${receiptNumber}\nSaved to device. Sync when internet returns.`);
        }
        handleReset();
      } catch (e) {
        console.error("Error adding document: ", e);
        alert(`❌ ${t("saveError")}`);
      }
    }
  };

  const receiptData = {
    receiptNumber,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    station: collectionStation || "Unknown Station",
    collector: auth.currentUser?.email || "Tax Collector",
    taxpayerName: taxpayerName || "Guest",
    taxType: taxCategory || "General",
    amount: `MMK ${calculatedTax.toLocaleString()}`,
    goodsType: calculationPath === "trade" ? goodsType : undefined,
    cargoValue: calculationPath === "trade" ? cargoValue : undefined,
    vehicleType: calculationPath === "road" ? vehicleType : undefined,
    landArea: calculationPath === "land" ? landArea : undefined,
    department: "Tax Department"
  };

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: `Receipt-${receiptNumber}`,
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
        <h1 className="text-gray-900 mb-2">{t("taxCalculation")}</h1>
        <p className="text-gray-600">{t("taxCalculationDynamicDesc")}</p>
      </div>

      {calculationPath && (
        <Alert className={getPathColor()}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            {getPathIcon()}
            <span>
              <strong>{t("activePath")} </strong>{" "}
              {calculationPath === "trade" && t("tradeAndCustoms")}
              {calculationPath === "road" && t("gateAndRoadUsage")}
              {calculationPath === "land" && t("landAndProperty")}
            </span>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <CardTitle>{t("step1SelectCategory")}</CardTitle>
          </div>
          <CardDescription>{t("chooseTaxTypeToCalculate")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxCategory">{t("taxCategory")} *</Label>

            <Select value={taxCategory} onValueChange={setTaxCategory} disabled={isLoadingPermissions}>
              <SelectTrigger id="taxCategory">
                <SelectValue placeholder={isLoadingPermissions ? t("loadingPermissions") : t("selectTaxCategory")} />
              </SelectTrigger>
              <SelectContent>
                {ALL_TAX_TYPES
                  .filter(type => allowedTaxTypes.includes(type.id))
                  .map(type => (
                    // Uses t() dynamically if the key exists, otherwise falls back to label
                    <SelectItem key={type.id} value={type.id}>{t(type.labelKey) || type.label}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            {allowedTaxTypes.length === 0 && !isLoadingPermissions && (
              <p className="text-xs text-red-500 mt-1">{t("noPermissions")}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxpayerName">{t("taxPayerName")} *</Label>
              <Input
                id="taxpayerName"
                placeholder={t("enterTaxpayerName")}
                value={taxpayerName}
                onChange={(e) => setTaxpayerName(e.target.value)}
              />
              {errors.taxpayerName && <p className="text-red-500 text-sm">{errors.taxpayerName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxpayerNRC">{t("nrcOrRegistration")}</Label>
              <Input
                id="taxpayerNRC"
                placeholder="e.g., 12/OUKAMA(N)123456"
                value={taxpayerNRC}
                onChange={(e) => setTaxpayerNRC(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collectionStation">{t("collectionStation")} *</Label>
              <Select value={collectionStation} onValueChange={setCollectionStation}>
                <SelectTrigger id="collectionStation">
                  <SelectValue placeholder={t("selectStationPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pasaela">{t("pasaelaGate")}</SelectItem>
                  <SelectItem value="8mile">{t("eightMileGate")}</SelectItem>
                  <SelectItem value="central">{t("centralDistrict")}</SelectItem>
                  <SelectItem value="township4">{t("townshipOffice4")}</SelectItem>
                  <SelectItem value="border2">{t("borderCheckpoint2")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.collectionStation && <p className="text-red-500 text-sm">{errors.collectionStation}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiptNumber">{t("receiptNumber")}</Label>
              <Input
                id="receiptNumber"
                placeholder={t("receiptNumberPlaceholder")}
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">{t("remarksAdditionalNotes")}</Label>
            <Textarea
              id="remarks"
              placeholder={t("remarksPlaceholder")}
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
              <CardTitle>{t("pathATrade")}</CardTitle>
            </div>
            <CardDescription>{t("pathATradeDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goodsType">{t("goodsType")} *</Label>
              <Select value={goodsType} onValueChange={setGoodsType}>
                <SelectTrigger id="goodsType">
                  <SelectValue placeholder={t("selectGoodsType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuel">{t("fuel")} (8.5%)</SelectItem>
                  <SelectItem value="construction">{t("constructionMaterials")} (12%)</SelectItem>
                  <SelectItem value="foodstuff">{t("foodstuff")} (5%)</SelectItem>
                  <SelectItem value="electronics">{t("electronics")} (15%)</SelectItem>
                  <SelectItem value="textiles">{t("textiles")} (10%)</SelectItem>
                  <SelectItem value="other">{t("otherGoods")} (7.5%)</SelectItem>
                </SelectContent>
              </Select>
              {errors.goodsType && <p className="text-red-500 text-sm">{errors.goodsType}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cargoValue">{t("totalCargoValue")} *</Label>
                <Input
                  id="cargoValue"
                  type="number"
                  placeholder={t("enterCargoValue")}
                  value={cargoValue}
                  onChange={(e) => setCargoValue(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.cargoValue && <p className="text-red-500 text-sm">{errors.cargoValue}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">{t("taxRate")} *</Label>
                <Input
                  id="taxRate"
                  type="number"
                  placeholder={t("autoFilledOrManual")}
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
                <strong>{t("formula")}</strong> {t("formulaTrade")}
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
              <CardTitle>{t("pathBRoad")}</CardTitle>
            </div>
            <CardDescription>{t("pathBRoadDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>{t("vehicleType")} *</Label>
              <RadioGroup value={vehicleType} onValueChange={setVehicleType}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="motorcycle" id="motorcycle" />
                    <Label htmlFor="motorcycle" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{t("motorcycle")}</span>
                        <Badge variant="outline" className="bg-white">MMK 5,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="car" id="car" />
                    <Label htmlFor="car" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{t("car")}</span>
                        <Badge variant="outline" className="bg-white">MMK 10,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="6-wheel-truck" id="6-wheel-truck" />
                    <Label htmlFor="6-wheel-truck" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{t("sixWheelTruck")}</span>
                        <Badge variant="outline" className="bg-white">MMK 20,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="heavy-truck" id="heavy-truck" />
                    <Label htmlFor="heavy-truck" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{t("heavyTruck")}</span>
                        <Badge variant="outline" className="bg-white">MMK 35,000</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-orange-50 cursor-pointer">
                    <RadioGroupItem value="bus" id="bus" />
                    <Label htmlFor="bus" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{t("bus")}</span>
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
                <strong>{t("formula")}</strong> {t("formulaRoad")}
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
              <CardTitle>{t("pathCLand")}</CardTitle>
            </div>
            <CardDescription>{t("pathCLandDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landArea">{t("landAreaAcres")} *</Label>
                <Input
                  id="landArea"
                  type="number"
                  placeholder={t("enterAreaAcres")}
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {errors.landArea && <p className="text-red-500 text-sm">{errors.landArea}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneType">{t("zoneType")} *</Label>
                <Select value={zoneType} onValueChange={setZoneType}>
                  <SelectTrigger id="zoneType">
                    <SelectValue placeholder={t("selectZone")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">{t("urbanZone")} (MMK 25,000)</SelectItem>
                    <SelectItem value="suburban">{t("suburbanZone")} (MMK 15,000)</SelectItem>
                    <SelectItem value="rural">{t("ruralZone")} (MMK 8,000)</SelectItem>
                    <SelectItem value="highland">{t("highlandZone")} (MMK 5,000)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.zoneType && <p className="text-red-500 text-sm">{errors.zoneType}</p>}
              </div>
            </div>

            <Alert className="bg-green-100 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>{t("formula")}</strong> {t("formulaLand")}
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
              <CardTitle>{t("totalPayableAmount")}</CardTitle>
            </div>
            <CardDescription>{t("finalCalculatedTax")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-gray-600 mb-1">{t("calculatedTax")}</p>
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
                  {t("validationPassed")}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-gray-100 border-gray-200">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <AlertDescription className="text-gray-600">
                  {t("completeFieldsToCalculate")}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 sm:flex-none"
              >
                {t("resetForm")}
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={calculatedTax <= 0}
                className="flex-1 sm:flex-none"
              >
                <Printer className="h-4 w-4 mr-2" />
                {t("print")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={calculatedTax <= 0 || !taxpayerName}
                className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("saveAndRecord")}
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
              <p>{t("selectCategoryToBegin")}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-left">
                <div className="border rounded-lg p-4">
                  <Package className="h-6 w-6 text-blue-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">{t("tradeAndCustoms")}</h3>
                  <p className="text-gray-600">{t("tradeInfoDesc")}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <Truck className="h-6 w-6 text-orange-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">{t("gateAndRoadUsage")}</h3>
                  <p className="text-gray-600">{t("roadInfoDesc")}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <TreePine className="h-6 w-6 text-green-600 mb-2" />
                  <h3 className="text-gray-900 mb-1">{t("landAndProperty")}</h3>
                  <p className="text-gray-600">{t("landInfoDesc")}</p>
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