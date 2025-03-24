import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart } from "@/components/ui/charts"

export function WalletOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Wallet Activity</CardTitle>
          <CardDescription>Transaction volume over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <LineChart
            data={[
              { name: "1 Mar", value: 1200 },
              { name: "5 Mar", value: 1800 },
              { name: "10 Mar", value: 1600 },
              { name: "15 Mar", value: 2200 },
              { name: "20 Mar", value: 1800 },
              { name: "25 Mar", value: 2400 },
              { name: "30 Mar", value: 2800 },
            ]}
          />
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Network Distribution</CardTitle>
          <CardDescription>Transaction volume by blockchain network</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart
            data={[
              { name: "Solana", value: 45 },
              { name: "Ethereum", value: 30 },
              { name: "Polygon", value: 15 },
              { name: "Avalanche", value: 10 },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

