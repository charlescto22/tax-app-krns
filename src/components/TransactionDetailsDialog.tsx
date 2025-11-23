import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Package, Truck, TreePine, FileText, User, Calendar, MapPin, DollarSign } from "lucide-react";

interface TransactionDetailsDialogProps {
  transaction: any;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailsDialog({ transaction, isOpen, onClose }: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "trade": return <Package className="h-5 w-5 text-blue-600" />;
      case "road": return <Truck className="h-5 w-5 text-orange-600" />;
      case "land": return <TreePine className="h-5 w-5 text-green-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const details = transaction.details || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-gray-100 rounded-full">
              {getIcon(details.calculationPath || "default")}
            </div>
            <div>
              <DialogTitle className="text-lg">Transaction Details</DialogTitle>
              <DialogDescription>
                Receipt #{transaction.id || details.receiptNumber || "N/A"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Banner */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Status</span>
            <Badge 
              variant={transaction.status === "Verified" ? "default" : "secondary"}
              className={
                transaction.status === "Verified" ? "bg-green-100 text-green-800" :
                transaction.status === "Pending" ? "bg-orange-100 text-orange-800" :
                "bg-red-100 text-red-800"
              }
            >
              {transaction.status}
            </Badge>
          </div>

          {/* Amount Section */}
          <div className="text-center py-4">
            <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{transaction.amount}</div>
          </div>

          <Separator />

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <Calendar className="h-3 w-3" /> Date
              </div>
              <div className="font-medium">{transaction.date} {transaction.time}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="h-3 w-3" /> Station
              </div>
              <div className="font-medium">{transaction.station}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <FileText className="h-3 w-3" /> Tax Type
              </div>
              <div className="font-medium">{transaction.taxType}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-gray-500">
                <User className="h-3 w-3" /> Collector
              </div>
              <div className="font-medium">{transaction.createdBy || "System"}</div>
            </div>
          </div>

          <Separator />

          {/* Specific Details based on Type */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-900">Transaction Specifics</h4>
            <div className="bg-gray-50 p-3 rounded-md space-y-2 text-sm">
              {details.taxpayerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxpayer:</span>
                  <span className="font-medium">{details.taxpayerName}</span>
                </div>
              )}
              {details.taxpayerNRC && (
                <div className="flex justify-between">
                  <span className="text-gray-600">NRC/ID:</span>
                  <span className="font-medium">{details.taxpayerNRC}</span>
                </div>
              )}
              
              {/* Trade Specifics */}
              {details.goodsType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Goods Type:</span>
                  <span className="font-medium capitalize">{details.goodsType}</span>
                </div>
              )}
              {details.cargoValue && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cargo Value:</span>
                  <span className="font-medium">{details.cargoValue}</span>
                </div>
              )}

              {/* Road Specifics */}
              {details.vehicleType && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium capitalize">{details.vehicleType}</span>
                </div>
              )}

              {/* Land Specifics */}
              {details.landArea && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Land Area:</span>
                  <span className="font-medium">{details.landArea} acres</span>
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          {details.remarks && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase">Remarks</span>
              <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-100">
                {details.remarks}
              </p>
            </div>
          )}
          
          {/* Rejection Reason (if rejected) */}
          {transaction.rejectionReason && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-red-500 uppercase">Rejection Reason</span>
              <p className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100">
                {transaction.rejectionReason}
              </p>
            </div>
          )}

        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}