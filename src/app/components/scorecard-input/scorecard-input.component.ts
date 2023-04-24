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
            // this.showField = false;
            this.value = value.value;
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async submit(ev: any) {
    if (ev.keyCode == 13) {
      // if (!this.value || this.value == '') {
      //   this.alertService.alert('Must enter Value!', {
      //     color: 'green',
      //     content: 'Accept',
      //   });
      //   return;
      // }
      if (this.value.slice(-1) == '.') this.value = this.value.slice(0, -1);
      this.showField = false;
      this.onSubmitInput.emit({ id: this.arrId, value: this.value });
    }
  }

  validate() {
    if (
      (this.arrId[1].charAt(0) == 'H' ||
        this.arrId[1].charAt(0) == 'P' ||
        this.arrId[1].charAt(0) == 'SI') &&
      this.value.split('.').length == 2
    ) {
      // check if decimal was added in proper input
      setTimeout(() => {
        this.value = this.value.slice(0, -1);
      });
    } else if (!this.isNumeric(this.value)) {
      // check if input is number
      setTimeout(() => {
        this.value = '';
      });
    } else if (
      this.arrId[1].charAt(0) == 'P' &&
      (Number(this.value) < 3 || Number(this.value) > 6)
    ) {
      // min - max
      setTimeout(() => {
        this.value = '';
      });
    } else {
      this.onSubmitInput.emit({ id: this.arrId, value: this.value });
    }
  }

  isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
}
