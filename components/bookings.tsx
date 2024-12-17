import React, { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'

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
  const [selectedCabin, setSelectedCabin] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [payment, setPayment] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (dateRange?.from && dateRange?.to && selectedCabin && tenantName && payment) {
      await onSubmit({
        cabinId: selectedCabin,
        tenantName,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        payment: parseFloat(payment)
      })
      // Reset form
      setSelectedCabin('')
      setTenantName('')
      setDateRange(undefined)
      setPayment('')
    }
  }

  return (
<form onSubmit={handleSubmit} className="space-y-4">
  <div className="flex gap-8">
    <div className="w-1/2 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cabin">Cabaña</Label>
        <Select onValueChange={setSelectedCabin} value={selectedCabin}>
          <SelectTrigger id="cabin">
            <SelectValue placeholder="Seleccione una cabaña" />
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
        <Label htmlFor="tenantName">Nombre de inquilino</Label>
        <Input
          id="tenantName"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="payment">Pago</Label>
        <Input
          id="payment"
          type="number"
          value={payment}
          onChange={(e) => setPayment(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">Agregar reserva</Button>
    </div>

    <div className="m-auto">
      <div className="space-y-2">
        <Label>Fecha de reserva</Label>
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={setDateRange}
          numberOfMonths={2}
          className="rounded-md border"
          disabled={(date) =>
            selectedCabin ? isDateBooked(date, selectedCabin) : false
          }
        />
      </div>
    </div>
  </div>
</form>

  )
}

