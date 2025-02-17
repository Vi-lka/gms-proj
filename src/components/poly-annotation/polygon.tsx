import React from 'react'
import { type PolygonStyleProps, type PolygonProps } from './types'
import { type KonvaEventObject } from 'konva/lib/Node';
import { Circle, Group, Line } from 'react-konva';
import { usePolyStore } from './store/poly-store-provider';

export const defaultPolygonStyle: PolygonStyleProps = {
  vertexRadius: 4,
  lineWidth: 2,
  lineColor: 'rgb(10,10,10,0.9)',
  fillColor: 'rgb(10,10,10,0.15)',
  vertexColor: 'hsl(47.9,95.8%,53.1%)',
  vertexStrokeWidth: 1,
  selectedColor: 'rgb(250,204,21,0.5)',
}

export default function Polygon({
  points,
  flattenedPoints,
  isFinished,
  licensedArea,
  active,
  editable,
  polygonStyle = defaultPolygonStyle,
  handlePointDragEnd,
  handleGroupDragEnd,
  handleMouseOverStartPoint,
  handleMouseOutStartPoint,
  handlePointDragMove,
  onClick,
}: PolygonProps) {
  const { vertexRadius, lineWidth, lineColor, fillColor, vertexColor, vertexStrokeWidth, selectedColor } = polygonStyle;
  const isAddible = usePolyStore((state) => state.isAddible)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const editPolygonAction = usePolyStore((state) => state.editPolygonAction)
  const setTooltip = usePolyStore((state) => state.setTooltip)

  // const stageRef = useStore((state) => state.stageRef)
  // const [minMaxX, setMinMaxX] = React.useState([0, 0]); //min and max in x axis
  // const [minMaxY, setMinMaxY] = React.useState([0, 0]); //min and max in y axis

  const groupMouseOver = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (isAddible || !isFinished || !stage) return;
    stage.container().style.cursor = 'pointer';
    if (editPolygonIndex === null) {
      setTooltip(licensedArea?.name)
    }
  };

  const groupMouseOut = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (isAddible || !stage) return;
    stage.container().style.cursor = 'default';
    if (editPolygonIndex === null) {
      setTooltip(undefined)
    }
  };

  // const handleGroupDragStart = () => {
  //   const arrX = points.map((p) => p[0]) as number[];
  //   const arrY = points.map((p) => p[1]) as number[];
  //   setMinMaxX(minMax(arrX));
  //   setMinMaxY(minMax(arrY));
  // };

  // const groupDragBoundFunc = (pos: Vector2d) => {
  //   let { x, y } = pos;
  //   if (!stageRef) return { x, y };
  //   const sw = stageRef.width();
  //   const sh = stageRef.height();
  //   if ((minMaxY[0]!) + y < 0) y = -1 * (minMaxY[0]!);
  //   if ((minMaxX[0]!) + x < 0) x = -1 * (minMaxX[0]!);
  //   if ((minMaxY[1]!) + y > sh) y = sh - (minMaxY[1]!);
  //   if ((minMaxX[1]!) + x > sw) x = sw - (minMaxX[1]!);
  //   return { x, y };
  // };

  // const vertexDragBoundFunc = (pos: Vector2d) => {
  //   let { x, y } = pos;
  //   if (!stageRef) return { x, y };
  //   const sw = stageRef.width();
  //   const sh = stageRef.height();
  //   if (x > sw) x = sw;
  //   if (x < 0) x = 0;
  //   if (y > sh) y = sh;
  //   if (y < 0) y = 0;
  //   return { x, y };
  // };
  
  const showPoints = !!active || (editable && editPolygonAction === "move")
  const isGroupDraggable = !!(isFinished && active) || (editable && editPolygonAction === "move")
  const isCircleDraggable = !!active || (editable && editPolygonAction === "move")

  return (
    <Group
      name="polygon"
      draggable={isGroupDraggable}
      // onDragStart={handleGroupDragStart}
      onDragEnd={handleGroupDragEnd}
      // dragBoundFunc={groupDragBoundFunc}
      onMouseOver={groupMouseOver}
      onMouseOut={groupMouseOut}
      onClick={(e) => {
        setTooltip(undefined)
        onClick?.(e)
      }}
    >
      <Line
        name="line"
        points={flattenedPoints}
        stroke={lineColor}
        strokeWidth={lineWidth}
        closed={isFinished}
        fill={!!editable ? selectedColor : fillColor}
      />
      {showPoints && points.map((point, index) => {
        const x = point[0];
        const y = point[1];
        const startPointAttr =
          index === 0
            ? {
                onMouseOver: handleMouseOverStartPoint,
                onMouseOut: handleMouseOutStartPoint,
              }
            : null;
        return (
          <Circle
            name="vertex"
            key={index}
            x={x}
            y={y}
            radius={vertexRadius}
            fill={vertexColor}
            stroke={lineColor}
            strokeWidth={vertexStrokeWidth}
            draggable={isCircleDraggable}
            onDragMove={handlePointDragMove}
            onDragEnd={handlePointDragEnd}
            // dragBoundFunc={vertexDragBoundFunc}
            {...startPointAttr}
          />
        );
      })}
    </Group>
  )
}
