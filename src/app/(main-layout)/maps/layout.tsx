import React from 'react'

export default function MapsLayout({
  children,
  modal
}: Readonly<{ 
  children: React.ReactNode,
  modal: React.ReactNode
 }>) {
  return (
    <div>
      {children}
      {modal}
    </div>
  )
}
