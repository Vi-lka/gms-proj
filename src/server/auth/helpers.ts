"use server";

import { signIn as authSignIn, signOut as authSignOut } from '.';

export async function signIn() {
    await authSignIn();
};

export async function signOut() {
    await authSignOut();
};