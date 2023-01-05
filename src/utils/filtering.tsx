export function or_filters(pkg: any, functions: any) {
  if (functions.length === 0) {
    return true
  }
  return functions.map((f: any) => f(pkg))
    .reduce((acc: boolean, res: boolean) => (acc || res), false);
}


export function outdated(pkg: any) {
  return (
    pkg.release_info.length > 1
    && pkg.flight !== ""
    && pkg.release_info[1].release_tag !== pkg.flight
  )
}