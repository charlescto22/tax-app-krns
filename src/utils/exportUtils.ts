/**
 * Converts an array of objects to a CSV string and triggers a file download.
 * @param data Array of data objects to export
 * @param filename The desired filename (without extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  // 1. Extract headers dynamically from the first object
  // (Or you can pass a custom header array if you want strict ordering)
  const headers = Object.keys(data[0]);
  
  // 2. Create the CSV content
  const csvRows = [];
  
  // Add Header Row
  csvRows.push(headers.join(','));

  // Add Data Rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      // Handle strings that might contain commas by wrapping them in quotes
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  // 3. Join all rows with newlines
  const csvString = csvRows.join('\n');

  // 4. Trigger Download
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};