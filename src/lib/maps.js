// Tiện ích tạo link Google Maps

const CITY = 'Hồ Chí Minh'

export function mapsSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function mapsDirectionsUrl(destination, travelmode = 'driving') {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=${travelmode}`
}

export function isMapsLink(url = '') {
  return /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google)/i.test(url)
}

function placeQuery(place) {
  const parts = [place.name, place.address, place.district, CITY].filter(Boolean)
  return parts.join(', ')
}

/** Link mở quán trên Google Maps: ưu tiên link đã lưu, không có thì tìm theo tên + quận */
export function placeMapUrl(place) {
  if (place.map_link && place.map_link.trim()) return place.map_link.trim()
  return mapsSearchUrl(placeQuery(place))
}

/** Link chỉ đường tới quán (Google Maps tự lấy vị trí hiện tại làm điểm xuất phát) */
export function placeDirectionsUrl(place) {
  return mapsDirectionsUrl(placeQuery(place))
}

/** Tìm quanh đây theo loại món (Google Maps sẽ dùng vị trí hiện tại) */
export function nearbyUrl(category) {
  return mapsSearchUrl(`${category} gần đây`)
}

/** Link tìm ảnh minh hoạ trên Google Images */
export function imageSearchUrl(query) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`
}
