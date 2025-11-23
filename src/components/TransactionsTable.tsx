import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Eye, Check, X } from "lucide-react";
import { UserRole } from "../App";
// 1. Import Firestore tools
import { db } from "../firebase";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";

interface TransactionsTableProps {
  userRole?: UserRole;
}

export function TransactionsTable({ userRole }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<any[]>([]);

  // 2. Connect to the Database (Real-time Listener)
  useEffect(() => {
    // Query: Get 'transactions' collection, ordered by newest first
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    
    // Listener: Runs every time data changes in the cloud
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(liveData);
    });

    return () => unsubscribe(); // Cleanup when component unmounts
  }, []);

  // 3. Approve Logic (Writes to Cloud)
  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to VERIFY this transaction?")) {
      const ref = doc(db, "transactions", id);
      try {
        await updateDoc(ref, { status: "Verified" });
      } catch (error) {
        console.error("Error verifying transaction:", error);
        alert("Failed to verify transaction.");
      }
    }
  };

  // 4. Reject Logic (Writes to Cloud)
  const handleReject = async (id: string) => {
    const reason = prompt("Please enter a reason for rejection:");
    if (reason) {
      const ref = doc(db, "transactions", id);
      try {
        await updateDoc(ref, { 
          status: "Rejected",
          rejectionReason: reason
        });
      } catch (error) {
        console.error("Error rejecting transaction:", error);
        alert("Failed to reject transaction.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest tax collection entries across all stations</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Tax Type</TableHead>
                <TableHead>Station Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>{transaction.date}</div>
                      <div className="text-gray-500">{transaction.time}</div>
                    </TableCell>
                    <TableCell>{transaction.taxType}</TableCell>
                    <TableCell>{transaction.station}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "Verified" ? "default" : 
                          transaction.status === "Pending" || transaction.status === "Offline-Pending" ? "secondary" : 
                          "destructive"
                        }
                        className={
                          transaction.status === "Verified"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : transaction.status === "Pending" || transaction.status === "Offline-Pending"
                            ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Only Admins see buttons on Pending items */}
                      {userRole === "administrator" && (transaction.status === "Pending" || transaction.status === "Offline-Pending") ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 h-8 px-2"
                            onClick={() => handleApprove(transaction.id)}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 px-2"
                            onClick={() => handleReject(transaction.id)}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border rounded-lg">
              No transactions found.
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-gray-900 font-medium">{transaction.taxType}</div>
                    <div className="text-gray-500 text-sm">{transaction.date} • {transaction.time}</div>
                  </div>
                  <Badge
                    variant={
                      transaction.status === "Verified" ? "default" : 
                      transaction.status === "Pending" || transaction.status === "Offline-Pending" ? "secondary" : 
                      "destructive"
                    }
                    className={
                      transaction.status === "Verified"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : transaction.status === "Pending" || transaction.status === "Offline-Pending"
                        ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-500">Station</div>
                    <div className="text-gray-900">{transaction.station}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">Amount</div>
                    <div className="text-gray-900 font-medium">{transaction.amount}</div>
                  </div>
                </div>

                {/* Mobile Actions */}
                <div className="pt-2 border-t border-gray-100 flex gap-2">
                  {userRole === "administrator" && (transaction.status === "Pending" || transaction.status === "Offline-Pending") ? (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(transaction.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(transaction.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}