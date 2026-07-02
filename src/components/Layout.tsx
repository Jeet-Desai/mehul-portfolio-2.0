import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* faint ledger rules behind the whole page — the Ledger house background */}
      <div aria-hidden className="ledger-lines pointer-events-none fixed inset-0 z-0" />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
