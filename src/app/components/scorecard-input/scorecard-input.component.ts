import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-scorecard-input',
  templateUrl: './scorecard-input.component.html',
  styleUrls: ['./scorecard-input.component.scss'],
})
export class ScorecardInputComponent {
  @Input() id!: string;
  @Input() width: string = '85%';
  @Input() placeholder!: string;
  @Input() data: any;
  @Input() events!: Observable<any>;
  @Input() whiteEvent!: Observable<any>;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter();
  showField: boolean = true;
  value!: string;
  arrId: any;
  eventsSubscription!: Subscription;
  isWhite: boolean = false;

  constructor(private courseService: CourseDetailsService) {}

  ngOnInit() {
    // this is not working when i emit from parent component
    this.whiteEvent.subscribe((value: boolean) => {
      console.log(this.isWhite);
      this.isWhite = value;
    });

    this.arrId = this.id.split(',');

    this.arrId[0] = this.arrId[0].trim();
    this.arrId[1] = this.arrId[1].trim();

    if (this.arrId[0] === this.data.id) {
      if (this.data[this.arrId[1]]) {
        this.showField = false;
        this.value = this.data[this.arrId[1]];
      }
    }

    if (this.events) {
      this.eventsSubscription = this.events.subscribe((value) => {
        if (this.arrId[1] == value.id[1]) {
          this.showField = false;
          this.value = value.value;
        }
      });
    }
  }

  async submit() {
    if (!this.value) {
      alert('Must enter value!');
      return;
    }

    this.showField = false;

    this.courseService.setScorecard(
      JSON.parse(localStorage.getItem('selectedCourse')!).reference,
      { id: this.arrId, value: this.value }
    );

    this.onSubmitInput.emit({ id: this.arrId, value: this.value });
  }

  showInput() {
    this.showField = true;
  }
}
