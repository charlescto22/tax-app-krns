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
  // Add other fields as needed
}

interface ReceiptTemplateProps {
  data: ReceiptData | null;
}

export const ReceiptTemplate = forwardRef<HTMLDivElement, ReceiptTemplateProps>(({ data }, ref) => {
  if (!data) return null;

  return (
    <div style={{ display: "none" }}>
      {/* Ensure the ref is attached to the inner container */}
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

        <div className="row">
          <span className="label">Date:</span>
          <span>{data.date} {data.time}</span>
        </div>
        <div className="row">
          <span className="label">Rcpt #:</span>
          <span>{data.receiptNumber}</span>
        </div>
        <div className="row">
          <span className="label">Station:</span>
          <span>{data.station}</span>
        </div>
        <div className="row">
          <span className="label">Collector:</span>
          <span>{data.collector}</span>
        </div>

        <div style={{ margin: '10px 0', borderBottom: '1px solid black' }}></div>

        <div className="row">
          <span className="label">Payer:</span>
          <span>{data.taxpayerName}</span>
        </div>
        <div className="row">
          <span className="label">Type:</span>
          <span>{data.taxType}</span>
        </div>

        <div className="total">
          TOTAL: {data.amount}
        </div>

        <div className="footer">
          <p>Thank you for your contribution.</p>
          <p>Retain this receipt for your records.</p>
        </div>
      </div>
    </div>
  );
});

ReceiptTemplate.displayName = "ReceiptTemplate";