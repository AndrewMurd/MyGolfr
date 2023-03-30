import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
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
  userData: any;
  showField: boolean = true;
  editing: boolean = false;
  value!: string;
  par: number = 0;
  borderClass: string = 'par';
  arrId: any;
  isWhite: boolean = false;

  constructor(
    private scoreService: ScoreService,
    private authService: AuthenticationService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.whiteEvent.subscribe((value: boolean) => {
        this.isWhite = value;
      })
    );

    this.subscriptions.add(
      this.authService.user.asObservable().subscribe(async (value) => {
        if (value) {
          this.userData = value;
          this.editing = false;
          if (this.data.userId == this.userData.id) {
            this.editing = true;
          } else {
            this.showField = false;
          }
        }
      })
    );

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
    if (!this.value && this.data.statusComplete == 1) {
      this.alertService.alert('Must Enter Strokes!', {
        color: 'green',
        content: 'Accept',
      });
      this.value = this.data.score[this.id];
      this.showField = false;
      return;
    }
    if (this.value) {
      this.showField = false;
    }

    this.data.score[this.id] = this.value;
    const response: any = await this.scoreService.update(this.data, 'score');
    this.data = response.scoreData;
    this.selectedScore
      ? this.scoreService.selectedScoreData.next(this.data)
      : this.scoreService.inProgressScoreData.next(this.data);

    const userData = this.authService.user.getValue();
    userData.hdcp = this.data.hdcp;
    this.authService.user.next(userData);

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
