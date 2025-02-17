"use client"

import { type Stage as StageT } from 'konva/lib/Stage';
import type { Polygon, StageConfig, ImageConfig } from '../types';
import { createStore } from 'zustand';
import { temporal } from 'zundo';
import { deepEqual } from 'fast-equals';
import { throttle } from 'throttle-debounce'

export type PolyAnnotationState = {
  fieldId: string | null;
  stageConfig: StageConfig,
  stageRef: StageT | null,
  imageConfig: ImageConfig,
  polygons: Polygon[];
  tooltip: string | undefined;
  isMouseOverPoint: boolean;
  selectedPolygon: Polygon | null;
  activePolygonIndex: number;
  isAddible: boolean;
  askAcceptPos: boolean;
  openSheet: boolean;
  editPolygonIndex: number | null;
  editPolygonAction: "update" | "delete" | "move" | null
};

export type PolyAnnotationTemporalState = {
  polygons: Polygon[];
  isAddible: boolean;
  askAcceptPos: boolean;
  activePolygonIndex: number;
}

export type PolyAnnotationStoreActions = {
  setFieldId: (
    next:
      | PolyAnnotationStore['fieldId']
      | ((current: PolyAnnotationStore['fieldId']) => PolyAnnotationStore['fieldId']),
  ) => void,
  setStageConfig: (
    next:
      | PolyAnnotationStore['stageConfig']
      | ((current: PolyAnnotationStore['stageConfig']) => PolyAnnotationStore['stageConfig']),
  ) => void,
  setStageRef: (
    next:
      | PolyAnnotationStore['stageRef']
      | ((current: PolyAnnotationStore['stageRef']) => PolyAnnotationStore['stageRef']),
  ) => void,
  setImageConfig: (
    next:
      | PolyAnnotationStore['imageConfig']
      | ((current: PolyAnnotationStore['imageConfig']) => PolyAnnotationStore['imageConfig']),
  ) => void,
  setPolygons: (
    next:
      | PolyAnnotationStore['polygons']
      | ((current: PolyAnnotationStore['polygons']) => PolyAnnotationStore['polygons']),
  ) => void,
  deletePolygon: (index: number) => void,
  setTooltip: (
    next:
      | PolyAnnotationStore['tooltip']
      | ((current: PolyAnnotationStore['tooltip']) => PolyAnnotationStore['tooltip']),
  ) => void,
  setIsMouseOverPoint: (
    next:
      | PolyAnnotationStore['isMouseOverPoint']
      | ((current: PolyAnnotationStore['isMouseOverPoint']) => PolyAnnotationStore['isMouseOverPoint']),
  ) => void,
  setActivePolygonIndex: (
    next:
      | PolyAnnotationStore['activePolygonIndex']
      | ((current: PolyAnnotationStore['activePolygonIndex']) => PolyAnnotationStore['activePolygonIndex']),
  ) => void,
  setIsAddible: (
    next:
      | PolyAnnotationStore['isAddible']
      | ((current: PolyAnnotationStore['isAddible']) => PolyAnnotationStore['isAddible']),
  ) => void,
  setAskAcceptPos: (
    next:
      | PolyAnnotationStore['askAcceptPos']
      | ((current: PolyAnnotationStore['askAcceptPos']) => PolyAnnotationStore['askAcceptPos']),
  ) => void,
  setOpenSheet: (
    next:
      | PolyAnnotationStore['openSheet']
      | ((current: PolyAnnotationStore['openSheet']) => PolyAnnotationStore['openSheet']),
  ) => void,
  setEditPolygonIndex: (
    next:
      | PolyAnnotationStore['editPolygonIndex']
      | ((current: PolyAnnotationStore['editPolygonIndex']) => PolyAnnotationStore['editPolygonIndex']),
  ) => void,
  setEditPolygonAction: (
    next:
      | PolyAnnotationStore['editPolygonAction']
      | ((current: PolyAnnotationStore['editPolygonAction']) => PolyAnnotationStore['editPolygonAction']),
  ) => void,
  setGlobalState: (
    next:
      | PolyAnnotationStore
      | ((current: PolyAnnotationStore) => PolyAnnotationStore),
  ) => void,
}

export type PolyAnnotationStore = PolyAnnotationState & PolyAnnotationStoreActions

export const defaultInitState: PolyAnnotationState = {
  fieldId: null,
  stageConfig: {
    width: 0,
    height: 0,
    scale: 1,
    x: 0,
    y: 0
  },
  stageRef: null,
  imageConfig: {
    size: {width: 0, height: 0},
    pos: {x: 0, y: 0},
    ratio: 1,
    naturalSize: {width: 0, height: 0},
    naturalRatio: 1,
  },
  polygons: [],
  tooltip: undefined,
  isMouseOverPoint: false,
  activePolygonIndex: -1,
  selectedPolygon: null,
  isAddible: false,
  askAcceptPos: false,
  openSheet: false,
  editPolygonIndex: null,
  editPolygonAction: null,
}

export const createPolyStore = (
  initState: PolyAnnotationState = defaultInitState,
) => {
  return createStore<PolyAnnotationStore>()(temporal(
    (set) => ({
      ...initState,
      setFieldId: (next) => {
        set((state) => ({
          fieldId: typeof next === 'function' ? next(state.fieldId) : next,
        }))
      },
      setStageConfig: (next) => {
        set((state) => ({
          stageConfig: typeof next === 'function' ? next(state.stageConfig) : next,
        }))
      },
      setStageRef: (next) => {
        set((state) => ({
          stageRef: typeof next === 'function' ? next(state.stageRef) : next,
        }))
      },
      setImageConfig: (next) => {
        set((state) => ({
          imageConfig: typeof next === 'function' ? next(state.imageConfig) : next,
        }))
      },
      setPolygons: (next) => {
        set((state) => ({
          polygons: typeof next === 'function' ? next(state.polygons) : next,
        }))
      },
      deletePolygon: (index) => {
        set((state) => {
          const newArray = state.polygons.filter((_, indx) => indx !== index);
          return {
            polygons: newArray
          }
        })
      },
      setTooltip: (next) => {
        set((state) => ({
          tooltip: typeof next === 'function' ? next(state.tooltip) : next,
        }))
      },
      setIsMouseOverPoint: (next) => {
        set((state) => ({
          isMouseOverPoint: typeof next === 'function' ? next(state.isMouseOverPoint) : next,
        }))
      },
      setActivePolygonIndex: (next) => {
        set((state) => ({
          activePolygonIndex: typeof next === 'function' ? next(state.activePolygonIndex) : next,
        }))
      },
      setIsAddible: (next) => {
        set((state) => ({
          isAddible: typeof next === 'function' ? next(state.isAddible) : next,
        }))
      },
      setAskAcceptPos: (next) => {
        set((state) => ({
          askAcceptPos: typeof next === 'function' ? next(state.askAcceptPos) : next,
        }))
      },
      setOpenSheet: (next) => {
        set((state) => ({
          openSheet: typeof next === 'function' ? next(state.openSheet) : next,
        }))
      },
      setEditPolygonIndex: (next) => {
        set((state) => ({
          editPolygonIndex: typeof next === 'function' ? next(state.editPolygonIndex) : next,
        }))
      },
      setEditPolygonAction: (next) => {
        set((state) => ({
          editPolygonAction: typeof next === 'function' ? next(state.editPolygonAction) : next,
        }))
      },
      setGlobalState: (next) => {
        set((state) => (typeof next === 'function' ? next(state) : next))
      }
    }),
    {
      // Only fields in return of "partialize" will be in history
      partialize: (state): PolyAnnotationTemporalState => {
        const { 
          polygons, 
          activePolygonIndex,
          isAddible, 
          askAcceptPos
        } = state;
        return { 
          polygons, 
          activePolygonIndex, 
          isAddible, 
          askAcceptPos
        };
      },
      equality: (pastState, currentState) => {
        return deepEqual(pastState, currentState)
      },
      handleSet: (handleSet) => throttle(500, handleSet, { noTrailing: true }),
      limit: 100,
    }
  ))
}