import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CourseDetailsService } from '../../Service/course-details.service';

@Component({
  selector: 'app-new-scorecard-tee',
  templateUrl: './new-scorecard-tee.component.html',
  styleUrls: ['./new-scorecard-tee.component.scss'],
})
export class NewScorecardTeeComponent {
  @Input() teeData!: any;
  @Input() isFrontNine: boolean = true;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter();
  @Input() events!: Observable<any>;
  color: string = '#0000FF';
  nameColor!: string;
  displayColorPicker: boolean = false;
  displayColorNamer: boolean = false;
  displayInputSelector: boolean = true;
  isWhite: boolean = false;
  colorEventsSubject: Subject<boolean> = new Subject<boolean>();
  factor: number = 190;

  constructor(private courseService: CourseDetailsService) {}

  ngOnInit() {
    this.events.subscribe((value) => {
      if ('Color' == value.id[1]) {
        this.teeData.Color = value.value;
        const rgb = this.getRGB(this.teeData.Color);

        if (
          (rgb.r > this.factor && rgb.g > this.factor) ||
          (rgb.r > this.factor && rgb.b > this.factor) ||
          (rgb.g > this.factor && rgb.b > this.factor)
        ) {
          this.colorEventsSubject.next(true);
        } else {
          this.colorEventsSubject.next(false);
        }
      }
    });
  }

  ngAfterViewInit() {
    const rgb = this.getRGB(this.teeData.Color);

    if (
      (rgb.r > this.factor && rgb.g > this.factor) ||
      (rgb.r > this.factor && rgb.b > this.factor) ||
      (rgb.g > this.factor && rgb.b > this.factor)
    ) {
      console.log(123);
      this.colorEventsSubject.next(true);
    } else {
      this.colorEventsSubject.next(false);
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

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  submitColorName() {
    this.displayColorNamer = false;
    this.displayInputSelector = true;

    // this.courseService.setScorecard(
    //   JSON.parse(localStorage.getItem('selectedCourse')!).reference,
    //   { id: [this.teeData.id, 'ColorName'], value: this.color }
    // );

    // this.onSubmitofInput.emit({
    //   id: [this.teeData.id, 'Color'],
    //   value: this.color,
    // });
  }

  setColor() {
    this.displayColorPicker = false;
    this.displayInputSelector = true;

    // set Color in database
    this.courseService.setScorecard(
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
