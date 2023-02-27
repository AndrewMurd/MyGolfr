import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ScoreService } from 'src/app/Service/score.service';

@Component({
  selector: 'app-score-input',
  templateUrl: './score-input.component.html',
  styleUrls: ['./score-input.component.scss'],
})
export class ScoreInputComponent {
  @Input() id!: string;
  @Input() placeholder!: string;
  @Input() data: any;
  @Input() submitInput!: Observable<any>;
  @Input() whiteEvent!: Observable<any>;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter();
  showField: boolean = true;
  editing: boolean = false;
  value!: string;
  par: number = 0;
  borderClass: string = 'par';
  arrId: any;
  isWhite: boolean = false;
  courseId!: string;

  constructor(private scoreService: ScoreService) {}

  ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.whiteEvent.subscribe((value: boolean) => {
      this.isWhite = value;
    });
  
    if (this.data.score[this.id]) {
      this.value = this.data.score[this.id];
      this.par = this.data.teeData["P"+this.id];
      this.showField = false;
    }

    this.setBorder();
  }

  async submit() {
    if (!this.value) {
      alert('Must enter value!');
      return;
    }

    this.showField = false;

    this.data.score[this.id] = this.value;
    const response: any = await this.scoreService.update(
      this.data.id,
      this.data.score,
      'score'
    );
    this.data.score = response.data;
    this.scoreService.scoreData.next(this.data);

    this.setBorder();
  }

  setBorder() {
    const diff = Number(this.value) - this.par;
    if (diff == 0) {
      this.borderClass = 'par';
    } else if (diff == -1) {
      this.borderClass = 'birdie';
    } else if (diff <= -2) {
      this.borderClass = 'eagle';
    } else if (diff == 1) {
      this.borderClass = 'bogey';
    } else if (diff >= 2) {
      this.borderClass = 'doublebogey';
    }
  }
}