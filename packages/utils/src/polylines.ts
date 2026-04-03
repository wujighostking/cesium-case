import type { Viewer } from 'cesium'
import { Cartesian3, Color } from 'cesium'

export function drawRouteLine(viewer: Viewer, coordinates: [number, number, number][]) {
  return viewer.entities.add({
    polyline: {
      positions: Cartesian3.fromDegreesArrayHeights(coordinates.flat()),
      material: new Color(1, 0, 0, 0.5),
      width: 50,
    },
  })
}
