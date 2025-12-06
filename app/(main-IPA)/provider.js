import { SidebarProvider, SidebarTrigger } from '@/app/components/ui/sidebar'
import React from 'react'
import {AppSidebar} from './_components/AppSidebar'

function DashboardProvider({ children }) {
  return (
     <SidebarProvider>
        <AppSidebar />
    <div>
        <SidebarTrigger />
        {children}
        </div>
    </SidebarProvider>
  )
}

export default DashboardProvider