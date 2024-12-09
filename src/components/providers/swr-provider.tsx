'use client'

import React from 'react';
import { SWRConfig } from 'swr'
import axios from "axios"

// const fetcher = (url: string) => fetch(url).then((res) => res.json())

const fetcher = (url: string) =>
    axios
      .get(url)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      .then((res) => res.data);

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SWRConfig
        value={{
            fetcher
          }}
        >
            {children}
        </SWRConfig>
    )
};