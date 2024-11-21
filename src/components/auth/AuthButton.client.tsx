"use client";

import React from 'react';
import { useSession } from "next-auth/react"
import { Button } from '../ui/button';
import { signIn, signOut } from '~/server/auth/helpers';

export default function AuthButtonClient() {
  const session = useSession()

  return session.data?.user ? (
    <Button
      onClick={async () => {
        await signOut();
      }}
    >
      Выйти
    </Button>
  ) : (
    <Button
      onClick={async () => {
        await signIn();
      }}
    >
      Войти
    </Button>
  )
}
