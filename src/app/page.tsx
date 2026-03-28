import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Finanza</h1>
          <p className="text-muted-foreground mt-2">Persönliche Finanzverwaltung</p>
        </div>

        <div className="grid gap-3">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <Link href="/dashboard">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Monatsübersicht & Saldo-Berechnung</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <Link href="/transactions">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">CSV importieren & Ausgaben verwalten</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <Link href="/subscriptions">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Abonnements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Fixkosten & Verträge verwalten</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </main>
  );
}
