'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'
import { MoreVertical, Check, X, Download, Trash2 } from 'lucide-react'
import { Menu } from '@headlessui/react'

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  total_amount: number
  status: 'unpaid' | 'paid' | 'overdue'
  payment_date?: string
}

interface InvoiceActionsMenuProps {
  invoice: Invoice
  onUpdate: () => void
}

export function InvoiceActionsMenu({ invoice, onUpdate }: InvoiceActionsMenuProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [isProcessing, setIsProcessing] = useState(false)

  const supabase = createClient()

  async function handleMarkAsPaid() {
    setShowPaymentDialog(true)
  }

  async function confirmMarkAsPaid() {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          payment_date: paymentDate,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (error) throw error

      toast.success('Invoice marked as paid')
      setShowPaymentDialog(false)
      onUpdate()
    } catch (error: any) {
      toast.error('Failed to update invoice: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleMarkAsUnpaid() {
    if (!confirm('Mark this invoice as unpaid?')) return

    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          payment_date: null,
          payment_method: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoice.id)

      if (error) throw error

      toast.success('Invoice marked as unpaid')
      onUpdate()
    } catch (error: any) {
      toast.error('Failed to update invoice: ' + error.message)
    }
  }

  async function handleDownload() {
    try {
      toast.info('Generating PDF...')

      // Get invoice data from database
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoice.id)
        .single()

      if (invoiceError) throw invoiceError

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from('invoice_line_items')
        .select('*')
        .eq('invoice_id', invoice.id)

      if (lineItemsError) throw lineItemsError

      // Get user's subscription status
      const { data: { user } } = await supabase.auth.getUser()
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('user_id', user?.id)
        .single()

      const userPlan = subscription?.plan || 'free'

      // Generate PDF using existing utility
      const { generateInvoicePDF } = await import('@/lib/pdf-utils')

      const pdfData = {
        ...invoiceData,
        line_items: lineItems
      }

      await generateInvoicePDF(pdfData, userPlan)

      toast.success('PDF downloaded successfully')
    } catch (error: any) {
      toast.error('Failed to download invoice: ' + error.message)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete invoice ${invoice.invoice_number}? This cannot be undone.`)) return

    try {
      // Delete line items first
      await supabase
        .from('invoice_line_items')
        .delete()
        .eq('invoice_id', invoice.id)

      // Delete invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id)

      if (error) throw error

      toast.success('Invoice deleted successfully')
      onUpdate()
    } catch (error: any) {
      toast.error('Failed to delete invoice: ' + error.message)
    }
  }

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors">
          <MoreVertical className="h-5 w-5 text-slate-600" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            {invoice.status !== 'paid' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleMarkAsPaid}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700`}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                    Mark as Paid
                  </button>
                )}
              </Menu.Item>
            )}

            {invoice.status === 'paid' && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleMarkAsUnpaid}
                    className={`${
                      active ? 'bg-gray-100' : ''
                    } flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700`}
                  >
                    <X className="h-4 w-4 text-yellow-600" />
                    Mark as Unpaid
                  </button>
                )}
              </Menu.Item>
            )}

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleDownload}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700`}
                >
                  <Download className="h-4 w-4 text-blue-600" />
                  Download PDF
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleDelete}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Menu>

      {/* Payment Dialog */}
      {showPaymentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-slate-950 mb-4">Mark Invoice as Paid</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentDialog(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkAsPaid}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-hover disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
