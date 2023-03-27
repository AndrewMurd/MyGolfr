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

export function convertSqlDateTime(sqlDateTime: any): any {
  return convertUTCDateToLocalDate(new Date(sqlDateTime));
}

function convertUTCDateToLocalDate(date: any) {
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

export function numberOfHolesPlayed(score: any) {
  let count = 0;
  for (let [key, value] of Object.entries(score.score)) {
    if (value != '' && key != 'In' && key != 'Out') {
      count++;
    }
  }
  return count;
}

export function convertDateTime(score: any) {
  const currentDateTime: any = new Date();
  const diffTime = currentDateTime - convertSqlDateTime(score.endTime);
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (Math.round(diffDays * 24) < 1) {
    return `${Math.round(diffDays * 24 * 48)} mins`;
  } else if (diffDays <= 3) {
    return `${Math.round(diffDays * 24)} hours`;
  } else {
    return `${Math.floor(diffDays)} days`;
  }
}
