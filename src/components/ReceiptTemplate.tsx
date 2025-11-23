import { forwardRef } from "react";

interface ReceiptData {
  receiptNumber: string;
  date: string;
  time: string;
  station: string;
  collector: string;
  taxpayerName: string;
  taxType: string;
  amount: string;
  
  // New fields for detailed receipt
  department?: string;
  goodsType?: string;
  cargoValue?: string;
  vehicleType?: string;
  landArea?: string;
}

interface ReceiptTemplateProps {
  data: ReceiptData | null;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div style={{ display: "none" }}>
      <div ref={ref} className="print-container">
        <style>
          {`
            @media print {
              @page {
                margin: 0;
                size: 58mm auto; /* Target 58mm paper width */
              }
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 58mm; /* Fixed width for thermal printer */
                font-family: 'Courier New', monospace; /* Monospace looks better on receipts */
                font-size: 12px;
                color: black;
                background: white;
                padding: 5px;
                line-height: 1.2;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                border-bottom: 1px dashed black;
                padding-bottom: 5px;
              }
              .title {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 2px;
              }
              .subtitle {
                font-size: 10px;
              }
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
              }
              .label {
                font-weight: bold;
                margin-right: 5px;
              }
              .value {
                text-align: right;
                word-break: break-word;
                max-width: 65%;
              }
              .total {
                margin-top: 10px;
                border-top: 1px dashed black;
                border-bottom: 1px dashed black;
                padding: 5px 0;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 10px;
              }
            }
          `}
        </style>

        {/* Receipt Content */}
        <div className="header">
          <div className="title">IEC TAX DEPARTMENT</div>
          <div className="subtitle">Karenni State Government</div>
          <div className="subtitle">Official Tax Receipt</div>
        </div>

        {/* Metadata Section */}
        <div className="row">
          <span className="label">Date:</span>
          <span className="value">{data.date} {data.time}</span>
        </div>
        <div className="row">
          <span className="label">Rcpt #:</span>
          <span className="value">{data.receiptNumber}</span>
        </div>
        <div className="row">
          <span className="label">Station:</span>
          <span className="value">{data.station}</span>
        </div>
        <div className="row">
          <span className="label">Collector:</span>
          <span className="value">{data.collector}</span>
        </div>

        {/* Department Info (if available) */}
        {data.department && (
          <div className="row">
            <span className="label">Dept:</span>
            <span className="value" style={{ textTransform: 'capitalize' }}>{data.department}</span>
          </div>
        )}

        <div style={{ margin: '8px 0', borderBottom: '1px solid black' }}></div>

        {/* Payer Info */}
        <div className="row">
          <span className="label">Payer:</span>
          <span className="value">{data.taxpayerName}</span>
        </div>
        <div className="row">
          <span className="label">Type:</span>
          <span className="value">{data.taxType}</span>
        </div>

        {/* Conditional Details based on Tax Type */}
        
        {/* Trade Details */}
        {data.goodsType && (
          <div className="row">
            <span className="label">Goods:</span>
            <span className="value" style={{ textTransform: 'capitalize' }}>{data.goodsType}</span>
          </div>
        )}
        {data.cargoValue && (
          <div className="row">
            <span className="label">Value:</span>
            <span className="value">{data.cargoValue}</span>
          </div>
        )}

        {/* Road Details */}
        {data.vehicleType && (
          <div className="row">
            <span className="label">Vehicle:</span>
            <span className="value" style={{ textTransform: 'capitalize' }}>{data.vehicleType}</span>
          </div>
        )}

        {/* Land Details */}
        {data.landArea && (
          <div className="row">
            <span className="label">Area:</span>
            <span className="value">{data.landArea} acres</span>
          </div>
        )}

        {/* Total Amount */}
        <div className="total">
          TOTAL: {data.amount}
        </div>

        {/* Footer */}
        <div className="footer">
          <p>Thank you for your contribution.</p>
          <p>Retain this receipt for your records.</p>
          <p style={{ marginTop: '5px' }}>*** End of Receipt ***</p>
        </div>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = "ReceiptTemplate";