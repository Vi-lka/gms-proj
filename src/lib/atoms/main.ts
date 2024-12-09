"use client"

import { atom } from "jotai";
import { type Stage as StageT } from 'konva/lib/Stage';

export const stageAtom = atom({
    width: 0,
    height: 0,
    scale: 1,
    x: 0,
    y: 0
});

export const stageRefAtom = atom<StageT | null>(null);

export const mainImageAtom = atom({
    size: {width: 0, height: 0},
    pos: {x: 0, y: 0},
})

export const mapContainerDimensions = atom({
    width: 0,
    height: 0,
    x: 0,
    y: 0
});