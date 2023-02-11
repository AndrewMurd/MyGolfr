import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-scorecard-tee',
  templateUrl: './scorecard-tee.component.html',
  styleUrls: ['./scorecard-tee.component.scss']
})
export class ScorecardTeeComponent {
  @Input() id!: string;
  @Input() teeData: any;
  @Input() scorecard: any;
  @Input() isFrontNine: boolean = true;
  courseId!: string;
  isWhite!: boolean;
  factor: number = 170;
  yardages: any = [];
  pars: any = [];
  strokeIndexes: any = [];

  constructor() {}

  ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;
  }

  ngAfterViewInit() {
    if (!this.teeData.Color) return;
    const rgb = this.getRGB(this.teeData.Color);

    if (
      (rgb.r > this.factor && rgb.g > this.factor) ||
      (rgb.r > this.factor && rgb.b > this.factor) ||
      (rgb.g > this.factor && rgb.b > this.factor)
    ) {
      this.isWhite = true;
    } else {
      this.isWhite = false;
    }
  }

  getRGB(ev: string) {
    const color = ev;
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    // console.log(`red: ${r}, green: ${g}, blue: ${b}`)
    return { r: r, g: g, b: b };
  }

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill('').map((n, index) => index + 1);
  }
}
