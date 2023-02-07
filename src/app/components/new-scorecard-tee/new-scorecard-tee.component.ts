import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CourseDetailsService } from '../../Service/course-details.service';

@Component({
  selector: 'app-new-scorecard-tee',
  templateUrl: './new-scorecard-tee.component.html',
  styleUrls: ['./new-scorecard-tee.component.scss'],
  host: { '[id]': 'id' },
})
export class NewScorecardTeeComponent {
  @Input() id!: string;
  @Input() teeData: any;
  @Input() scorecard: any;
  @Input() isFrontNine: boolean = true;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter();
  @Output() onReload: EventEmitter<any> = new EventEmitter();
  @Input() events!: Observable<any>;
  showCopySI!: boolean;
  showCopyPar!: boolean;
  courseId!: string;
  color!: string;
  nameColor!: string;
  displayColorPicker: boolean = false;
  displayColorNamer: boolean = false;
  displayInputSelector: boolean = false;
  displayColorName: boolean = true;
  isWhite!: boolean;
  colorEventsSubject: Subject<boolean> = new Subject<boolean>();
  copyEventsSubject: Subject<any> = new Subject<any>();
  factor: number = 170;
  requestSendRate: number = 1000;

  constructor(private courseService: CourseDetailsService) {}

  ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    // this dosent work properly
    let key, value: any;
    let countPar = 0,
      countSI = 0;
    if (this.isFrontNine) {
      for ([key, value] of Object.entries(this.teeData)) {
        if (key.charAt(0) == 'P' && Number(key.charAt(1)) <= 9 && !Number(key.slice(-2))) {
          countPar++;
        } else if (key.charAt(0) == 'S' && Number(key.charAt(2)) <= 9 && !Number(key.slice(-2))) {
          countSI++;
        }
      }
      if (countPar < 9) {
        this.showCopyPar = true;
      }
      if (countSI < 9) {
        this.showCopySI = true;
      }
    } else {
      for ([key, value] of Object.entries(this.teeData)) {
        if (key.charAt(0) == 'P') {
          if (Number(key.slice(-2)) >= 10) {
            countPar++;
          }
        } else if (key.charAt(0) == 'S') {
          if (Number(key.slice(-2)) >= 10) {
            countSI++;
          }
        }
      }
      if (countPar < 9) {
        this.showCopyPar = true;
      }
      if (countSI < 9) {
        this.showCopySI = true;
      }
    }

    if (!this.teeData.ColorName) {
      this.displayColorName = false;
      this.displayInputSelector = true;
    }

    this.events.subscribe((value) => {
      if (this.teeData.id == value.id[0] && 'Color' == value.id[1]) {
        this.teeData.Color = value.value;
        if (this.teeData.ColorName) {
          this.displayInputSelector = false;
          this.displayColorName = true;
        }
        const rgb = this.getRGB(this.teeData.Color);

        if (
          (rgb.r > this.factor && rgb.g > this.factor) ||
          (rgb.r > this.factor && rgb.b > this.factor) ||
          (rgb.g > this.factor && rgb.b > this.factor)
        ) {
          this.colorEventsSubject.next(true);
          this.isWhite = true;
        } else {
          this.colorEventsSubject.next(false);
          this.isWhite = false;
        }
      } else if (this.teeData.id == value.id[0] && 'ColorName' == value.id[1]) {
        this.teeData.ColorName = value.value;
        this.displayInputSelector = false;
        this.displayColorName = true;
      }
    });
  }

  ngAfterViewInit() {
    if (!this.teeData.Color) return;
    const rgb = this.getRGB(this.teeData.Color);

    if (
      (rgb.r > this.factor && rgb.g > this.factor) ||
      (rgb.r > this.factor && rgb.b > this.factor) ||
      (rgb.g > this.factor && rgb.b > this.factor)
    ) {
      this.colorEventsSubject.next(true);
      this.isWhite = true;
    } else {
      this.colorEventsSubject.next(false);
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

  async changePosition(event: any) {
    const newPos = event.target.value;

    const response_scorecard: any = await this.courseService.getScorecard(
      this.courseId
    );
    this.scorecard = response_scorecard.scorecard;

    for (let tee of this.scorecard) {
      if (tee.Position == newPos) {
        tee.Position = this.teeData.Position;
      }
    }

    for (let i = 0; i < this.scorecard.length; i++) {
      if (this.scorecard[i].id == this.teeData.id) {
        this.scorecard[i].Position = newPos;
      }
    }

    this.courseService.setScorecard(this.courseId, this.scorecard).then(() => {
      this.onReload.emit();
    });
  }

  async copyParData() {
    this.showCopyPar = false;

    const response_scorecard: any = await this.courseService.getScorecard(
      this.courseId
    );
    this.scorecard = response_scorecard.scorecard;

    const list: any[] = [];

    for (let tee of this.scorecard) {
      const parValues: any = {};
      let key, value: any;
      for ([key, value] of Object.entries(tee)) {
        if (key.charAt(0) == 'P' && key.charAt(1) != 'o') {
          if (this.isFrontNine && !Number(key.slice(-2))) {
            parValues[key] = value;
          } else if (!this.isFrontNine && Number(key.slice(-2))) {
            parValues[key] = value;
          }
        } else if (key == 'SumOutPar' && this.isFrontNine) {
          parValues[key] = value;
        } else if (key == 'SumInPar' && !this.isFrontNine) {
          parValues[key] = value;
        }
      }
      list.push(parValues);
    }

    let largest = list[0];
    for (let i = 0; i < list.length; i++) {
      if (Object.entries(largest).length < Object.entries(list[i]).length) {
        largest = list[i];
      }
    }

    for (let tee of this.scorecard) {
      if (tee.id == this.teeData.id) {
        let key, value: any;
        for ([key, value] of Object.entries(largest)) {
          console.log(key, value);
          tee[key] = value;
        }
      }
    }

    this.courseService.setScorecard(this.courseId, this.scorecard).then(() => {
      this.onReload.emit();
    });
  }

  async copySIData() {
    this.showCopySI = false;

    const response_scorecard: any = await this.courseService.getScorecard(
      this.courseId
    );
    this.scorecard = response_scorecard.scorecard;

    const list: any[] = [];

    for (let tee of this.scorecard) {
      const parValues: any = {};
      let key, value: any;
      for ([key, value] of Object.entries(tee)) {
        if (key.slice(0, 2) == 'SI') {
          if (this.isFrontNine && !Number(key.slice(-2))) {
            parValues[key] = value;
          } else if (!this.isFrontNine && Number(key.slice(-2))) {
            parValues[key] = value;
          }
        }
      }
      list.push(parValues);
    }

    let largest = list[0];
    for (let i = 0; i < list.length; i++) {
      if (Object.entries(largest).length < Object.entries(list[i]).length) {
        largest = list[i];
      }
    }

    for (let tee of this.scorecard) {
      if (tee.id == this.teeData.id) {
        let key, value: any;
        for ([key, value] of Object.entries(largest)) {
          tee[key] = value;
        }
      }
    }

    this.courseService.setScorecard(this.courseId, this.scorecard).then(() => {
      this.onReload.emit();
    });
  }

  deleteTee() {
    const confirmRes = window.confirm(
      'Are you sure you want to delete this tee. (Cannot be undone)'
    );

    if (confirmRes) {
      document.getElementById(this.teeData.id)?.remove();
      document.getElementById(this.teeData.id)?.remove();

      for (let i = 0; i < this.scorecard.length; i++) {
        if (this.scorecard[i].id == this.teeData.id) {
          this.scorecard.splice(i, 1);
        }
      }

      for (let tee of this.scorecard) {
        if (tee.Position > this.teeData.Position)
          tee.Position = tee.Position - 1;
      }

      this.courseService
        .setScorecard(this.courseId, this.scorecard)
        .then(() => {
          this.onReload.emit();
        });
    }
  }

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  submitColorName() {
    if (!this.nameColor) {
      alert('Must enter name!');
      this.displayColorNamer = false;
      this.displayInputSelector = true;
    } else {
      this.displayColorNamer = false;
      this.displayInputSelector = false;
      this.displayColorName = true;

      this.courseService.setScorecardValue(
        JSON.parse(localStorage.getItem('selectedCourse')!).reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );
  
      this.onSubmitofInput.emit({
        id: [this.teeData.id, 'ColorName'],
        value: this.nameColor,
      });
    }
  }

  setColor() {
    this.displayColorPicker = false;
    if (this.teeData.ColorName) {
      this.displayInputSelector = false;
      this.displayColorName = true;
    } else {
      this.displayInputSelector = true;
    }

    if (!this.color) {
      this.color = '#000000';
    }

    // set Color in database
    this.courseService.setScorecardValue(
      JSON.parse(localStorage.getItem('selectedCourse')!).reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );

    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill(0).map((n, index) => index + 1);
  }
}
