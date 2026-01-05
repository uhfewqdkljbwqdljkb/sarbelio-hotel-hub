import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CHART_OF_ACCOUNTS, INVOICES, TRANSACTIONS, REVENUE_DATA } from '@/data/financialsMock';
import { DollarSign, FileText, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const accountTypeColors = {
  ASSET: 'bg-blue-100 text-blue-700',
  LIABILITY: 'bg-red-100 text-red-700',
  EQUITY: 'bg-purple-100 text-purple-700',
  REVENUE: 'bg-green-100 text-green-700',
  EXPENSE: 'bg-orange-100 text-orange-700',
};

const invoiceStatusColors = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-700',
};

export default function FinancialsPage() {
  const [accounts] = useState(CHART_OF_ACCOUNTS);
  const [invoices] = useState(INVOICES);
  const [transactions] = useState(TRANSACTIONS);

  const totalRevenue = accounts.filter(a => a.type === 'REVENUE').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === 'EXPENSE').reduce((sum, a) => sum + a.balance, 0);
  const pendingReceivables = invoices.filter(i => i.type === 'RECEIVABLE' && i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0);
  const overduePayables = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100"><DollarSign className="h-5 w-5 text-orange-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">€{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100"><ArrowUpRight className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Pending AR</p>
              <p className="text-2xl font-bold">€{pendingReceivables.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100"><ArrowDownRight className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue AP</p>
              <p className="text-2xl font-bold">€{overduePayables.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `€${v/1000}k`} />
              <Tooltip formatter={(value: number) => [`€${value.toLocaleString()}`, '']} />
              <Legend />
              <Area type="monotone" dataKey="rooms" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Rooms" />
              <Area type="monotone" dataKey="restaurant" stackId="1" stroke="#10b981" fill="#6ee7b7" name="Restaurant" />
              <Area type="monotone" dataKey="services" stackId="1" stroke="#8b5cf6" fill="#c4b5fd" name="Services" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card rounded-xl border">
        <Tabs defaultValue="accounts">
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-14">
              <TabsTrigger value="accounts" className="data-[state=active]:bg-primary-100"><DollarSign className="h-4 w-4 mr-2" />Chart of Accounts</TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-primary-100"><FileText className="h-4 w-4 mr-2" />Invoices</TabsTrigger>
              <TabsTrigger value="transactions" className="data-[state=active]:bg-primary-100"><TrendingUp className="h-4 w-4 mr-2" />Transactions</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="accounts" className="mt-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Account Name</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-sm">{account.code}</td>
                      <td className="px-4 py-3 font-medium">{account.name}</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${accountTypeColors[account.type]}`}>{account.type}</span></td>
                      <td className="px-4 py-3 text-right font-medium">€{account.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="invoices" className="mt-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer/Vendor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Due Date</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-center"><Badge variant={invoice.type === 'RECEIVABLE' ? 'default' : 'secondary'}>{invoice.type === 'RECEIVABLE' ? 'AR' : 'AP'}</Badge></td>
                      <td className="px-4 py-3">{invoice.customerOrVendor}</td>
                      <td className="px-4 py-3 text-right font-medium">€{invoice.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{invoice.dueDate}</td>
                      <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${invoiceStatusColors[invoice.status]}`}>{invoice.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Account</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                      <td className="px-4 py-3 font-medium">{tx.description}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.accountName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'CREDIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tx.type}</span>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'}€{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
