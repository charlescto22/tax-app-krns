import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus, Download, Filter, Eye, Lock, Calculator } from "lucide-react";
import type { UserRole } from "../App";
import { useState, useEffect } from "react";
import { TaxPayerForm } from "./TaxPayerForm";
import { useLanguage } from "../contexts/LanguageContext";
// 👇 1. Import Firebase 👇
import { db } from "../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface TaxCollectionPageProps {
  userRole: UserRole;
  onNavigateToCalculation?: () => void;
}

export function TaxCollectionPage({ userRole, onNavigateToCalculation }: TaxCollectionPageProps) {
  const isReadOnly = userRole === "remittance-manager";
  const [showTaxPayerForm, setShowTaxPayerForm] = useState(false);
  const { t } = useLanguage();

  // 👇 2. Add State for Real-Time Data 👇
  const [liveStations, setLiveStations] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeStations: 0,
    todaysCollection: 0,
    todayCount: 0,
    avgTransaction: 0,
  });

  // 👇 3. Listen to Firebase and calculate totals automatically 👇
  useEffect(() => {
    const q = query(collection(db, "transactions"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let todaysTotal = 0;
      let todayCount = 0;
      const stationMap = new Map();

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Only count verified transactions
        if (data.status === "Verified") {
          // Calculate Today's totals
          if (data.date === todayStr) {
            todaysTotal += Number(data.amount) || 0;
            todayCount++;
          }

          // Group by Station
          const stationName = data.station || "Unknown Station";
          if (!stationMap.has(stationName)) {
            stationMap.set(stationName, {
              id: stationName,
              station: stationName,
              taxType: "Multiple", // Since a station can collect various taxes
              amount: 0,
              collectors: Math.floor(Math.random() * 3) + 1, // Mocking active collectors for now
              status: "Active"
            });
          }
          
          // Add this transaction's amount to the station's total
          const stationData = stationMap.get(stationName);
          stationData.amount += Number(data.amount) || 0;
        }
      });

      // Format the stations for the table
      const groupedStations = Array.from(stationMap.values()).map(st => ({
        ...st,
        formattedAmount: `MMK ${(st.amount / 100000).toFixed(1)} Lakh`
      }));

      setLiveStations(groupedStations);
      setStats({
        activeStations: stationMap.size,
        todaysCollection: todaysTotal,
        todayCount: todayCount,
        avgTransaction: todayCount > 0 ? (todaysTotal / todayCount) : 0
      });
    });

    return () => unsubscribe();
  }, []);

  if (showTaxPayerForm) {
    return <TaxPayerForm onBack={() => setShowTaxPayerForm(false)} />;
  }

  return (
    <>
      <div>
        <h1 className="text-gray-900 mb-2">{t("taxCollection")}</h1>
        <p className="text-gray-600">
          {isReadOnly ? t("taxCollectionDescUser") : t("taxCollectionDescAdmin")}
        </p>
        {isReadOnly && (
          <div className="flex items-center gap-2 mt-2">
            <Lock className="h-4 w-4 text-orange-600" />
            <span className="text-orange-600">{t("viewOnly")}</span>
          </div>
        )}
      </div>
      
      {!isReadOnly && (
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t("filter")}</span>
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t("export")}</span>
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            onClick={onNavigateToCalculation}
          >
            <Calculator className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t("newCollection")}</span>
            <span className="sm:hidden">{t("new")}</span>
          </Button>
        </div>
      )}

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
                  <h3 className="text-gray-900 mb-1">{t("createNewCollection")}</h3>
                  <p className="text-gray-600">{t("createNewCollectionDesc")}</p>
                </div>
              </div>
              <Button 
                onClick={onNavigateToCalculation}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto whitespace-nowrap"
              >
                {t("goToCalculator")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 👇 4. Dynamic Summary Cards 👇 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">{t("activeStations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{stats.activeStations}</div>
            <p className="text-gray-500">{t("reportingData")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">{t("todaysCollection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{(stats.todaysCollection / 100000).toFixed(1)} Lakh</div>
            <p className="text-green-600">{stats.todayCount} transactions today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">{t("activeCollectors")}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mocking the collectors count based on stations for now */}
            <div className="text-gray-900">{stats.activeStations * 3}</div> 
            <p className="text-gray-500">{t("onDutyNow")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-600">{t("avgTransaction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-900">{(stats.avgTransaction / 100000).toFixed(1)} Lakh</div>
            <p className="text-gray-500">{t("perCollection")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("collectionStations")}</CardTitle>
          <CardDescription>{t("collectionStationsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("stationName")}</TableHead>
                  <TableHead>{t("taxType")}</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>{t("activeCollectors")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* 👇 5. Loop over Live Data Instead of Hardcoded Data 👇 */}
                {liveStations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No stations found. Create a collection to register a station.
                    </TableCell>
                  </TableRow>
                ) : (
                  liveStations.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">{station.station}</TableCell>
                      <TableCell>{station.taxType}</TableCell>
                      <TableCell>{station.formattedAmount}</TableCell>
                      <TableCell>{station.collectors} collectors</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {station.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View {isReadOnly ? "" : "Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {liveStations.map((station) => (
              <div key={station.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{station.station}</div>
                    <div className="text-gray-500 text-sm">{station.taxType}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {station.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Total Revenue</div>
                    <div className="text-gray-900">{station.formattedAmount}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Collectors</div>
                    <div className="text-gray-900">{station.collectors} active</div>
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