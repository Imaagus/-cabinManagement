"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Calendar, User, Home, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  bookingData: {
    cabinId: string
    tenantName: string
    dateFrom: Date | null
    dateTo: Date | null
    payment: number
  } | null
}

export function SuccessModal({ isOpen, onClose, bookingData }: SuccessModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!bookingData) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <DialogTitle className="text-center text-xl">¡Reserva Confirmada!</DialogTitle>
          <DialogDescription className="text-center">Su reserva ha sido registrada exitosamente</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium">Cabaña:</span>
              <span>{bookingData.cabinId}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Inquilino:</span>
              <span>{bookingData.tenantName}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">Fechas:</span>
              {bookingData.dateFrom && bookingData.dateTo ? (
                <span>
                  {format(bookingData.dateFrom, "dd MMM", { locale: es })} -{" "}
                  {format(bookingData.dateTo, "dd MMM yyyy", { locale: es })}
                </span>
              ) : (
                <span>Fechas no especificadas</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-medium">Pago:</span>
              <span>{formatCurrency(bookingData.payment)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onClose} className="rounded-full px-8">
            Aceptar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

