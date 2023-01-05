var semver = require('semver');


export function lexicographic_sort(a: any, b: any) {
  console.log('lexicographic sort', a, b)
  return a.toString().localeCompare(b.toString())
}


export function numeric_sort(a: number, b: number) {
  console.log('numeric sort', a, b)
  if (a === b) {
    return 0
  }
  return a - b
}


export function version_sort(a: any, b: any) {
  var v1 = semver.clean(a)
  var v2 = semver.clean(b)
  if (v1 == null && v2 == null) {
    return 0
  }
  if (v2 == null) {
    return 1
  }
  if (v1 == null) {
    return -1
  }
  if (semver.gt(v1, v2)) {
    return 1
  }
  if (semver.lt(v1, v2)) {
    return -1
  }
  return 0
}