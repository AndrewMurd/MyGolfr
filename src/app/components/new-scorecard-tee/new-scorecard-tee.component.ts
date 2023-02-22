import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ScoreService } from '../../Service/score.service';
import { CourseDetailsService } from '../../Service/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';

@Component({
  selector: 'app-new-scorecard-tee',
  templateUrl: './new-scorecard-tee.component.html',
  styleUrls: ['./new-scorecard-tee.component.scss'],
  host: { '[id]': 'id' },
})
export class NewScorecardTeeComponent {
  @Input() id!: string;
  @Input() teeData: any;
  @Input() isFrontNine: boolean = true;
  @Input() submitInput!: Observable<any>;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter();
  scorecard: any;
  courseData: any;
  editing: boolean = false;
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
  createRange: Function = createRange;
  getRGB: Function = getRGB;
  getColorWhite: Function = getColorWhite;

  constructor(
    private courseService: CourseDetailsService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    this.courseService.courseData.asObservable().subscribe((value) => {
      if (value) {
        this.courseData = value;
        this.scorecard = value.scorecard;
      }
    });

    let key, value: any;
    let countPar = 0,
      countSI = 0;
    if (this.isFrontNine) {
      for ([key, value] of Object.entries(this.teeData)) {
        if (
          key.charAt(0) == 'P' &&
          Number(key.charAt(1)) <= 9 &&
          !Number(key.slice(-2))
        ) {
          countPar++;
        } else if (
          key.charAt(0) == 'S' &&
          Number(key.charAt(2)) <= 9 &&
          !Number(key.slice(-2))
        ) {
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

    this.submitInput.subscribe((value) => {
      if (this.teeData.id == value.id[0] && 'Color' == value.id[1]) {
        this.teeData.Color = value.value;
        if (this.teeData.ColorName) {
          this.displayInputSelector = false;
          this.displayColorName = true;
        }

        this.isWhite = this.getColorWhite(this.getRGB(this.teeData.Color));
        if (this.isWhite) {
          this.colorEventsSubject.next(true);
        } else {
          this.colorEventsSubject.next(false);
        }
      } else if (this.teeData.id == value.id[0] && 'ColorName' == value.id[1]) {
        this.teeData.ColorName = value.value;
        this.displayInputSelector = false;
        this.displayColorName = true;
      }
    });

    this.courseService.editingScoreCard.asObservable().subscribe((value) => {
      this.editing = value;
    });
  }

  ngAfterViewInit() {
    if (!this.teeData.Color) return;
    this.isWhite = this.getColorWhite(this.getRGB(this.teeData.Color));
    if (this.isWhite) {
      this.colorEventsSubject.next(true);
    } else {
      this.colorEventsSubject.next(false);
    }
  }

  async changePosition(event: any) {
    const newPos = event.target.value;

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

    await this.courseService.update(this.courseId, this.scorecard, 'scorecard');
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }

  async copyParData() {
    this.showCopyPar = false;

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
          tee[key] = value;
        }
      }
    }

    await this.courseService.update(this.courseId, this.scorecard, 'scorecard');
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }

  async copySIData() {
    this.showCopySI = false;

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

    await this.courseService.update(this.courseId, this.scorecard, 'scorecard');
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }

  async deleteTee() {
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

      await this.courseService.update(
        this.courseId,
        this.scorecard,
        'scorecard'
      );

      let mapLayout = this.courseData.mapLayout;

      for (let [key, value] of Object.entries(mapLayout)) {
        for (let i = 0; i < mapLayout[key].teeLocations.length; i++) {
          if (mapLayout[key].teeLocations[i].id == this.teeData.id) {
            mapLayout[key].teeLocations.splice(i, 1);
          }
        }
      }

      await this.courseService.update(this.courseId, mapLayout, 'mapLayout');

      this.courseData.scorecard = this.scorecard;
      this.courseData.mapLayout = mapLayout;
      this.courseService.courseData.next(this.courseData);
    }
  }

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  async submitColorName() {
    if (!this.nameColor) {
      alert('Must enter name!');
      this.displayColorNamer = false;
      this.displayInputSelector = true;
    } else {
      this.displayColorNamer = false;
      this.displayInputSelector = false;
      this.displayColorName = true;

      this.nameColor =
        this.nameColor.charAt(0).toUpperCase() + this.nameColor.slice(1);

      const response: any = await this.courseService.setScorecardValue(
        JSON.parse(localStorage.getItem('selectedCourse')!).reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );

      this.courseData.scorecard = response.scorecard;
      this.courseService.courseData.next(this.courseData);

      this.onSubmitofInput.emit({
        id: [this.teeData.id, 'ColorName'],
        value: this.nameColor,
      });
    }
  }

  async setColor() {
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
    const response: any = await this.courseService.setScorecardValue(
      JSON.parse(localStorage.getItem('selectedCourse')!).reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );
    this.courseData.scorecard = response.scorecard;
    this.courseService.courseData.next(this.courseData);

    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }
}
