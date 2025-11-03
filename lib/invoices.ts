import { SupabaseClient } from '@supabase/supabase-js'

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  invoice_number: string
  amount: number
  status: 'unpaid' | 'paid' | 'overdue'
  issued_date: string
  due_date: string | null
  paid_date: string | null
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceWithClient extends Invoice {
  clients: {
    name: string
    email: string | null
  }
}

export type InvoiceInput = {
  client_id: string
  invoice_number: string
  amount: number
  issued_date: string
  due_date?: string
  notes?: string
}

/**
 * Get all invoices for a user
 */
export async function getInvoices(
  supabase: SupabaseClient,
  userId: string
): Promise<InvoiceWithClient[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select(
      `
      *,
      clients (
        name,
        email
      )
    `
    )
    .eq('user_id', userId)
    .order('issued_date', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return (data as InvoiceWithClient[]) || []
}

/**
 * Create a new invoice
 */
export async function createInvoice(
  supabase: SupabaseClient,
  userId: string,
  invoice: InvoiceInput
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id: userId,
      ...invoice,
      status: 'unpaid',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating invoice:', error)
    return null
  }

  return data
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  supabase: SupabaseClient,
  invoiceId: string,
  status: 'unpaid' | 'paid' | 'overdue',
  paidDate?: string,
  paymentMethod?: string
): Promise<Invoice | null> {
  const updates: any = { status }

  if (status === 'paid') {
    updates.paid_date = paidDate || new Date().toISOString().split('T')[0]
    if (paymentMethod) {
      updates.payment_method = paymentMethod
    }
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating invoice status:', error)
    return null
  }

  return data
}

/**
 * Delete an invoice
 */
export async function deleteInvoice(
  supabase: SupabaseClient,
  invoiceId: string
): Promise<boolean> {
  const { error } = await supabase.from('invoices').delete().eq('id', invoiceId)

  if (error) {
    console.error('Error deleting invoice:', error)
    return false
  }

  return true
}

/**
 * Generate next invoice number
 */
export async function generateInvoiceNumber(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error || !data || data.length === 0) {
    return `INV-${new Date().getFullYear()}-0001`
  }

  const lastInvoice = data[0]
  const lastNumber = lastInvoice.invoice_number

  // Extract number from invoice number (e.g., "INV-2025-0001" -> 1)
  const match = lastNumber.match(/(\d+)$/)
  if (match) {
    const nextNumber = parseInt(match[1]) + 1
    const year = new Date().getFullYear()
    return `INV-${year}-${nextNumber.toString().padStart(4, '0')}`
  }

  return `INV-${new Date().getFullYear()}-0001`
}

/**
 * Check for overdue invoices and update their status
 */
export async function updateOverdueInvoices(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('user_id', userId)
    .eq('status', 'unpaid')
    .lt('due_date', today)
}
