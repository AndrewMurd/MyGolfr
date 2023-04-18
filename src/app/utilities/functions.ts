// gets rgb values of hexRGB
export function getRGB(ev: string) {
  if (!ev) return { r: 0, g: 0, b: 0 };
  const color = ev;
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  return { r: r, g: g, b: b };
}
// create arbitrary array of certain length
export function createRange(number: number) {
  return new Array(number).fill(0).map((n, index) => index + 1);
}
// get whether font should be white based on rgb value
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
// calc number of holes played on in a score (round)
export function numberOfHolesPlayed(score: any) {
  let count = 0;
  for (let [key, value] of Object.entries(score.score)) {
    if (value != '' && key != 'In' && key != 'Out') {
      count++;
    }
  }
  return count;
}
// get time passed from a datetime to the current datetime and format output
export function diffCurrentTime(date: any) {
  const diffTime = new Date().getTime() - new Date(date).getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  
  if (Math.round(diffDays * 24 * 48) == 1) {
    return `${Math.round(diffDays * 24 * 48)} min`;
  } else if (Math.round(diffDays * 24) < 1) {
    return `${Math.round(diffDays * 24 * 48)} mins`;
  } else if (Math.round(diffDays * 24) == 1) {
    return `${Math.round(diffDays * 24)} hour`;
  } else if (diffDays <= 3) {
    return `${Math.round(diffDays * 24)} hours`;
  } else {
    return `${Math.floor(diffDays)} days`;
  }
}
// format ms time
export function hm(ms: number) {
  const daysms = ms % (24 * 60 * 60 * 1000);
  const hours = Math.floor(daysms / (60 * 60 * 1000));
  const hoursms = ms % (60 * 60 * 1000);
  const minutes = Math.floor(hoursms / (60 * 1000));
  return hours + 'h ' + minutes + 'm';
}

export function makeid(length: number) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
// format time
export function toStandardTime(
  time: any,
  sec: boolean = true,
  min: boolean = true,
  hour: boolean = true
) {
  time = time.split(':'); // convert to array

  // fetch
  var hours = Number(time[0]);
  var minutes = Number(time[1]);
  var seconds = Number(time[2]);

  // calculate
  var timeValue;

  if (hours > 0 && hours <= 12) {
    timeValue = '' + hours;
  } else if (hours > 12) {
    timeValue = '' + (hours - 12);
  } else if (hours == 0) {
    timeValue = '12';
  }
  if (min) timeValue += minutes < 10 ? ':0' + minutes : ':' + minutes; // get minutes
  if (sec) timeValue += seconds < 10 ? ':0' + seconds : ':' + seconds; // get seconds
  if (hour) timeValue += hours >= 12 ? 'pm' : 'am'; // get AM/PM

  return timeValue;
}
