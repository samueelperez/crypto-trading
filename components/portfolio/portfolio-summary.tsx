"use client"

import { useEffect, useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, RefreshCcwIcon, WifiOffIcon, Settings } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePortfolio } from "@/hooks/use-portfolio"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cryptoPriceService } from "@/lib/api/crypto-price-service"
import { TrendingDown, TrendingUp } from "lucide-react"

export function PortfolioSummary() {
  const {
    summary,
    isLoading,
    error,
    lastUpdated,
    isOffline,
    retryCount,
    refreshPrices,
    refreshData,
    portfolioWithPrices,
    initialCapital,
  } = usePortfolio()

  // Estados para los precios actualizados y el resumen recalculado
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false)
  const [updatedSummary, setUpdatedSummary] = useState<{
    totalValue: number
    totalProfitLoss: number
    profitLossPercentage: number
    lastUpdatedFromAPI: Date
  } | null>(null)
  
  // Estados para almacenar las horas formateadas (ahora en el cliente)
  const [formattedLastUpdate, setFormattedLastUpdate] = useState<string>("")
  const [formattedAPIUpdate, setFormattedAPIUpdate] = useState<string>("")

  // Calcular la ganancia o pérdida real
  const actualProfitLoss = summary ? summary.totalValue - initialCapital : 0
  const actualProfitLossPercentage = initialCapital > 0 ? (actualProfitLoss / initialCapital) * 100 : 0
  const isProfit = actualProfitLoss >= 0

  // Efecto para formatear las horas solo en el cliente
  useEffect(() => {
    // Formatear lastUpdated
    if (lastUpdated) {
      setFormattedLastUpdate(lastUpdated.toLocaleTimeString())
    }
    
    // Formatear API update time si existe
    if (updatedSummary?.lastUpdatedFromAPI) {
      setFormattedAPIUpdate(updatedSummary.lastUpdatedFromAPI.toLocaleTimeString())
    }
  }, [lastUpdated, updatedSummary])

  // Efecto para actualizar los precios y recalcular el resumen
  useEffect(() => {
    if (!portfolioWithPrices || portfolioWithPrices.length === 0 || isOffline) return

    const updatePricesAndSummary = async () => {
      setIsUpdatingPrices(true)

      try {
        let newTotalValue = 0
        const symbols = portfolioWithPrices.flatMap((exchange) => exchange.assets.map((asset) => asset.symbol))

        // Get all prices at once to reduce API calls
        const prices = await cryptoPriceService.getPrices(symbols)

        // Calculate new total value
        for (const exchange of portfolioWithPrices) {
          for (const asset of exchange.assets) {
            try {
              const price = prices[asset.symbol]?.current_price

              if (price) {
                const assetValue = Number(asset.quantity) * price
                newTotalValue += assetValue
              } else {
                // Use existing value as fallback
                newTotalValue += asset.currentValue
              }
            } catch (assetError) {
              console.error(`Error processing asset ${asset.symbol}:`, assetError)
              newTotalValue += asset.currentValue
            }
          }
        }

        // Si tenemos un resumen y un valor total recalculado
        if (summary && newTotalValue > 0) {
          // Calcular el nuevo profit/loss
          const newProfitLoss = newTotalValue - initialCapital
          const newProfitLossPercentage =
            initialCapital > 0 ? (newProfitLoss / initialCapital) * 100 : 0

          // Actualizar el resumen
          const apiUpdateTime = new Date()
          setUpdatedSummary({
            totalValue: newTotalValue,
            totalProfitLoss: newProfitLoss,
            profitLossPercentage: newProfitLossPercentage,
            lastUpdatedFromAPI: apiUpdateTime,
          })
          
          // Actualizar el formato de la hora inmediatamente
          setFormattedAPIUpdate(apiUpdateTime.toLocaleTimeString())
        }
      } catch (error) {
        console.error("Error updating prices:", error)
      } finally {
        setIsUpdatingPrices(false)
      }
    }

    // Actualizar precios al montar el componente
    updatePricesAndSummary()

    // Actualizar precios cada 2 minutos
    const interval = setInterval(updatePricesAndSummary, 120000)

    return () => clearInterval(interval)
  }, [portfolioWithPrices, summary, isOffline, initialCapital])

  // Renderizar estado de error
  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center">
            {isOffline && <WifiOffIcon className="mr-2 h-5 w-5" />}
            Error Loading Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button variant="outline" onClick={refreshData} disabled={isOffline}>
              <RefreshCcwIcon className="mr-2 h-4 w-4" />
              Retry Loading Data
            </Button>

            {isOffline && (
              <p className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:ml-2 flex items-center">
                <WifiOffIcon className="mr-1 h-4 w-4" />
                You are currently offline
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Resumen del Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <span className="text-xs text-muted-foreground">
                Actualizado {summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleTimeString() : ""}
              </span>
            </div>
            <div className="text-3xl font-bold">
              {summary ? formatCurrency(summary.totalValue) : "$0.00"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inversión Inicial</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(initialCapital)}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link href="/dashboard/initial-capital" className="text-primary hover:underline flex items-center">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar en Dashboard
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Ganancia/Pérdida</span>
              <div className={`text-xl font-semibold flex items-center ${isProfit ? "text-positive" : "text-negative"}`}>
                {isProfit 
                  ? <TrendingUp className="mr-1 h-4 w-4" />
                  : <TrendingDown className="mr-1 h-4 w-4" />
                }
                {formatCurrency(Math.abs(actualProfitLoss))}
              </div>
              <div className={`text-xs ${isProfit ? "text-positive" : "text-negative"}`}>
                {isProfit ? "+" : "-"}{formatPercentage(Math.abs(actualProfitLossPercentage))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

