// src/utils/csvExport.ts

/**
 * Downloads data as a CSV file.
 * @param data Array of objects to be converted to CSV.
 * @param filename The name of the file to be downloaded.
 * @param headers An object where keys are data keys and values are CSV headers.
 */
export const downloadCSV = (data: any[], filename: string, headers?: Record<string, string>) => {
  if (!data || data.length === 0) {
    console.warn("No data to export.")
    return
  }

  const csvRows = []

  // Use provided headers or extract keys from the first object
  const keys = headers ? Object.keys(headers) : Object.keys(data[0])

  // Add CSV headers
  const headerRow = headers ? Object.values(headers).join(",") : keys.join(",")
  csvRows.push(headerRow)

  // Add CSV data rows
  for (const row of data) {
    const values = keys.map((key) => {
      const value = row[key]
      // Handle commas and quotes in values
      const escapedValue = String(value).replace(/"/g, '""')
      return `"${escapedValue}"`
    })
    csvRows.push(values.join(","))
  }

  // Combine rows and create CSV content
  const csvContent = csvRows.join("\n")

  // Create a download link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  // Create a temporary link element
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", filename)
  document.body.appendChild(link)

  // Trigger the download
  link.click()

  // Clean up
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
