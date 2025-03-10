import React from 'react'
import Polygon from './polygon'
import { Group, Layer } from 'react-konva'
import useRelatedRatio from './store/useRelatedRatio'
import { usePolyStore } from './store/poly-store-provider'
import type { Polygon as PolygonT, PolygonStyleProps } from './types'
export default function PolyItems({
  polygonStyle,
  onPolygonClick,
  onPolygonHover,
  disabled
}: {
  polygonStyle?: PolygonStyleProps,
  onPolygonClick?: (polygon: PolygonT) => void,
  onPolygonHover?: (polygon: PolygonT) => void,
  disabled?: boolean
}) {

  const polygons = usePolyStore((state) => state.polygons)
  const imagePos = usePolyStore((state) => state.imageConfig.pos)
  const hoverPolygonIndex = usePolyStore((state) => state.hoverPolygonIndex)
  const setHoverPolygonIndex = usePolyStore((state) => state.setHoverPolygonIndex)

  const relatedRatio = useRelatedRatio();

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
        {polygons?.map((polygon, indx) => (
          <Polygon
            key={polygon.id}
            isFinished={polygon.isFinished}
            points={polygon.points}
            flattenedPoints={polygon.flattenedPoints}
            licensedArea={polygon.licensedArea}
            hovered={hoverPolygonIndex === indx}
            polygonStyle={polygonStyle}
            onClick={() => !disabled && onPolygonClick?.(polygon)}
            handleGroupMouseOver={() => {
              if (!disabled) {
                setHoverPolygonIndex(indx)
                onPolygonHover?.(polygon)
              }
            }}
            handleGroupMouseOut={() => {
              if (!disabled) {
                setHoverPolygonIndex(null)
              }}
            }
          />
        ))}
      </Group>
    </Layer>
  )
}

