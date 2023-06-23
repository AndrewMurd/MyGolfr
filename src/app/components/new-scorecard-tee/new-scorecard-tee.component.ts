import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { CourseDetailsService } from '../../services/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';
import { AlertService } from 'src/app/services/alert.service';
import {
  modelAggregated18,
  modelAggregated9,
  modelNormal18,
  modelNormal9,
} from 'src/app/utilities/models';

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
  @Output() loading: EventEmitter<any> = new EventEmitter();
  isPhone: boolean = false;
  scorecard: any;
  courseData: any;
  scoreData: any;
  editing: boolean = false;
  showCopySI!: boolean;
  showCopyPar!: boolean;
  aggregated!: boolean;
  color!: string;
  nameColor!: string;
  completedTees: any;
  selectedTee1: any;
  selectedTee2: any;
  tee1: any;
  tee2: any;
  popUp: boolean = false;
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
    this.onResize();

    this.aggregated = this.teeData.Aggregated;
    if (!this.aggregated) this.aggregated = false;
    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    this.subscriptions.add(
      this.courseService.courseData.asObservable().subscribe((value) => {
        if (value) {
          this.courseData = value;
          this.scorecard = value.scorecard;
          this.completedTees = this.scorecard.filter((tee: any) => {
            return (
              this.checkTeeData(tee) &&
              (tee.Aggregated == false || tee.Aggregated == undefined) &&
              tee.id != this.teeData.id
            );
          });
          this.completedTees = this.completedTees.sort((a: any, b: any) => {
            return a.Position - b.Position;
          });
          try {
            if (!this.teeData.Tee1)
              this.selectedTee1 = this.completedTees[0].id;
            else this.selectedTee1 = this.teeData.Tee1;
            if (!this.teeData.Tee2)
              this.selectedTee2 = this.completedTees[1].id;
            else this.selectedTee2 = this.teeData.Tee2;
            for (let tee of this.scorecard) {
              if (this.selectedTee1 == tee.id) this.tee1 = tee;
              if (this.selectedTee2 == tee.id) this.tee2 = tee;
            }
          } catch (error) {}
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
        )
          countPar++;
        else if (
          key.charAt(0) == 'S' &&
          Number(key.charAt(2)) <= 9 &&
          !Number(key.slice(-2))
        )
          countSI++;
      }
      if (countPar < 9) this.showCopyPar = true;
      if (countSI < 9) this.showCopySI = true;
    } else {
      for ([key, value] of Object.entries(this.teeData)) {
        if (key.charAt(0) == 'P') {
          if (Number(key.slice(-2)) >= 10) countPar++;
        } else if (key.charAt(0) == 'S') {
          if (Number(key.slice(-2)) >= 10) countSI++;
        }
      }
      if (countPar < 9) this.showCopyPar = true;
      if (countSI < 9) this.showCopySI = true;
    }

    this.subscriptions.add(
      this.submitInput.subscribe((value) => {
        if (this.teeData.id == value.id[0] && 'Color' == value.id[1]) {
          this.teeData.Color = value.value;

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
        }
      })
    );

    this.subscriptions.add(
      this.courseService.editingScoreCard.asObservable().subscribe((value) => {
        this.editing = value;
        console.log(value)
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
    this.loading.emit(true);
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
    this.loading.emit(false);
  }
  // copys par data from tee with most data complete in either back nine or front nine respectively
  // this function allows user to complete new tees added to a course faster (ease of use)
  async copyParData() {
    this.loading.emit(true);
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
    this.loading.emit(false);
  }
  // same thing as par copy pasta just for stroke index
  async copySIData() {
    this.loading.emit(true);
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
    this.loading.emit(false);
  }

  async deleteTee() {
    this.loading.emit(true);
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
    this.loading.emit(false);
  }

  onSubmit(data: any) {
    this.onSubmitofInput.emit(data);
  }

  getHoleColor(index: number) {
    try {
      if (this.teeData['A' + index] == this.teeData.Tee1)
        return this.tee1.Color;
      else if (this.teeData['A' + index] == this.teeData.Tee2)
        return this.tee2.Color;
    } catch (error) {}
  }

  resetPopup() {
    this.aggregated = this.teeData.Aggregated;
    this.selectedTee1 = this.tee1?.id;
    this.selectedTee2 = this.tee2?.id;
    this.nameColor = this.teeData.ColorName;
    this.color = this.teeData.Color;
  }

  async submitEdit() {
    this.loading.emit(true);
    if (this.aggregated) {
      if (this.selectedTee1 == this.selectedTee2) {
        this.alertService.alert(
          'You need two different tees for an aggregated tee.',
          { color: 'green', content: 'Accept' }
        );
        this.loading.emit(false);
        return;
      }
      this.popUp = false;
      for (let tee of this.scorecard) {
        if (tee.id == this.teeData.id) {
          tee.Aggregated = this.aggregated;
          tee.Tee1 = this.selectedTee1;
          tee.Tee2 = this.selectedTee2;
        }
      }
      await this.courseService.updateColumn(
        this.courseData.googleDetails.reference,
        this.scorecard,
        'scorecard'
      );
      this.courseData.scorecard = this.scorecard;
      this.courseService.courseData.next(this.courseData);
      if (this.scoreData) {
        this.scoreData.scorecard = this.scorecard;
        // update teeData with updated scorecard data for in progress score
        for (let tee of this.scoreData.scorecard) {
          if (tee.id == this.scoreData.teeData.id) {
            this.scoreData.teeData = tee;
            await this.scoreService.update(this.scoreData, 'teeData');
          }
        }
        this.scoreService.inProgressScoreData.next(this.scoreData);
      }
    } else {
      this.popUp = false;
      for (let tee of this.scorecard) {
        if (tee.id == this.teeData.id) {
          tee.Aggregated = this.aggregated;
        }
      }
      await this.courseService.updateColumn(
        this.courseData.googleDetails.reference,
        this.scorecard,
        'scorecard'
      );
      await this.setColor();
    }
    await this.setColorName();
    this.loading.emit(false);
  }

  async setColorName() {
    if (!this.nameColor || this.nameColor == this.teeData.ColorName) {
      return;
    } else {
      this.nameColor =
        this.nameColor.charAt(0).toUpperCase() + this.nameColor.slice(1);

      const response: any = await this.courseService.setScorecardValue(
        this.courseData.googleDetails.reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );
      this.courseData.scorecard = response.scorecard;
      this.courseService.courseData.next(this.courseData);
      if (this.scoreData) {
        this.scoreData.scorecard = response.scorecard;
        // update teeData with updated scorecard data for in progress score
        for (let tee of this.scoreData.scorecard) {
          if (tee.id == this.scoreData.teeData.id) {
            this.scoreData.teeData = tee;
            await this.scoreService.update(this.scoreData, 'teeData');
          }
        }
        this.scoreService.inProgressScoreData.next(this.scoreData);
      }

      this.onSubmitofInput.emit({
        id: [this.teeData.id, 'ColorName'],
        value: this.nameColor,
      });
    }
  }

  async setColor() {
    if (this.color == this.teeData.Color) return;
    if (!this.color) this.color = '#000000';

    // set Color in database
    const response: any = await this.courseService.setScorecardValue(
      this.courseData.googleDetails.reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );
    this.courseData.scorecard = response.scorecard;
    this.courseService.courseData.next(this.courseData);
    if (this.scoreData) {
      this.scoreData.scorecard = response.scorecard;
      // update teeData with updated scorecard data for in progress score
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.scoreData.teeData.id) {
          this.scoreData.teeData = tee;
          await this.scoreService.update(this.scoreData, 'teeData');
        }
      }
      this.scoreService.inProgressScoreData.next(this.scoreData);
    }

    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }

  checkForAggregation() {
    if (this.aggregated && this.scorecard.length < 2) {
      this.alertService.alert(
        'You need two different tees for an aggregated tee.',
        { color: 'green', content: 'Accept' }
      );
      document.getElementById('checkbox' + this.teeData.id)?.click();
      return;
    } else if (this.aggregated) {
      this.completedTees = this.scorecard.filter((tee: any) => {
        return (
          this.checkTeeData(tee) &&
          (tee.Aggregated == false || tee.Aggregated == undefined) &&
          tee.id != this.teeData.id
        );
      });
      this.completedTees = this.completedTees.sort((a: any, b: any) => {
        return a.Position - b.Position;
      });
      if (!this.teeData.Tee1) this.selectedTee1 = this.completedTees[0].id;
      else this.selectedTee1 = this.teeData.Tee1;
      if (!this.teeData.Tee2) this.selectedTee2 = this.completedTees[1].id;
      else this.selectedTee2 = this.teeData.Tee2;
      for (let tee of this.scorecard) {
        if (this.selectedTee1 == tee.id) this.tee1 = tee;
        if (this.selectedTee2 == tee.id) this.tee2 = tee;
      }
    }
  }

  checkTeeData(tee: any) {
    if (this.courseData.courseDetails.nineHoleGolfCourse) {
      let model;
      if (tee.Aggregated) model = modelAggregated9;
      else model = modelNormal9;
      for (let [key, value] of Object.entries(tee)) {
        if (key in model) {
          model[key] = true;
        }
      }
      let complete = true;
      for (let [key, value] of Object.entries(model)) {
        if (!value) {
          complete = false;
          break;
        }
      }
      if (!complete) {
        return false;
      }
      return true;
    } else {
      let model;
      if (tee.Aggregated) model = modelAggregated18;
      else model = modelNormal18;
      for (let [key, value] of Object.entries(tee)) {
        if (key in model) {
          model[key] = true;
        }
      }
      let complete = true;
      for (let [key, value] of Object.entries(model)) {
        if (!value) {
          complete = false;
          break;
        }
      }
      if (!complete) {
        return false;
      }
      return true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }
}
