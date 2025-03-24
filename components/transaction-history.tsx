import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react"

export function TransactionHistory() {
  const transactions = [
    {
      id: "TX123456",
      type: "deposit",
      amount: "500.00",
      currency: "USDC",
      network: "Solana",
      status: "completed",
      date: "2023-03-20T14:30:00Z",
    },
    {
      id: "TX123457",
      type: "withdrawal",
      amount: "120.50",
      currency: "USDC",
      network: "Ethereum",
      status: "completed",
      date: "2023-03-19T10:15:00Z",
    },
    {
      id: "TX123458",
      type: "transfer",
      amount: "75.00",
      currency: "USDC",
      network: "Solana",
      status: "pending",
      date: "2023-03-18T16:45:00Z",
    },
    {
      id: "TX123459",
      type: "deposit",
      amount: "300.00",
      currency: "USDC",
      network: "Polygon",
      status: "completed",
      date: "2023-03-17T09:20:00Z",
    },
    {
      id: "TX123460",
      type: "withdrawal",
      amount: "50.00",
      currency: "USDC",
      network: "Solana",
      status: "failed",
      date: "2023-03-16T13:10:00Z",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>View your recent transaction activity</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {transaction.type === "deposit" ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    ) : transaction.type === "withdrawal" ? (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {transaction.amount} {transaction.currency}
                </TableCell>
                <TableCell>{transaction.network}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === "completed"
                        ? "default"
                        : transaction.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

