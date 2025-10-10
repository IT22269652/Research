import React from 'react'
import DashboardProv from './provider'

function DashboardLayout({ children }) {
  return (
    <div>
        <DashboardProv>
             {children}
        </DashboardProv>
    </div>
  )
}

export default DashboardLayout