import React from 'react'

export default function MainLayout({
  children,
  modal
}: Readonly<{ 
  children: React.ReactNode,
  modal: React.ReactNode
 }>) {
  return (
    <>
      {modal}
      {children}
    </>
  )
}
