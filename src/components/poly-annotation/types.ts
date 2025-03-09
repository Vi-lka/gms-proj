import { type KonvaEventObject } from "konva/lib/Node";

export interface Polygon {
  id: string;
  points: number[][];
  flattenedPoints: number[];
  isFinished: boolean;
  licensedArea: {
    id: string;
    name: string;
  } | null;
};

export type PolygonStyleProps = {
  lineColor?: string;
  lineWidth?: number;
  fillColor?: string;
  vertexColor?: string;
  vertexRadius?: number;
  vertexStrokeWidth?: number;
  selectedColor?: string;
};
export type PolygonInputProps = {
  id?: string;
  label?: string;
  points: number[][];
};
export type PolygonProps = {
  points: number[][];
  flattenedPoints: number[] | undefined;
  isFinished: boolean;
  licensedArea: {
    id: string;
    name: string;
  } | null;
  active?: boolean;
  editable?: boolean;
  polygonStyle?: PolygonStyleProps;
  handlePointDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  handlePointDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  handleGroupDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  handleMouseOverStartPoint?: (e: KonvaEventObject<MouseEvent>) => void;
  handleMouseOutStartPoint?: (e: KonvaEventObject<MouseEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void
  onMouseEnter?: (e: KonvaEventObject<MouseEvent>) => void
};

export interface ContainerConfig {
  width: number,
  height: number,
  x: number,
  y: number
}

export interface StageConfig extends ContainerConfig {
  scale: number,
}

export interface ImageConfig {
  size: {width: number, height: number},
  pos: {x: number, y: number},
  ratio: number,
  naturalSize: {width: number, height: number},
  naturalRatio: number,
}

export type DefaultEditDataT = {
  id: string;
  fieldId: string;
  fieldName: string;
  companyName: string;
  imageUrl: string;
  polygons: {
    id: string;
    points: number[][];
    flattenedPoints: number[];
    isFinished: boolean;
    licensedArea: {
        id: string;
        name: string;
    };
  }[];
}