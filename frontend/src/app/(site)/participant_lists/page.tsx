"use client";

import ParticipantList from '@/components/ParticipantList'
import React from 'react'

export default function page() {
  return (
    <div className='animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out'>
      <ParticipantList />
    </div>
  )
}
