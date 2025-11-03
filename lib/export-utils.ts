interface TimeEntry {
  start_time: string
  end_time: string
  duration_minutes: number
  amount: number
  notes: string | null
  clients: {
    name: string
  }
  projects?: {
    name: string
  } | null
}

interface Client {
  id: string
  name: string
  email?: string
}

export function generateTimeEntriesCSV(entries: TimeEntry[]): string {
  // CSV Header
  const headers = [
    'Date',
    'Client',
    'Project',
    'Start Time',
    'End Time',
    'Duration (hours)',
    'Rate',
    'Amount',
    'Notes',
  ]

  // CSV Rows
  const rows = entries.map((entry) => {
    const startDate = new Date(entry.start_time)
    const endDate = new Date(entry.end_time)

    const date = startDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const durationHours = (entry.duration_minutes / 60).toFixed(2)
    const rate = (entry.amount / (entry.duration_minutes / 60)).toFixed(2)
    const amount = entry.amount.toFixed(2)
    const notes = entry.notes || ''
    const projectName = entry.projects?.name || ''

    return [
      date,
      entry.clients.name,
      projectName,
      startTime,
      endTime,
      durationHours,
      `$${rate}`,
      `$${amount}`,
      `"${notes.replace(/"/g, '""')}"`, // Escape quotes in notes
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  return csvContent
}

/**
 * Generate QuickBooks IIF format export
 */
export function generateQuickBooksIIF(entries: TimeEntry[], clients: Client[]): string {
  const lines: string[] = []

  // Header
  lines.push('!TIMERHDR\tVER\tREL\tCOMPANYNAME\tIMPORTEDBEFORE\tFROMTIMER')
  lines.push('TIMERHDR\t8\t0\tTradeTimer\tN\tY')

  // Time entries
  lines.push('!TIMEACT\tDATE\tJOB\tEMP\tITEM\tPITEM\tDURATION\tNOTE\tBILLINGSTATUS')

  entries.forEach((entry) => {
    const date = new Date(entry.start_time).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    const client = entry.clients.name
    const duration = (entry.duration_minutes / 60).toFixed(2)
    const note = (entry.notes || '').replace(/\t/g, ' ').replace(/\n/g, ' ')
    const item = entry.projects?.name || 'Consulting'

    lines.push(
      `TIMEACT\t${date}\t${client}\t\t${item}\t\t${duration}\t${note}\tBillable`
    )
  })

  return lines.join('\n')
}

/**
 * Generate Xero CSV format export
 */
export function generateXeroCSV(entries: TimeEntry[], clients: Client[]): string {
  const headers = [
    '*ContactName',
    'InvoiceNumber',
    '*InvoiceDate',
    '*DueDate',
    'InventoryItemCode',
    '*Description',
    '*Quantity',
    '*UnitAmount',
    'Discount',
    'AccountCode',
    'TaxType',
    'TaxAmount',
    'TrackingName1',
    'TrackingOption1',
    'TrackingName2',
    'TrackingOption2',
    'Currency',
  ]

  const rows = entries.map((entry, index) => {
    const date = new Date(entry.start_time).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })
    const dueDate = new Date(entry.start_time)
    dueDate.setDate(dueDate.getDate() + 30)
    const dueDateStr = dueDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    })

    const clientName = entry.clients.name
    const description = entry.projects?.name
      ? `${entry.projects.name} - ${entry.notes || 'Time tracking'}`
      : entry.notes || 'Time tracking'
    const quantity = (entry.duration_minutes / 60).toFixed(2)
    const unitAmount = (entry.amount / (entry.duration_minutes / 60)).toFixed(2)

    return [
      clientName,
      `INV-${index + 1}`,
      date,
      dueDateStr,
      '',
      `"${description.replace(/"/g, '""')}"`,
      quantity,
      unitAmount,
      '',
      '200', // Default sales account code
      'Tax Exempt',
      '0',
      '',
      '',
      '',
      '',
      'USD',
    ]
  })

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function downloadIIF(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/x-iif;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
