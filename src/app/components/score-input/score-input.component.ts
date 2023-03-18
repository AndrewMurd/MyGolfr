import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-score-input',
  templateUrl: './score-input.component.html',
  styleUrls: ['./score-input.component.scss'],
})
export class ScoreInputComponent {
  subscriptions: Subscription = new Subscription();
  @Input() id!: string;
  @Input() placeholder!: string;
  @Input() data: any;
  @Input() submitInput!: Observable<any>;
  @Input() whiteEvent!: Observable<any>;
  @Input() selectedScore: boolean = false;
  @Output() onSubmitInput: EventEmitter<any> = new EventEmitter();
  showField: boolean = true;
  editing: boolean = false;
  value!: string;
  par: number = 0;
  borderClass: string = 'par';
  arrId: any;
  isWhite: boolean = false;

  constructor(private scoreService: ScoreService) {}

  ngOnInit() {
    this.subscriptions.add(this.whiteEvent.subscribe((value: boolean) => {
      this.isWhite = value;
    }));

    if (this.data.score[this.id]) {
      this.value = this.data.score[this.id];
      this.showField = false;
    }
    this.par = this.data.teeData['P' + this.id];

    this.setBorder();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async submit() {
    if (this.value) {
      this.showField = false;
    }

    this.data.score[this.id] = this.value;
    const response: any = await this.scoreService.update(
      this.data.id,
      this.data.score,
      'score'
    );
    this.data.score = response.data;
    this.selectedScore ? this.scoreService.selectedScoreData.next(this.data) : this.scoreService.inProgressScoreData.next(this.data);

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
