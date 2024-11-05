import EconomicDashboard from '@/components/dashboard'

export const metadata = {
  title: 'Brazilian Economic Dashboard',
  description: 'Explore Brazilian economic data from 1994 to 2022',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <EconomicDashboard />
    </main>
  )
}
