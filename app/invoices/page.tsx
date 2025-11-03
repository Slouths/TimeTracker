'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation } from '@/components/layout/navigation'
import { toast } from '@/lib/toast'
import { InvoiceActionsMenu } from '@/components/invoices/invoice-actions-menu'
// Simple currency formatter
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
import { Download, Filter, X } from 'lucide-react'

interface Invoice {
  id: string
  invoice_number: string
  client_name: string
  created_at: string
  total_amount: number
  status: 'unpaid' | 'paid' | 'overdue'
  payment_date?: string
  due_date: string
}

export default function InvoicesPage() {
  const [user, setUser] = useState<any>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all')
  const [clientFilter, setClientFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadInvoices()
      loadClients()
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [invoices, statusFilter, clientFilter, dateFrom, dateTo, sortBy, sortOrder])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function loadInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate status based on dates
      const invoicesWithStatus = data.map(invoice => {
        let status: 'unpaid' | 'paid' | 'overdue' = 'unpaid'

        if (invoice.payment_date) {
          status = 'paid'
        } else if (invoice.due_date && new Date(invoice.due_date) < new Date()) {
          status = 'overdue'
        }

        return {
          ...invoice,
          status
        }
      })

      setInvoices(invoicesWithStatus)
    } catch (error: any) {
      toast.error('Failed to load invoices: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadClients() {
    const { data } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name')

    if (data) setClients(data)
  }

  function applyFilters() {
    let filtered = [...invoices]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter)
    }

    // Client filter
    if (clientFilter) {
      filtered = filtered.filter(inv =>
        inv.client_name.toLowerCase().includes(clientFilter.toLowerCase())
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.created_at) >= new Date(dateFrom))
    }
    if (dateTo) {
      filtered = filtered.filter(inv => new Date(inv.created_at) <= new Date(dateTo))
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'amount':
          comparison = a.total_amount - b.total_amount
          break
        case 'status':
          const statusOrder = { paid: 0, unpaid: 1, overdue: 2 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredInvoices(filtered)
  }

  function clearFilters() {
    setStatusFilter('all')
    setClientFilter('')
    setDateFrom('')
    setDateTo('')
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unpaid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation user={user} />
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-600">Loading invoices...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950">Invoices</h1>
          <p className="text-slate-600 mt-2">Manage and track all your invoices</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-950">Filters</h2>
            {(statusFilter !== 'all' || clientFilter || dateFrom || dateTo) && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-accent-primary hover:text-accent-hover flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="all">All Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Client
              </label>
              <input
                type="text"
                placeholder="Search client..."
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
              />
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">
                {invoices.length === 0 ? 'No invoices yet' : 'No invoices match your filters'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-950">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {invoice.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-950">
                        {formatCurrency(invoice.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <InvoiceActionsMenu
                          invoice={invoice}
                          onUpdate={loadInvoices}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredInvoices.length > 0 && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-slate-950 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Total Invoices</p>
                <p className="text-2xl font-bold text-slate-950">{filteredInvoices.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-slate-950">
                  {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Outstanding</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(filteredInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.total_amount, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
