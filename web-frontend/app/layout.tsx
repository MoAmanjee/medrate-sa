import './globals.css'

export const metadata = {
  title: 'RateTheDoctor - Find Verified Doctors in South Africa',
  description: 'Search for verified doctors, read reviews, and book appointments. All doctors are HPCSA verified.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
