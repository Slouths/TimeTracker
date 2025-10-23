'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Download, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface TimeEntry {
  id: string
  client_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes: string | null
  amount: number
}

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  hourly_rate: number
}

interface GenerateInvoiceProps {
  userId: string
  onClose: () => void
}

export function GenerateInvoice({ userId, onClose }: GenerateInvoiceProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{
    entries: TimeEntry[]
    client: Client | null
    totalHours: number
    totalAmount: number
  } | null>(null)

  const supabase = createClient()

  // Load clients on mount
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (data) {
        setClients(data)
      }
    }
    loadClients()
  }, [userId, supabase])

  const handlePreview = async () => {
    if (!selectedClientId || !startDate || !endDate) {
      alert('Please select a client and date range')
      return
    }

    setLoading(true)

    const { data: entries } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', selectedClientId)
      .gte('start_time', new Date(startDate).toISOString())
      .lte('start_time', new Date(endDate + 'T23:59:59').toISOString())
      .order('start_time', { ascending: true })

    const client = clients.find((c) => c.id === selectedClientId) || null

    if (entries && entries.length > 0) {
      const totalHours = entries.reduce((sum, e) => sum + e.duration_minutes / 60, 0)
      const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0)

      setPreviewData({
        entries: entries as TimeEntry[],
        client,
        totalHours,
        totalAmount,
      })
    } else {
      alert('No time entries found for this client in the selected date range')
      setPreviewData(null)
    }

    setLoading(false)
  }

  const handleGeneratePDF = () => {
    if (!previewData || !previewData.client) return

    // Create a simple HTML invoice
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #219ebc; padding-bottom: 20px; }
    .company-name { font-size: 32px; font-weight: bold; color: #334155; margin-bottom: 10px; }
    .invoice-title { font-size: 24px; color: #64748b; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-block { flex: 1; }
    .info-label { font-weight: bold; color: #64748b; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { color: #334155; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: bold; color: #334155; border-bottom: 2px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #475569; }
    .total-row { font-weight: bold; background: #f8fafc; }
    .total-row td { border-top: 2px solid #cbd5e1; padding-top: 16px; font-size: 18px; }
    .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; }
    .amount { text-align: right; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">TradeTimer</div>
    <div class="invoice-title">INVOICE</div>
  </div>

  <div class="info-section">
    <div class="info-block">
      <div class="info-label">Bill To</div>
      <div class="info-value" style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${previewData.client.name}</div>
      ${previewData.client.email ? `<div class="info-value">${previewData.client.email}</div>` : ''}
      ${previewData.client.phone ? `<div class="info-value">${previewData.client.phone}</div>` : ''}
    </div>
    <div class="info-block" style="text-align: right;">
      <div class="info-label">Invoice Details</div>
      <div class="info-value">Invoice #: ${invoiceNumber || 'INV-' + Date.now()}</div>
      <div class="info-value">Date: ${new Date().toLocaleDateString()}</div>
      <div class="info-value">Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Hours</th>
        <th>Rate</th>
        <th class="amount">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${previewData.entries.map(entry => `
        <tr>
          <td>${new Date(entry.start_time).toLocaleDateString()}</td>
          <td>${entry.notes || 'Time worked'}</td>
          <td>${(entry.duration_minutes / 60).toFixed(2)}</td>
          <td>$${previewData.client!.hourly_rate.toFixed(2)}/hr</td>
          <td class="amount">$${entry.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td>${previewData.totalHours.toFixed(2)} hrs</td>
        <td></td>
        <td class="amount">$${previewData.totalAmount.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>Generated by TradeTimer on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
    `

    // Create a blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${previewData.client.name.replace(/\s+/g, '-')}-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert('Invoice downloaded! Open the HTML file in your browser and print to PDF.')
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-green" />
            <h2 className="text-2xl font-bold text-brand-charcoal">Generate Invoice</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-brand-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Invoice Settings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                Client *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                Invoice Number (optional)
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Auto-generated if empty"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              disabled={loading || !selectedClientId || !startDate || !endDate}
              className="bg-brand-green hover:bg-brand-green/90 text-white"
            >
              Preview Invoice
            </Button>

            {previewData && (
              <Button
                onClick={handleGeneratePDF}
                className="bg-brand-green hover:bg-brand-green/90 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>

          {/* Preview */}
          {previewData && previewData.client && (
            <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-bold text-brand-charcoal mb-4">Invoice Preview</h3>

              <div className="bg-white rounded-lg p-6 mb-4">
                <div className="flex justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bill To:</p>
                    <p className="font-bold text-lg">{previewData.client.name}</p>
                    {previewData.client.email && <p className="text-sm text-gray-600">{previewData.client.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice #: {invoiceNumber || 'INV-' + Date.now()}</p>
                    <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 text-sm">Date</th>
                      <th className="text-left py-2 text-sm">Description</th>
                      <th className="text-right py-2 text-sm">Hours</th>
                      <th className="text-right py-2 text-sm">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100">
                        <td className="py-2 text-sm">{new Date(entry.start_time).toLocaleDateString()}</td>
                        <td className="py-2 text-sm">{entry.notes || 'Time worked'}</td>
                        <td className="py-2 text-sm text-right">{(entry.duration_minutes / 60).toFixed(2)}</td>
                        <td className="py-2 text-sm text-right">${entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-gray-300 font-bold">
                      <td colSpan={2} className="py-3">TOTAL</td>
                      <td className="py-3 text-right">{previewData.totalHours.toFixed(2)} hrs</td>
                      <td className="py-3 text-right text-lg text-brand-green">${previewData.totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm text-gray-600 text-center">
                {previewData.entries.length} time {previewData.entries.length === 1 ? 'entry' : 'entries'} •
                {previewData.totalHours.toFixed(2)} total hours
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
