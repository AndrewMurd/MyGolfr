export function getRGB(ev: string) {
  if (!ev) return { r: 0, g: 0, b: 0 };
  const color = ev;
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  // console.log(`red: ${r}, green: ${g}, blue: ${b}`)
  return { r: r, g: g, b: b };
}

export function createRange(number: number) {
  // return new Array(number);
  return new Array(number).fill(0).map((n, index) => index + 1);
}

export function getColorWhite(rgb: any) {
  const factor = 170;
  if (
    (rgb.r > factor && rgb.g > factor) ||
    (rgb.r > factor && rgb.b > factor) ||
    (rgb.g > factor && rgb.b > factor)
  ) {
    return true;
  } else {
    return false;
  }
}