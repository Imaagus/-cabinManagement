'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useBookings, Booking } from '../hooks/useBookings'
import { DateRange } from 'react-day-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export default function CabinManagement() {
  const { bookings, isLoading, error, addBooking, getTotalRevenue, getBookingInfo, isDateBooked } = useBookings()
  const [selectedCabin, setSelectedCabin] = useState('1')
  const [tenantName, setTenantName] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [payment, setPayment] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (dateRange?.from && dateRange?.to) {
      // Check if the selected date range is available
      const start = new Date(dateRange.from)
      const end = new Date(dateRange.to)
      for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
        if (isDateBooked(day, selectedCabin)) {
          alert(`Cabin ${selectedCabin} is already booked on ${format(day, 'PP')}`)
          return
        }
      }

      addBooking({
        tenantName,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
        payment: parseFloat(payment)
      })
      // Reset form
      setTenantName('')
      setDateRange(undefined)
      setPayment('')
    }
  }

  const DayContent = ({ date }: { date: Date }) => {
    const bookingsOnDate = getBookingInfo(date)
    const isBooked = bookingsOnDate.length > 0

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className={`w-full h-full ${isBooked ? 'bg-red-500 text-white' : ''}`}>
            {date.getDate()}
          </div>
        </PopoverTrigger>
        {isBooked && (
          <PopoverContent className="w-fit p-0">
            <div className="p-2">
              <h3 className="font-semibold mb-2">Bookings for {format(date, 'MMM d, yyyy')}</h3>
              {bookingsOnDate.map((booking: Booking, index: number) => (
                <div key={index} className="text-sm mb-1">
                  <span className="font-medium">Cabin {booking.cabinId}:</span> {booking.tenantName}
                </div>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    )
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">Coastal Cabin Management</h1>
      
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">New Booking</TabsTrigger>
          <TabsTrigger value="calendar">Availability</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>New Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cabin">Cabin</Label>
                    <Select onValueChange={setSelectedCabin} defaultValue={selectedCabin}>
                      <SelectTrigger id="cabin">
                        <SelectValue placeholder="Select a cabin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Cabin 1</SelectItem>
                        <SelectItem value="2">Cabin 2</SelectItem>
                        <SelectItem value="3">Cabin 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">Tenant Name</Label>
                    <Input
                      id="tenantName"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Booking Dates</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-md border"
                    disabled={(date) => isDateBooked(date, selectedCabin)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment">Payment</Label>
                  <Input
                    id="payment"
                    type="number"
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Add Booking</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Cabin Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={new Date()}
                components={{
                  DayContent: DayContent
                }}
                className="rounded-md border"
                numberOfMonths={2}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.map((booking: Booking) => (
                  <div key={booking.id} className="p-4 border rounded">
                    <p><strong>Cabin:</strong> {booking.cabinId}</p>
                    <p><strong>Tenant:</strong> {booking.tenantName}</p>
                    <p><strong>Arrival:</strong> {format(new Date(booking.dateFrom!), 'PP')}</p>
                    <p><strong>Departure:</strong> {format(new Date(booking.dateTo!), 'PP')}</p>
                    <p><strong>Payment:</strong> ${booking.payment.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 space-y-2">
                <h3 className="text-xl font-semibold">Total Revenue per Cabin</h3>
                <p><strong>Cabin 1:</strong> ${getTotalRevenue('1').toFixed(2)}</p>
                <p><strong>Cabin 2:</strong> ${getTotalRevenue('2').toFixed(2)}</p>
                <p><strong>Cabin 3:</strong> ${getTotalRevenue('3').toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

