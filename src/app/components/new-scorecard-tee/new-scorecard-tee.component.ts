import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { CourseDetailsService } from '../../services/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';
import { AlertService } from 'src/app/services/alert.service';

// this component is dynamically added to the edit scorecard component. 
// this components allows user to edit scorecard data for selected course.
@Component({
  selector: 'app-new-scorecard-tee',
  templateUrl: './new-scorecard-tee.component.html',
  styleUrls: ['./new-scorecard-tee.component.scss'],
  host: { '[id]': 'id' },
})
export class NewScorecardTeeComponent {
  subscriptions: Subscription = new Subscription();
  @Input() id!: string;
  @Input() teeData: any;
  @Input() isFrontNine: boolean = true;
  @Input() submitInput!: Observable<any>;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter();
  scorecard: any;
  courseData: any;
  scoreData: any;
  editing: boolean = false;
  showCopySI!: boolean;
  showCopyPar!: boolean;
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
    private scoreService: ScoreService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    this.subscriptions.add(
      this.courseService.courseData.asObservable().subscribe((value) => {
        if (value) {
          this.courseData = value;
          this.scorecard = value.scorecard;
        }
      })
    );

    // counts number of completed entries for this tee
    // to see whether user should be able to copy data from other tee with copy btn
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

    this.subscriptions.add(
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
        } else if (
          this.teeData.id == value.id[0] &&
          'ColorName' == value.id[1]
        ) {
          this.teeData.ColorName = value.value;
          this.displayInputSelector = false;
          this.displayColorName = true;
        }
      })
    );

    this.subscriptions.add(
      this.courseService.editingScoreCard.asObservable().subscribe((value) => {
        this.editing = value;
      })
    );

    this.subscriptions.add(
      this.scoreService.inProgressScoreData
        .asObservable()
        .subscribe((value) => {
          if (value) {
            this.scoreData = value;
          }
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
  // changes position of tee on scorecard
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

    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      this.scorecard,
      'scorecard'
    );
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }
  // copys par data from tee with most data complete in either back nine or front nine respectively
  // this function allows user to complete new tees added to a course faster (ease of use)
  async copyParData() {
    this.showCopyPar = false;

    const list: any[] = [];

    // gets values for par data from other tees
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

    // get tee with most completed data
    let largest = list[0];
    for (let i = 0; i < list.length; i++) {
      if (Object.entries(largest).length < Object.entries(list[i]).length) {
        largest = list[i];
      }
    }
    // set this tee with the completed data from the other tee
    for (let tee of this.scorecard) {
      if (tee.id == this.teeData.id) {
        let key, value: any;
        for ([key, value] of Object.entries(largest)) {
          tee[key] = value;
        }
      }
    }
    // update scorecard
    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      this.scorecard,
      'scorecard'
    );
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }
  // same thing as par copy pasta just for stroke index
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

    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      this.scorecard,
      'scorecard'
    );
    this.courseData.scorecard = this.scorecard;
    this.courseService.courseData.next(this.courseData);
  }

  async deleteTee() {
    this.alertService.confirm(
      'Deleting this Tee Box will delete it in the database forever. Are you sure you want to delete it?',
      { color: 'red', content: 'Delete' },
      async () => {
        try {
          // remove the tee from dom
          document.getElementById(this.teeData.id)?.remove();
          document.getElementById(this.teeData.id)?.remove();
          // filter out tee
          for (let i = 0; i < this.scorecard.length; i++) {
            if (this.scorecard[i].id == this.teeData.id) {
              this.scorecard.splice(i, 1);
            }
          }
          // readjust position for other tees
          for (let tee of this.scorecard) {
            if (tee.Position > this.teeData.Position)
              tee.Position = tee.Position - 1;
          }
          // update layout data for course
          let mapLayout = this.courseData.mapLayout;
          for (let [key, value] of Object.entries(mapLayout)) {
            for (let i = 0; i < mapLayout[key].teeLocations.length; i++) {
              if (mapLayout[key].teeLocations[i].id == this.teeData.id) {
                mapLayout[key].teeLocations.splice(i, 1);
              }
            }
          }

          this.courseData.scorecard = this.scorecard;
          this.courseData.mapLayout = mapLayout;
          this.courseService.courseData.next(this.courseData);
          await this.courseService.update(this.courseData);
        } catch (error) {}
      },
      () => {}
    );
  }

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  async submitColorName() {
    if (!this.nameColor) {
      this.alertService.alert('Must enter Value!', {
        color: 'green',
        content: 'Accept',
      });
      this.displayColorNamer = false;
      this.displayInputSelector = true;
    } else {
      this.displayColorNamer = false;
      this.displayInputSelector = false;
      this.displayColorName = true;

      this.nameColor =
        this.nameColor.charAt(0).toUpperCase() + this.nameColor.slice(1);

      const response: any = await this.courseService.setScorecardValue(
        this.courseData.googleDetails.reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );

      this.courseData.scorecard = response.scorecard;
      this.scoreData.scorecard = response.scorecard;
      // update teeData with updated scorecard data for in progress score
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.scoreData.teeData.id) {
          this.scoreData.teeData = tee;
          await this.scoreService.update(this.scoreData, 'teeData');
        }
      }
      this.scoreService.inProgressScoreData.next(this.scoreData);
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
      this.courseData.googleDetails.reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );
    this.courseData.scorecard = response.scorecard;
    this.scoreData.scorecard = response.scorecard;
    // update teeData with updated scorecard data for in progress score
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == this.scoreData.teeData.id) {
        this.scoreData.teeData = tee;
        await this.scoreService.update(this.scoreData, 'teeData');
      }
    }
    this.scoreService.inProgressScoreData.next(this.scoreData);
    this.courseService.courseData.next(this.courseData);

    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }
}
