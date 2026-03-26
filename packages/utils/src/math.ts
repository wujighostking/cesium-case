import { Math } from 'cesium'

export function radianToDegree(radian: number) {
  return Math.toDegrees(radian)
}

export function degreeToRadian(degree: number) {
  return Math.toRadians(degree)
}

/**
 * @description 判断数字是否是负数
 */
export function isNegative(n: number) {
  return n < 0
}
