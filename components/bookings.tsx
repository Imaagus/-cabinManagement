"use client"

import type React from "react"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarRange, Home, User, DollarSign, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, formatCurrency } from "@/lib/utils"

type BookingFormProps = {
  cabinNames: string[]
  onSubmit: (booking: {
    cabinId: string
    tenantName: string
    dateFrom: Date
    dateTo: Date
    payment: number
  }) => Promise<void>
  isDateBooked: (date: Date, cabinId: string) => boolean
}

export function BookingForm({ cabinNames, onSubmit, isDateBooked }: BookingFormProps) {
  const [selectedCabin, setSelectedCabin] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [payment, setPayment] = useState("")
  const [formattedPayment, setFormattedPayment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format payment as user types
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const numericValue = e.target.value.replace(/\D/g, "")

    // Store raw numeric value
    setPayment(numericValue)

    // Format with thousand separators for display
    if (numericValue) {
      const number = Number.parseInt(numericValue, 10)
      setFormattedPayment(formatCurrency(number, false))
    } else {
      setFormattedPayment("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateRange?.from && dateRange?.to && selectedCabin && tenantName && payment) {
      setIsSubmitting(true)
      try {
        await onSubmit({
          cabinId: selectedCabin,
          tenantName,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          payment: Number.parseFloat(payment),
        })
        // Reset form
        setSelectedCabin("")
        setTenantName("")
        setDateRange(undefined)
        setPayment("")
        setFormattedPayment("")
      } catch (error) {
        console.error("Error submitting booking:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cabin" className="text-base">
              Cabaña
            </Label>
            <Select onValueChange={setSelectedCabin} value={selectedCabin}>
              <SelectTrigger id="cabin" className="h-11 rounded-full border-primary/20 bg-background">
                <div className="flex items-center gap-2">
                  {selectedCabin ? <Home className="h-4 w-4 text-muted-foreground" /> : null}
                  <SelectValue placeholder="Seleccione una cabaña" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {cabinNames.map((cabinName) => (
                  <SelectItem key={cabinName} value={cabinName}>
                    {cabinName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenantName" className="text-base">
              Nombre de inquilino
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="pl-9 h-11 rounded-full border-primary/20 bg-background"
                placeholder="Nombre completo"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className="text-base">
              Pago
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="payment"
                type="text"
                value={formattedPayment}
                onChange={handlePaymentChange}
                className="pl-9 h-11 rounded-full border-primary/20 bg-background"
                placeholder="Monto del pago"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-base">Fecha de reserva</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 rounded-full border-primary/20 bg-background",
                    !dateRange && "text-muted-foreground",
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd/MM/yyyy", { locale: es })} -{" "}
                        {format(dateRange.to, "dd/MM/yyyy", { locale: es })}
                      </>
                    ) : (
                      format(dateRange.from, "dd/MM/yyyy", { locale: es })
                    )
                  ) : (
                    <span>Seleccione un rango de fechas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => (selectedCabin ? isDateBooked(date, selectedCabin) : false)}
                  locale={es}
                  className="rounded-md"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex flex-col">
          <Label className="mb-2 text-base">Vista previa</Label>
          <Card className="flex-1 border-dashed border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              {selectedCabin || tenantName || dateRange || payment ? (
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Detalles de la reserva</h3>

                  {selectedCabin && (
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Cabaña: <strong>{selectedCabin}</strong>
                      </span>
                    </div>
                  )}

                  {tenantName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Inquilino: <strong>{tenantName}</strong>
                      </span>
                    </div>
                  )}

                  {dateRange?.from && (
                    <div className="flex items-center gap-2">
                      <CalendarRange className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Fechas:{" "}
                        <strong>
                          {format(dateRange.from, "dd MMM", { locale: es })}
                          {dateRange.to && ` - ${format(dateRange.to, "dd MMM yyyy", { locale: es })}`}
                        </strong>
                      </span>
                    </div>
                  )}

                  {payment && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Pago: <strong>{formatCurrency(Number(payment))}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                  <CalendarRange className="h-8 w-8 mb-2" />
                  <p>Complete el formulario para ver la vista previa de la reserva</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full md:w-auto md:min-w-[200px] rounded-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
        disabled={!selectedCabin || !tenantName || !dateRange?.from || !dateRange?.to || !payment || isSubmitting}
      >
        {isSubmitting ? (
          <>Procesando...</>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Confirmar reserva
          </>
        )}
      </Button>
    </form>
  )
}

