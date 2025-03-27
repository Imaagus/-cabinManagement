import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with thousand separators
 * @param value - The number to format
 * @param includeSymbol - Whether to include the $ symbol
 * @returns Formatted string
 */
export function formatCurrency(value: number, includeSymbol = true): string {
  // Format with thousand separators using dots
  const formattedValue = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

  return includeSymbol ? `$${formattedValue}` : formattedValue
}

