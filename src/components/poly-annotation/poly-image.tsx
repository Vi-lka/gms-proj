"use client"

import React from 'react'
import { useImage } from 'react-konva-utils';
import { Image as KonvaImage } from 'react-konva';
import { usePolyStore } from './store/poly-store-provider';

export default function PolyImage({
  url
}: {
  url: string,
}) {
  const [image] = useImage(url);

  const { width: stageW, height: stageH } = usePolyStore((state) => state.stageConfig)
  const setImageConfig = usePolyStore((state) => state.setImageConfig)
  const [imgNaturalSize, setImgNaturalSize] = React.useState({ width: 0, height: 0 })

  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (image) {
      setImgNaturalSize({ width: image.width, height: image.height })
    }
  }, [image])

  React.useEffect(() => {
    if (image) {
      /* after the image is loaded, you can get it's dimensions */
      const imgNaturalWidth = imgNaturalSize.width;
      const imgNaturalHeight = imgNaturalSize.height;

      /* 
        calculate the horizontal and vertical ratio of the 
        image dimensions versus the canvas dimensions
      */
      const hRatio = stageW / imgNaturalWidth;
      const vRatio = stageH / imgNaturalHeight;

      const naturalHRatio = 1200 / imgNaturalWidth;
      const naturalVRatio = 600 / imgNaturalHeight;

      /*
        to replicate the CSS Object-Fit "contain" behavior,
        choose the smaller of the horizontal and vertical 
        ratios

        if you want a "cover" behavior, use Math.max to 
        choose the larger of the two ratios instead
      */
      const ratio = Math.min(hRatio, vRatio);
      const naturalRatio = Math.min(naturalHRatio, naturalVRatio);
      /* 
        scale the image to fit the canvas 
      */
      image.width = imgNaturalWidth * ratio;
      image.height = imgNaturalHeight * ratio;

      /* 
        calculate the offsets so the image is centered inside
        the canvas
      */
      const xOffset = (stageW - image.width) / 2;
      const yOffset = (stageH - image.height) / 2;

      setImageConfig({
        size: {width: image.width, height: image.height},
        pos: {x: xOffset, y: yOffset},
        ratio,
        naturalSize: imgNaturalSize,
        naturalRatio
      })

      setPos({
        x: xOffset,
        y: yOffset
      });
    }
  }, [image, stageH, stageW, setImageConfig, imgNaturalSize.width, imgNaturalSize.height, imgNaturalSize]);

  return (
    <KonvaImage x={pos.x} y={pos.y} image={image} />
  )
}
