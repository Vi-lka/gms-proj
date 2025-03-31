import React from 'react'

export default function MainMapLayout({
  children,
  modalMain
}: Readonly<{ 
  children: React.ReactNode,
  modalMain: React.ReactNode
 }>) {
  return (
    <div className='overflow-hidden'>
      {children}
      {modalMain}
    </div>
  )
}
