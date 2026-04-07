"use client"
import React from 'react'
import { ReportByDepartment } from '@/components/reports/ReportByDepartment'

export default function page() {
  return (
    <div className='animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out'>
      <ReportByDepartment />
    </div>
  )
}