import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { Observable, Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { AlertService } from 'src/app/services/alert.service';

// input used for editing scorecard data
@Component({
  selector: 'app-scorecard-input',
  templateUrl: './scorecard-input.component.html',
  styleUrls: ['./scorecard-input.component.scss'],
})
export class ScorecardInputComponent {
  subscriptions: Subscription = new Subscription();
  @Input() id!: string;
  @Input() placeholder!: string;
  @Input() data: any;
  @Input() submitInput!: Observable<any>;
  @Input() whiteEvent!: Observable<any>;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter();
  showField: boolean = true;
  editing: boolean = false;
  value!: string;
  arrId: any;
  isWhite: boolean = false;

  constructor(
    private courseService: CourseDetailsService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.whiteEvent.subscribe((value: boolean) => {
      this.isWhite = value;
    });
    // get hole id from tee
    this.arrId = this.id.split(',');
    this.arrId[0] = this.arrId[0].trim();
    this.arrId[1] = this.arrId[1].trim();
    // set value of this input from database
    if (this.arrId[0] === this.data.id) {
      if (this.data[this.arrId[1]]) {
        this.showField = false;
        this.value = this.data[this.arrId[1]];
      }
    }

    this.subscriptions.add(
      this.courseService.editingScoreCard.asObservable().subscribe((value) => {
        this.editing = value;
      })
    );
    // if slope or rating was changed on back nine or front nine they change for both tee components
    // change this current scorecard value to updated value without reload from database
    if (this.submitInput) {
      this.subscriptions.add(
        this.submitInput.subscribe((value) => {
          if (this.data.id == value.id[0] && this.arrId[1] == value.id[1]) {
            this.showField = false;
            this.value = value.value;
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async submit() {
    this.showField = false;
    this.onSubmitInput.emit({ id: this.arrId, value: this.value });
  }
}
