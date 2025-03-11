"use server"

import "server-only";
import React from 'react'
import { Tabs, TabsContent, TabsList } from '../../tabs';
import { ScrollArea } from "../../scroll-area";
import TabsServerTrigger from "./tabs-server-trigger";
import { searchParamsTabsLoader } from "~/lib/validations/search-params";
import { type SearchParams } from "~/lib/types";

type Props = {
  defaultValue?: string
  tabs: {
    value: string,
    title: string,
    content: React.ReactNode,
  }[],
  searchParams: Promise<SearchParams>
  pageUrl: string
};

export default async function TabsServer(props: Props) {
  const { tab } = await searchParamsTabsLoader(props.searchParams)

  const defaultValue = props.defaultValue ? props.defaultValue : props.tabs[0]?.value
  const defaultTab = props.tabs.find(tab => tab.value === defaultValue)

  const selectedTab = props.tabs.find(item => item.value === tab)
  
  if (props.tabs.length === 0) return null;

  if (!defaultTab) throw new Error("No default tab");

  return (
    <Tabs 
      defaultValue={defaultValue}
      value={tab ?? defaultValue}
      className="w-full flex flex-col flex-grow"
    >
      <TabsList className='w-full h-fit bg-primary/10 shadow-inner rounded-xl'>
        <ScrollArea type="always" className='w-full' classNameViewport='w-full max-h-20'>
          <div className='w-full flex flex-wrap sm:justify-around justify-center px-4 gap-x-4 gap-y-2'>
            {props.tabs.map((tab) => (
              <TabsServerTrigger 
                key={tab.value} 
                value={tab.value} 
                title={tab.title} 
                defaultValue={props.defaultValue}
                pageUrl={props.pageUrl}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsList>
      {selectedTab 
        ? (
            <TabsContent 
              value={selectedTab.value} 
              className='w-full flex flex-col flex-grow'
              forceMount
            >
              {selectedTab.content}
            </TabsContent>
        )
        : (
          <TabsContent 
            value={defaultTab.value} 
            className='w-full flex flex-col flex-grow'
            forceMount
          >
            {defaultTab.content}
          </TabsContent>
        ) 
      }
    </Tabs>
  )
}
