"use client"

import { Home, Calendar, BarChart2, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface HeaderProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="hidden md:flex">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              CM
            </div>
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Cabañas Montaña
          </h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className={`flex items-center gap-2 rounded-full px-4 ${activeTab === "bookings" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <Home className="h-4 w-4" />
            <span>Reservas</span>
          </Button>
          <Button
            variant={activeTab === "calendar" ? "default" : "ghost"}
            className={`flex items-center gap-2 rounded-full px-4 ${activeTab === "calendar" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            <Calendar className="h-4 w-4" />
            <span>Disponibilidad</span>
          </Button>
          <Button
            variant={activeTab === "summary" ? "default" : "ghost"}
            className={`flex items-center gap-2 rounded-full px-4 ${activeTab === "summary" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Resumen</span>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-background border-primary/20 hover:bg-primary/5"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center gap-2 mb-8 mt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  CM
                </div>
                <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Cabañas Montaña
                </h2>
              </div>
              <nav className="flex flex-col gap-4">
                <Button
                  variant={activeTab === "bookings" ? "default" : "ghost"}
                  className={`flex items-center justify-start gap-2 w-full rounded-full ${activeTab === "bookings" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
                  onClick={() => handleTabChange("bookings")}
                >
                  <Home className="h-4 w-4" />
                  <span>Reservas</span>
                </Button>
                <Button
                  variant={activeTab === "calendar" ? "default" : "ghost"}
                  className={`flex items-center justify-start gap-2 w-full rounded-full ${activeTab === "calendar" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
                  onClick={() => handleTabChange("calendar")}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Disponibilidad</span>
                </Button>
                <Button
                  variant={activeTab === "summary" ? "default" : "ghost"}
                  className={`flex items-center justify-start gap-2 w-full rounded-full ${activeTab === "summary" ? "bg-primary/90 hover:bg-primary/100" : ""}`}
                  onClick={() => handleTabChange("summary")}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Resumen</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

