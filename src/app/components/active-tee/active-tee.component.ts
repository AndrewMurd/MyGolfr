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

// this component is dynamically added to the active scorecard component.
// This components allows user to edit score and tee data for current round selected or in progress.
@Component({
  selector: 'app-active-tee',
  templateUrl: './active-tee.component.html',
  styleUrls: ['./active-tee.component.scss'],
  host: { '[id]': 'id' },
})
export class ActiveTeeComponent {
  subscriptions: Subscription = new Subscription();
  @Input() id!: string;
  @Input() teeData: any;
  @Input() isFrontNine: boolean = true;
  @Input() selectedScore!: boolean;
  @Input() submitInput!: Observable<any>;
  @Output() onSubmitofInput: EventEmitter<any> = new EventEmitter();
  @Output() loading: EventEmitter<any> = new EventEmitter();
  isPhone: boolean = false;
  scoreData: any;
  editing: boolean = false;
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

    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    if (this.selectedScore) {
      this.subscriptions.add(
        this.scoreService.selectedScoreData
          .asObservable()
          .subscribe((value) => {
            if (value) {
              this.scoreData = value;
              this.init();
            }
          })
      );
    } else {
      this.subscriptions.add(
        this.scoreService.inProgressScoreData
          .asObservable()
          .subscribe((value) => {
            if (value) {
              this.scoreData = value;
              this.init();
            }
          })
      );
    }

    this.subscriptions.add(
      this.submitInput.subscribe((value) => {
        // If submitted data is a color change. Switch the color for both back nine and front nine components.
        if (this.teeData.id == value.id[0] && 'Color' == value.id[1]) {
          this.teeData.Color = value.value;
          // Get whether or not font needs to be white or black based on tee color
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
      })
    );
  }

  init() {
    this.aggregated = this.teeData.Aggregated;
    if (!this.aggregated) this.aggregated = false;
    this.completedTees = this.scoreData.scorecard.filter((tee: any) => {
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
      if (!this.teeData.Tee1) this.selectedTee1 = this.completedTees[0].id;
      else this.selectedTee1 = this.teeData.Tee1;
      if (!this.teeData.Tee2) this.selectedTee2 = this.completedTees[1].id;
      else this.selectedTee2 = this.teeData.Tee2;
      for (let tee of this.scoreData.scorecard) {
        if (this.selectedTee1 == tee.id) this.tee1 = tee;
        if (this.selectedTee2 == tee.id) this.tee2 = tee;
      }
    } catch (error) {}
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
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.teeData.id) {
          tee.Aggregated = this.aggregated;
          tee.Tee1 = this.selectedTee1;
          tee.Tee2 = this.selectedTee2;
        }
      }
      await this.courseService.updateColumn(
        this.scoreData.googleDetails.reference,
        this.scoreData.scorecard,
        'scorecard'
      );
      // update teeData with updated scorecard data for in progress score
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.scoreData.teeData.id) {
          this.scoreData.teeData = tee;
          await this.scoreService.update(this.scoreData, 'teeData');
        }
      }
      this.scoreService.inProgressScoreData.next(this.scoreData);
    } else {
      this.popUp = false;
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.teeData.id) {
          tee.Aggregated = this.aggregated;
        }
      }
      await this.courseService.updateColumn(
        this.scoreData.googleDetails.reference,
        this.scoreData.scorecard,
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
        this.scoreData.googleDetails.reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );
      this.scoreData.scorecard = response.scorecard;
      // update teeData with updated scorecard data for in progress score
      for (let tee of this.scoreData.scorecard) {
        if (tee.id == this.scoreData.teeData.id) {
          this.scoreData.teeData = tee;
          await this.scoreService.update(this.scoreData, 'teeData');
        }
      }
      this.scoreService.inProgressScoreData.next(this.scoreData);
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
      this.scoreData.googleDetails.reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );
    this.scoreData.scorecard = response.scorecard;
    // update teeData with updated scorecard data for in progress score
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == this.scoreData.teeData.id) {
        this.scoreData.teeData = tee;
        await this.scoreService.update(this.scoreData, 'teeData');
      }
    }
    this.scoreService.inProgressScoreData.next(this.scoreData);
    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }

  checkForAggregation() {
    if (this.aggregated && this.scoreData.scorecard.length < 2) {
      this.alertService.alert(
        'You need two different tees for an aggregated tee.',
        { color: 'green', content: 'Accept' }
      );
      document.getElementById('checkbox' + this.teeData.id)?.click();
      return;
    } else if (this.aggregated) {
      this.completedTees = this.scoreData.scorecard.filter((tee: any) => {
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
      for (let tee of this.scoreData.scorecard) {
        if (this.selectedTee1 == tee.id) this.tee1 = tee;
        if (this.selectedTee2 == tee.id) this.tee2 = tee;
      }
    }
  }

  checkTeeData(tee: any) {
    if (this.scoreData.courseDetails.nineHoleGolfCourse) {
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
