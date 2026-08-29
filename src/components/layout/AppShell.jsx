import React from 'react'
import Sidebar from './Sidebar.jsx'
import MobileNav from './MobileNav.jsx'
import TopBar from './TopBar.jsx'

export default function AppShell({ title, children }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
