export function getFileExtension(path: string) {
  const lastSegment = path.replace(/\/$/, '').split('/').pop() || ''
  const dotIndex = lastSegment.lastIndexOf('.')
  if (dotIndex > 0 && dotIndex < lastSegment.length - 1) {
    return lastSegment.substring(dotIndex)
  }

  return 'json'
}
