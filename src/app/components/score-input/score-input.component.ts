import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ScoreService } from 'src/app/services/score.service';

// input used in active tee for inputting score for each hole
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
  isPhone!: boolean;
  borderWidth: string = '20px';

  constructor(
    private scoreService: ScoreService,
    private authService: AuthenticationService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.onResize();
    // get font color
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
          // check whether to allow user to edit the score based on logged in user
          if (this.data.userId == this.userData.id) {
            this.editing = true;
          } else {
            this.showField = false;
          }
        } else {
          this.showField = false;
        }
      })
    );
    // set value from previously entered score got from database
    if (this.data.score[this.id]) {
      this.value = this.data.score[this.id];
      this.showField = false;
    }
    // get par for this hole
    this.par = this.data.teeData['P' + this.id];

    this.setBorder();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async submit() {
    // if score is completed and the user removed the value alert them and reset field
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
    // update score for this round
    this.data.score[this.id] = this.value;
    const response: any = await this.scoreService.update(this.data, 'score');
    this.data = response.scoreData;
    this.selectedScore
      ? this.scoreService.selectedScoreData.next(this.data)
      : this.scoreService.inProgressScoreData.next(this.data);
    // update hdcp based on changed score value
    // hdcp will only change on backend if this score is completed
    const userData = this.authService.user.getValue();
    userData.hdcp = this.data.hdcp;
    this.authService.user.next(userData);
    // update border for the new score
    this.setBorder();
  }
  // set the border based on score
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

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
    if (Number(this.value) >= 10) {
      if (this.isPhone) {
        this.borderWidth = '17px';
      } else {
        this.borderWidth = '30px';
      }
    } else {
      if (this.isPhone) {
        this.borderWidth = '12px';
      } else {
        this.borderWidth = '20px';
      }
    }
  }
}
