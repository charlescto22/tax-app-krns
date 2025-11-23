import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Settings, Plus, Edit, Trash2, Save, X, Package, Truck, TreePine, AlertCircle, CheckCircle } from "lucide-react";

// Initial rate data
const initialCommodityRates = [
  { id: "1", name: "Fuel", rate: 8.5, description: "Petroleum products and fuels" },
  { id: "2", name: "Construction Materials", rate: 12.0, description: "Building materials and supplies" },
  { id: "3", name: "Foodstuff", rate: 5.0, description: "Food and agricultural products" },
  { id: "4", name: "Electronics", rate: 15.0, description: "Electronic devices and components" },
  { id: "5", name: "Textiles", rate: 10.0, description: "Clothing and fabric materials" },
  { id: "6", name: "Other Goods", rate: 7.5, description: "Miscellaneous commercial goods" },
];

const initialVehicleRates = [
  { id: "1", name: "Motorcycle", rate: 5000, description: "Two-wheeled motorized vehicles" },
  { id: "2", name: "Car", rate: 10000, description: "Passenger cars and sedans" },
  { id: "3", name: "6-Wheel Truck", rate: 20000, description: "Medium cargo trucks" },
  { id: "4", name: "Heavy Truck", rate: 35000, description: "Large cargo and transport trucks" },
  { id: "5", name: "Bus", rate: 15000, description: "Passenger buses" },
];

const initialZoneRates = [
  { id: "1", name: "Urban Zone", rate: 25000, description: "City and municipal areas", unit: "per acre" },
  { id: "2", name: "Suburban Zone", rate: 15000, description: "Suburban residential areas", unit: "per acre" },
  { id: "3", name: "Rural Zone", rate: 8000, description: "Rural and agricultural areas", unit: "per acre" },
  { id: "4", name: "Highland Zone", rate: 5000, description: "Mountainous and highland regions", unit: "per acre" },
];

const initialTaxCategories = [
  { id: "1", name: "Customs Duty", type: "trade", description: "Import/export customs taxation" },
  { id: "2", name: "Commercial Tax", type: "trade", description: "General commercial transactions" },
  { id: "3", name: "Import/Export Tax", type: "trade", description: "Cross-border trade taxation" },
  { id: "4", name: "Road Tax", type: "road", description: "Vehicle road usage fees" },
  { id: "5", name: "Bridge Tax", type: "road", description: "Bridge and toll usage fees" },
  { id: "6", name: "Land Tax", type: "land", description: "Property and land taxation" },
  { id: "7", name: "Irrigation Tax", type: "land", description: "Agricultural water usage fees" },
  { id: "8", name: "Agriculture Tax", type: "land", description: "Farming and agricultural taxation" },
];

interface RateItem {
  id: string;
  name: string;
  rate: number;
  description: string;
  unit?: string;
}

interface CategoryItem {
  id: string;
  name: string;
  type: string;
  description: string;
}

export function TaxRateManagementPage() {
  const [commodityRates, setCommodityRates] = useState<RateItem[]>(initialCommodityRates);
  const [vehicleRates, setVehicleRates] = useState<RateItem[]>(initialVehicleRates);
  const [zoneRates, setZoneRates] = useState<RateItem[]>(initialZoneRates);
  const [taxCategories, setTaxCategories] = useState<CategoryItem[]>(initialTaxCategories);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<RateItem | CategoryItem | null>(null);
  const [currentTab, setCurrentTab] = useState<"commodity" | "vehicle" | "zone" | "category">("commodity");
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formRate, setFormRate] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormName("");
    setFormRate("");
    setFormDescription("");
    setFormType("");
    setFormUnit("");
    setErrors({});
  };

  const validateForm = (isCategory: boolean = false): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formName.trim()) {
      newErrors.name = "Name is required";
    }
    if (!isCategory && (!formRate || parseFloat(formRate) <= 0)) {
      newErrors.rate = "Valid rate is required";
    }
    if (!formDescription.trim()) {
      newErrors.description = "Description is required";
    }
    if (isCategory && !formType) {
      newErrors.type = "Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = (item: RateItem | CategoryItem, tab: string) => {
    setCurrentEditItem(item);
    setFormName(item.name);
    setFormDescription(item.description);
    
    if ('rate' in item) {
      setFormRate(item.rate.toString());
    }
    if ('type' in item) {
      setFormType(item.type);
    }
    if ('unit' in item) {
      setFormUnit(item.unit || "");
    }
    
    setCurrentTab(tab as any);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    const isCategory = currentTab === "category";
    
    if (!validateForm(isCategory)) {
      return;
    }

    if (currentEditItem) {
      const updatedItem = {
        ...currentEditItem,
        name: formName,
        description: formDescription,
        ...(isCategory ? { type: formType } : { rate: parseFloat(formRate) }),
        ...(currentTab === "zone" && { unit: formUnit }),
      };

      switch (currentTab) {
        case "commodity":
          setCommodityRates(commodityRates.map(item => 
            item.id === currentEditItem.id ? updatedItem as RateItem : item
          ));
          break;
        case "vehicle":
          setVehicleRates(vehicleRates.map(item => 
            item.id === currentEditItem.id ? updatedItem as RateItem : item
          ));
          break;
        case "zone":
          setZoneRates(zoneRates.map(item => 
            item.id === currentEditItem.id ? updatedItem as RateItem : item
          ));
          break;
        case "category":
          setTaxCategories(taxCategories.map(item => 
            item.id === currentEditItem.id ? updatedItem as CategoryItem : item
          ));
          break;
      }

      setEditDialogOpen(false);
      resetForm();
      setCurrentEditItem(null);
      showSuccessMessage();
    }
  };

  const handleAdd = (tab: string) => {
    setCurrentTab(tab as any);
    resetForm();
    setAddDialogOpen(true);
  };

  const handleSaveAdd = () => {
    const isCategory = currentTab === "category";
    
    if (!validateForm(isCategory)) {
      return;
    }

    const newId = Date.now().toString();

    switch (currentTab) {
      case "commodity":
        setCommodityRates([...commodityRates, {
          id: newId,
          name: formName,
          rate: parseFloat(formRate),
          description: formDescription,
        }]);
        break;
      case "vehicle":
        setVehicleRates([...vehicleRates, {
          id: newId,
          name: formName,
          rate: parseFloat(formRate),
          description: formDescription,
        }]);
        break;
      case "zone":
        setZoneRates([...zoneRates, {
          id: newId,
          name: formName,
          rate: parseFloat(formRate),
          description: formDescription,
          unit: formUnit || "per acre",
        }]);
        break;
      case "category":
        setTaxCategories([...taxCategories, {
          id: newId,
          name: formName,
          type: formType,
          description: formDescription,
        }]);
        break;
    }

    setAddDialogOpen(false);
    resetForm();
    showSuccessMessage();
  };

  const handleDelete = (item: RateItem | CategoryItem, tab: string) => {
    setCurrentEditItem(item);
    setCurrentTab(tab as any);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentEditItem) {
      switch (currentTab) {
        case "commodity":
          setCommodityRates(commodityRates.filter(item => item.id !== currentEditItem.id));
          break;
        case "vehicle":
          setVehicleRates(vehicleRates.filter(item => item.id !== currentEditItem.id));
          break;
        case "zone":
          setZoneRates(zoneRates.filter(item => item.id !== currentEditItem.id));
          break;
        case "category":
          setTaxCategories(taxCategories.filter(item => item.id !== currentEditItem.id));
          break;
      }

      setDeleteDialogOpen(false);
      setCurrentEditItem(null);
      showSuccessMessage();
    }
  };

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const RateTable = ({ data, type, icon: Icon, label }: { 
    data: RateItem[], 
    type: string, 
    icon: any, 
    label: string 
  }) => (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Manage {label.toLowerCase()} and their tax rates</CardDescription>
            </div>
          </div>
          <Button onClick={() => handleAdd(type)} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {type === "commodity" ? `${item.rate}%` : `MMK ${item.rate.toLocaleString()}`}
                      {item.unit && ` ${item.unit}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item, type)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item, type)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {data.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap ml-2">
                  {type === "commodity" ? `${item.rate}%` : `MMK ${item.rate.toLocaleString()}`}
                  {item.unit && ` ${item.unit}`}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(item, type)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(item, type)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const CategoryTable = () => (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Tax Categories</CardTitle>
              <CardDescription>Manage available tax categories and types</CardDescription>
            </div>
          </div>
          <Button onClick={() => handleAdd("category")} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxCategories.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className={
                        item.type === "trade" ? "bg-blue-100 text-blue-800" :
                        item.type === "road" ? "bg-orange-100 text-orange-800" :
                        "bg-green-100 text-green-800"
                      }
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{item.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(item, "category")}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(item, "category")}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {taxCategories.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-gray-500 text-sm mt-1">{item.description}</div>
                </div>
                <Badge 
                  variant="secondary"
                  className={`whitespace-nowrap ml-2 ${
                    item.type === "trade" ? "bg-blue-100 text-blue-800" :
                    item.type === "road" ? "bg-orange-100 text-orange-800" :
                    "bg-green-100 text-green-800"
                  }`}
                >
                  {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(item, "category")}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(item, "category")}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Tax Rate Management</h1>
        <p className="text-gray-600">Configure tax categories, goods types, and their associated rates</p>
      </div>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Changes saved successfully! Updated rates will be reflected in the Tax Calculation page.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="commodity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="commodity" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Trade & Goods</span>
            <span className="sm:hidden">Goods</span>
          </TabsTrigger>
          <TabsTrigger value="vehicle" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Vehicles</span>
            <span className="sm:hidden">Vehicles</span>
          </TabsTrigger>
          <TabsTrigger value="zone" className="flex items-center gap-2">
            <TreePine className="h-4 w-4" />
            <span className="hidden sm:inline">Land & Zones</span>
            <span className="sm:hidden">Zones</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
            <span className="sm:hidden">Categories</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commodity">
          <RateTable 
            data={commodityRates} 
            type="commodity" 
            icon={Package}
            label="Trade & Goods Rates"
          />
        </TabsContent>

        <TabsContent value="vehicle">
          <RateTable 
            data={vehicleRates} 
            type="vehicle" 
            icon={Truck}
            label="Vehicle Rates"
          />
        </TabsContent>

        <TabsContent value="zone">
          <RateTable 
            data={zoneRates} 
            type="zone" 
            icon={TreePine}
            label="Land & Zone Rates"
          />
        </TabsContent>

        <TabsContent value="category">
          <CategoryTable />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {currentTab === "category" ? "Tax Category" : "Rate"}</DialogTitle>
            <DialogDescription>
              Update the information below. Changes will be reflected immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {currentTab !== "category" && (
              <div className="space-y-2">
                <Label htmlFor="edit-rate">
                  Rate * {currentTab === "commodity" ? "(Percentage)" : "(MMK)"}
                </Label>
                <Input
                  id="edit-rate"
                  type="number"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  placeholder="Enter rate"
                  step={currentTab === "commodity" ? "0.1" : "1000"}
                />
                {errors.rate && <p className="text-red-500 text-sm">{errors.rate}</p>}
              </div>
            )}

            {currentTab === "category" && (
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type *</Label>
                <select
                  id="edit-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="trade">Trade & Customs</option>
                  <option value="road">Road & Gate</option>
                  <option value="land">Land & Property</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>
            )}

            {currentTab === "zone" && (
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="e.g., per acre"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Input
                id="edit-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter description"
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New {currentTab === "category" ? "Tax Category" : "Rate"}</DialogTitle>
            <DialogDescription>
              Enter the details for the new {currentTab === "category" ? "category" : "rate"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input
                id="add-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter name"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {currentTab !== "category" && (
              <div className="space-y-2">
                <Label htmlFor="add-rate">
                  Rate * {currentTab === "commodity" ? "(Percentage)" : "(MMK)"}
                </Label>
                <Input
                  id="add-rate"
                  type="number"
                  value={formRate}
                  onChange={(e) => setFormRate(e.target.value)}
                  placeholder="Enter rate"
                  step={currentTab === "commodity" ? "0.1" : "1000"}
                />
                {errors.rate && <p className="text-red-500 text-sm">{errors.rate}</p>}
              </div>
            )}

            {currentTab === "category" && (
              <div className="space-y-2">
                <Label htmlFor="add-type">Type *</Label>
                <select
                  id="add-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Select type...</option>
                  <option value="trade">Trade & Customs</option>
                  <option value="road">Road & Gate</option>
                  <option value="land">Land & Property</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
              </div>
            )}

            {currentTab === "zone" && (
              <div className="space-y-2">
                <Label htmlFor="add-unit">Unit</Label>
                <Input
                  id="add-unit"
                  value={formUnit}
                  onChange={(e) => setFormUnit(e.target.value)}
                  placeholder="e.g., per acre"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="add-description">Description *</Label>
              <Input
                id="add-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter description"
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setAddDialogOpen(false); resetForm(); }}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveAdd} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add {currentTab === "category" ? "Category" : "Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentEditItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Deleting this {currentTab === "category" ? "category" : "rate"} may affect existing tax calculations.
            </AlertDescription>
          </Alert>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}