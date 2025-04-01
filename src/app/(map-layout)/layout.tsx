import React from 'react'

export default function MainMapLayout({
  children,
}: Readonly<{ 
  children: React.ReactNode,
 }>) {
  return (
    <div className='overflow-hidden'>
      {children}
    </div>
  )
}
