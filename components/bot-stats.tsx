import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LineChart } from "@/components/ui/charts"

export function BotStats() {
  const commandUsage = [
    { command: "/start", count: 127, growth: "+12%" },
    { command: "/balance", count: 432, growth: "+8%" },
    { command: "/send", count: 215, growth: "+15%" },
    { command: "/withdraw", count: 98, growth: "+5%" },
    { command: "/deposit", count: 156, growth: "+10%" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Command Usage</CardTitle>
          <CardDescription>Most frequently used bot commands</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Command</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commandUsage.map((item) => (
                <TableRow key={item.command}>
                  <TableCell className="font-mono">{item.command}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {item.growth}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>Bot usage over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              { name: "Mon", value: 42 },
              { name: "Tue", value: 38 },
              { name: "Wed", value: 45 },
              { name: "Thu", value: 53 },
              { name: "Fri", value: 49 },
              { name: "Sat", value: 35 },
              { name: "Sun", value: 31 },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  )
}

