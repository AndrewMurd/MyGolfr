import { Component, Input } from '@angular/core';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';

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
  getRGB: Function = getRGB;
  createRange: Function = createRange;
  getColorWhite: Function = getColorWhite;

  constructor() {}

  ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;
  }

  ngAfterViewInit() {
    if (!this.teeData.Color) return;
    this.isWhite = this.getColorWhite(this.getRGB(this.teeData.Color));
  }
}
