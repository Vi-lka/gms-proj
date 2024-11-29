"use server";

import { revalidateTag as nextRevalidateTag } from 'next/cache';

const revalidateTag = (tag: string) => {
    nextRevalidateTag(tag);
};

export default revalidateTag;