import React from 'react'
import Polygon from './polygon'
import { type KonvaEventObject } from 'konva/lib/Node'
import { Group, Layer } from 'react-konva'
import useRelatedRatio from './store/useRelatedRatio'
import { usePolyStore, useTemporalStore } from './store/poly-store-provider'

export default function PolyItemsEdit() {

  const polygons = usePolyStore((state) => state.polygons)
  const imagePos = usePolyStore((state) => state.imageConfig.pos)
  const isAddible = usePolyStore((state) => state.isAddible)
  const activePolygonIndex = usePolyStore((state) => state.activePolygonIndex)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const setPolygons = usePolyStore((state) => state.setPolygons)
  const setIsMouseOverPoint = usePolyStore((state) => state.setIsMouseOverPoint)
  const setEditPolygonIndex = usePolyStore((state) => state.setEditPolygonIndex)

  const { pause, resume, clear } = useTemporalStore((state) => state)

  const relatedRatio = useRelatedRatio();

  const handlePointDragMove = React.useCallback(
    (e: KonvaEventObject<DragEvent>, polygonKey: number) => {

      if ((polygonKey !== activePolygonIndex) && (editPolygonIndex === null)) return;

      const copy = [...polygons];
      let polygon = copy[polygonKey];

      if (!polygon) return;

      const { isFinished } = polygon;
      if (!isFinished) {
        // prevent drag:
        e.target.stopDrag();
        return;
      }
      const stage = e.target.getStage();
      const index = e.target.index - 1;
      const pos = [e.target.x(), e.target.y()];
      if (stage) {
        if ((pos[0]!) < 0) pos[0] = 0;
        if ((pos[1]!) < 0) pos[1] = 0;
        if ((pos[0]!) > stage.width()) pos[0] = stage.width();
        if ((pos[1]!) > stage.height()) pos[1] = stage.height();
      }

      const { points } = polygon;
      const newPoints = [...points.slice(0, index), pos, ...points.slice(index + 1)];
      const flattenedPoints = newPoints.reduce((a, b) => a.concat(b), []);
      polygon = {
        ...polygon,
        points: newPoints,
        flattenedPoints,
      };
      copy[polygonKey] = polygon;
      setPolygons(copy);
    },
    [activePolygonIndex, editPolygonIndex, polygons, setPolygons]
  );

  const handlePointDragEnd = React.useCallback(
    (e: KonvaEventObject<DragEvent>, polygonKey: number) => {
      if ((polygonKey !== activePolygonIndex) && (editPolygonIndex === null)) return;


      const index = e.target.index - 1;
      const pos = [e.target.x(), e.target.y()];
      const copy = [...polygons];
      let polygon = copy[polygonKey];

      if (!polygon) return;

      const { points } = polygon;
      const newPoints = [...points.slice(0, index), pos, ...points.slice(index + 1)];
      const flattenedPoints = newPoints.reduce((a, b) => a.concat(b), []);
      polygon = {
        ...polygon,
        points: newPoints,
        flattenedPoints,
      };
      copy[polygonKey] = polygon;
      pause()
      setPolygons(copy)
      resume()
    },
    [activePolygonIndex, editPolygonIndex, polygons, pause, setPolygons, resume]
  );

  const handleMouseOverStartPoint = React.useCallback(
    (e: KonvaEventObject<MouseEvent>, polygonKey: number) => {

      if ((polygonKey !== activePolygonIndex) && (editPolygonIndex === null)) return;


      const polygon = polygons[polygonKey];

      if (!polygon) return;

      const { points, isFinished } = polygon;
      if (isFinished || points.length < 3) return;

      e.target.scale({ x: 2, y: 2 });
      setIsMouseOverPoint(true);
    },
    [activePolygonIndex, editPolygonIndex, polygons, setIsMouseOverPoint]
  );

  const handleMouseOutStartPoint = React.useCallback(
    (e: KonvaEventObject<MouseEvent>, polygonKey: number) => {
      if ((polygonKey !== activePolygonIndex) && (editPolygonIndex === null)) return;

      e.target.scale({ x: 1, y: 1 });
      setIsMouseOverPoint(false);
    }, 
    [activePolygonIndex, editPolygonIndex, setIsMouseOverPoint]
  );

  const handleGroupDragEnd = React.useCallback(
    (e: KonvaEventObject<DragEvent>, polygonKey: number) => {
      if ((polygonKey !== activePolygonIndex) && (editPolygonIndex === null)) return;

      //drag end listens other children circles' drag end event
      //...for this 'name' attr is added
      const copy = [...polygons];
      let polygon = copy[polygonKey];

      if (!polygon) return;

      const { points } = polygon;
      if (e.target.name() === 'polygon') {
        const result: number[][] = [];
        const copyPoints = [...points];
        copyPoints.forEach((point) =>
          result.push([(point[0]!) + e.target.x(), (point[1]!) + e.target.y()]),
        );
        polygon = {
          ...polygon,
          points: result,
          flattenedPoints: result.reduce((a, b) => a.concat(b), []),
        };
        copy[polygonKey] = polygon;
        setPolygons(copy)
        e.target.position({ x: 0, y: 0 }); //reset group position
      }
    },
    [activePolygonIndex, editPolygonIndex, polygons, setPolygons]
  );

  const onPolygonClick = (index: number) => {
    if (isAddible || index === editPolygonIndex) return;
    setEditPolygonIndex(index)
    clear()
  }

  return (
    <Layer>
      <Group
        scale={{
          x: relatedRatio,
          y: relatedRatio
        }}
        x={imagePos.x}
        y={imagePos.y}
      >
        {polygons?.map((polygon, index) => (
          <Polygon
            key={polygon.id}
            isFinished={polygon.isFinished}
            points={polygon.points}
            flattenedPoints={polygon.flattenedPoints}
            licensedArea={polygon.licensedArea}
            active={index === activePolygonIndex}
            editable={index === editPolygonIndex}
            handlePointDragMove={(e) => handlePointDragMove(e, index)}
            handlePointDragEnd={(e) => handlePointDragEnd(e, index)}
            handleMouseOverStartPoint={(e) => handleMouseOverStartPoint(e, index)}
            handleMouseOutStartPoint={(e) => handleMouseOutStartPoint(e, index)}
            handleGroupDragEnd={(e) => handleGroupDragEnd(e, index)}
            onClick={() => onPolygonClick(index)}
          />
        ))}
      </Group>
    </Layer>
  )
}
