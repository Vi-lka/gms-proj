"use client"

import React from 'react';
import { type MapDataExtend } from '~/server/db/schema';
import { Image as KonvaImage } from 'react-konva';
import { useImage } from 'react-konva-utils';
import { useAtomValue, useSetAtom } from 'jotai';
import { mainImageAtom, mapContainerDimensions } from '~/lib/atoms/main';
import { toast } from 'sonner';

export const MapMainImage = React.memo(function MapMainImage({
  data
}: {
  data: MapDataExtend | null,
}) {
  const imageUrl = React.useMemo(() => data?.svgUrl ?? '/images/Russia-Map.svg', [data?.svgUrl])

  const [image, status] = useImage(imageUrl);

  const { width: windowW, height: windowH } = useAtomValue(mapContainerDimensions);

  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const setMainImage = useSetAtom(mainImageAtom)

  React.useEffect(() => {
    if (image) {
      /* after the image is loaded, you can get it's dimensions */
      const imgNaturalWidth = image.width;
      const imgNaturalHeight = image.height;

      /* 
        calculate the horizontal and vertical ratio of the 
        image dimensions versus the canvas dimensions
      */
      const hRatio = windowW / imgNaturalWidth;
      const vRatio = windowH / imgNaturalHeight;

      /*
        to replicate the CSS Object-Fit "contain" behavior,
        choose the smaller of the horizontal and vertical 
        ratios

        if you want a "cover" behavior, use Math.max to 
        choose the larger of the two ratios instead
      */
      const ratio = Math.min(hRatio, vRatio);
      /* 
        scale the image to fit the canvas 
      */
      image.width = imgNaturalWidth * ratio;
      image.height = imgNaturalHeight * ratio;

      /* 
        calculate the offsets so the image is centered inside
        the canvas
      */
      const xOffset = (windowW - image.width) / 2;
      const yOffset = (windowH - image.height) / 2;

      setMainImage({
        size: {width: image.width, height: image.height},
        pos: {x: xOffset, y: yOffset}
      })

      setPos({
        x: xOffset,
        y: yOffset
      });
    }
  }, [windowW, windowH, image, setMainImage]);

  React.useEffect(() => {
    if (status === "failed") toast.error("Не удалось загрузить изображение")
  }, [status])

  return (
    <KonvaImage x={pos.x} y={pos.y} image={image} />
  )
})
