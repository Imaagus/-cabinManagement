import CabinManagement from "@/components/cabin-management";

import { Suspense } from 'react'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CabinManagement />
    </Suspense>
  )
}

