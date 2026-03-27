import type { GeocoderService } from 'cesium'
import { Cartesian3, GeocodeType, Rectangle } from 'cesium'
import { tianDiTuKey } from 'utils'

interface TianDiTuGeocoderResult {
  status: string
  result: {
    location: {
      lon: number
      lat: number
    }
    level: string
    formatted_address: string
  }
}

interface TianDiTuSearchResult {
  count: string
  pois?: Array<{
    name: string
    lonlat: string
    address: string
  }>
  area?: Array<{
    name: string
    lonlat: string
    bound: string
  }>
}

export class TianDiTuGeocoderService implements GeocoderService {
  credit = undefined
  private key: string

  constructor(key: string = tianDiTuKey) {
    this.key = key
  }

  async geocode(input: string, type: GeocodeType = GeocodeType.SEARCH): Promise<GeocoderService.Result[]> {
    if (type === GeocodeType.AUTOCOMPLETE) {
      return []
    }

    const results: GeocoderService.Result[] = []

    // 先尝试搜索接口获取多个结果
    const searchResults = await this.search(input)
    if (searchResults.length > 0) {
      return searchResults
    }

    // 回退到地理编码接口
    const geocodeResult = await this.geocodeAddress(input)
    if (geocodeResult) {
      results.push(geocodeResult)
    }

    return results
  }

  private async search(keyword: string): Promise<GeocoderService.Result[]> {
    const params = {
      keyWord: keyword,
      level: 18,
      mapBound: '-180,-90,180,90',
      queryType: 7,
      count: 10,
      start: 0,
    }

    const url = `https://api.tianditu.gov.cn/v2/search?postStr=${encodeURIComponent(JSON.stringify(params))}&type=query&tk=${this.key}`

    try {
      const response = await fetch(url)
      const data: TianDiTuSearchResult = await response.json()

      const results: GeocoderService.Result[] = []

      if (data.pois) {
        for (const poi of data.pois) {
          const [lon, lat] = poi.lonlat.split(',').map(Number)
          results.push({
            displayName: `${poi.name}${poi.address ? ` - ${poi.address}` : ''}`,
            destination: Cartesian3.fromDegrees(lon, lat),
          })
        }
      }

      if (data.area) {
        for (const area of data.area) {
          const [lon, lat] = area.lonlat.split(',').map(Number)
          if (area.bound) {
            const bounds = area.bound.split(',').map(Number)
            results.push({
              displayName: area.name,
              destination: Rectangle.fromDegrees(bounds[0], bounds[1], bounds[2], bounds[3]),
            })
          }
          else {
            results.push({
              displayName: area.name,
              destination: Cartesian3.fromDegrees(lon, lat),
            })
          }
        }
      }

      return results
    }
    catch {
      return []
    }
  }

  private async geocodeAddress(keyword: string): Promise<GeocoderService.Result | null> {
    const ds = JSON.stringify({ keyWord: keyword })
    const url = `https://api.tianditu.gov.cn/geocoder?ds=${encodeURIComponent(ds)}&tk=${this.key}`

    try {
      const response = await fetch(url)
      const data: TianDiTuGeocoderResult = await response.json()

      if (data.status !== '0' || !data.result?.location) {
        return null
      }

      const { lon, lat } = data.result.location
      return {
        displayName: data.result.formatted_address || keyword,
        destination: Cartesian3.fromDegrees(lon, lat),
      }
    }
    catch {
      return null
    }
  }
}
