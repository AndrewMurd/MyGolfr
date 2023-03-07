import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { CourseDetailsService } from '../../services/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';

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
  scorecard: any;
  scoreData: any;
  editing: boolean = false;
  color!: string;
  nameColor!: string;
  displayColorPicker: boolean = false;
  displayColorNamer: boolean = false;
  displayInputSelector: boolean = false;
  displayColorName: boolean = true;
  isWhite!: boolean;
  colorEventsSubject: Subject<boolean> = new Subject<boolean>();
  factor: number = 170;
  createRange: Function = createRange;
  getRGB: Function = getRGB;
  getColorWhite: Function = getColorWhite;

  constructor(
    private courseService: CourseDetailsService,
    private scoreService: ScoreService
  ) {}

  ngOnInit() {
    this.color = this.teeData.Color;
    this.nameColor = this.teeData.ColorName;

    if (this.selectedScore) {
      this.subscriptions.add(
        this.scoreService.selectedScoreData
          .asObservable()
          .subscribe((value) => {
            if (value) {
              this.scoreData = value;
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
            }
          })
      );
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
        this.scoreData.googleDetails.reference,
        { id: [this.teeData.id, 'ColorName'], value: this.nameColor }
      );

      this.scoreData.scorecard = response.scorecard;
      this.scoreService.inProgressScoreData.next(this.scoreData);

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
      this.scoreData.googleDetails.reference,
      { id: [this.teeData.id, 'Color'], value: this.color }
    );
    this.scoreData.scorecard = response.scorecard;
    this.scoreService.inProgressScoreData.next(this.scoreData);

    this.onSubmitofInput.emit({
      id: [this.teeData.id, 'Color'],
      value: this.color,
    });
  }
}
