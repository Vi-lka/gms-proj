'use client';

import { usePolyStore } from './poly-store-provider';

export default function useRelatedRatio() {
    const naturalRatio = usePolyStore((state) => state.imageConfig.naturalRatio)
    const ratio = usePolyStore((state) => state.imageConfig.ratio)

    return (1/naturalRatio)*ratio
}