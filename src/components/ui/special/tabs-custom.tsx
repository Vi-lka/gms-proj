"use client"

import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';
import { ScrollArea } from '../scroll-area';
  
type Props = {
  defaultValue?: string
  tabs: {
    value: string,
    title: string,
    content: React.ReactNode,
  }[],
};

export default function TabsCustom(props: Props) {
  const defaultValue = props.defaultValue ? props.defaultValue : props.tabs[0]?.value
  const defaultTab = props.tabs.find(tab => tab.value === defaultValue)

  const [selectedTab, setSelectedTab] = useState(defaultTab ?? props.tabs[0]);

  useEffect(() => {
    setSelectedTab(defaultTab ?? props.tabs[0])
  }, [defaultTab, props.tabs])

  if (props.tabs.length === 0) return null;

  return (
    <Tabs 
      defaultValue={defaultValue}
      value={selectedTab?.value}
      className="w-full flex flex-col flex-grow"
    >
      <TabsList className='w-full h-fit bg-primary/10 shadow-inner rounded-xl'>
        <ScrollArea type="always" className='w-full' classNameViewport='w-full max-h-20'>
          <div className='w-full flex flex-wrap sm:justify-around justify-center gap-2'>
            {props.tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className='py-2 lg:px-6 md:text-sm text-xs rounded-lg'
                onClick={() => setSelectedTab(tab)}
              >
                {tab.title}
              </TabsTrigger>
            ))}
          </div>
        </ScrollArea>
      </TabsList>
      {selectedTab 
        ? (
            <TabsContent 
                value={selectedTab.value} 
                className='mt-6 w-full flex flex-col flex-grow'
                forceMount
            >
                {selectedTab.content}
            </TabsContent>
        )
        : (
          <div className='mt-6 w-full h-full flex flex-col flex-grow text-9xl text-center'>
            🗿
          </div>
        ) 
      }
    </Tabs>
  )
}
