import { Component } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { AuthenticationService } from '../../services/authentication.service';
import { createRange, getColorWhite, getRGB } from '../../utilities/functions';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import * as moment from 'moment';

// start round page where user can start a new round based on completed tees in scorecard
@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss'],
  animations: [
    trigger('openCloseScorecard', [
      state(
        'open',
        style({
          transform: 'scale(1, 1)',
        })
      ),
      state(
        'closed',
        style({
          transform: 'scale(1, 0)',
        })
      ),
      transition('open => closed', [animate('0.2s')]),
      transition('closed => open', [animate('0.2s')]),
    ]),
  ],
})
export class StartRoundPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  courseData: any;
  completedTees: any = [];
  showScorecard: boolean = false;
  openTeeDropdown: Boolean = false;
  selectedTee: any;
  hdcpType: string = 'none';
  popUp: boolean = false;
  hdcp: string = '0';
  createRange: Function = createRange;
  getRGB: Function = getRGB;
  getColorWhite: Function = getColorWhite;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        const response: any = await this.courseService.get(params['id']);
        this.courseService.courseData.next(response.course);
      })
    );

    this.subscriptions.add(
      this.authService.user.asObservable().subscribe((value) => {
        if (value) {
          this.userData = value;
          if (this.userData.hdcp) {
            this.hdcp = this.userData.hdcp;
          }
        }
      })
    );

    this.subscriptions.add(
      this.courseService.courseData.asObservable().subscribe(async (value) => {
        if (value) {
          this.courseData = value;
          this.completedTees = JSON.parse(
            JSON.stringify(this.courseData.scorecard)
          );
          this.checkCompleteTees();
          this.loadingService.loading.next(false);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  selectTee(tee: any) {
    this.popUp = true;
    this.teeDropdown(false);
    this.selectedTee = tee;
  }
  // start round based on selected inputs
  async startRound() {
    this.loadingService.loading.next(true);
    try {
      if (this.hdcpType == 'basic') {
        // need a slope and rating for calculating hdcp
        if (
          this.selectedTee.Rating != '' &&
          this.selectedTee.Rating != undefined &&
          this.selectedTee.Slope != '' &&
          this.selectedTee.Rating != undefined
        ) {
          await this.scoreService.newScore(
            this.userData.id,
            this.courseData.id,
            this.selectedTee,
            this.hdcpType,
            moment.utc().format('YYYY-MM-DD HH:mm:ss')
          );
          const response: any = await this.scoreService.getUser(
            this.userData.id,
            0
          );
          this.router.navigate(['/round/in-progress', response.scores[0].id]);
          // update the current in progress round
          setTimeout(() => {
            this.scoreService.inProgressScoreData.next(response.scores[0]);
          });
        } else {
          this.alertService.alert(
            'Must enter Slope Rating and Course Rating for selected tee in Basic Mode (Needed for Handicap Calculation).',
            {
              color: 'green',
              content: 'Accept',
            }
          );
          this.popUp = false;
          this.showScorecard = true;
        }
      } else {
        await this.scoreService.newScore(
          this.userData.id,
          this.courseData.id,
          this.selectedTee,
          this.hdcpType,
          moment.utc().format('YYYY-MM-DD HH:mm:ss')
        );
        const response: any = await this.scoreService.getUser(
          this.userData.id,
          0
        );
        this.router.navigate(['/round/in-progress', response.scores[0].id]);
        setTimeout(() => {
          this.scoreService.inProgressScoreData.next(response.scores[0]);
        });
      }
    } catch (error) {
      console.log(error);
    }
    this.loadingService.loading.next(false);
  }

  async setCurrentHole(a: any) {
    if (a == 'course') {
      document.getElementById('selectTeeBtn')!.style.top = '65px';
    } else {
      document.getElementById('selectTeeBtn')!.style.top = '145px';
    }
  }
  // checks which tees are complete
  // to prevent user from starting round with incomplete data for selected tee
  checkCompleteTees() {
    if (this.courseData.courseDetails.nineHoleGolfCourse) {
      this.completedTees = this.completedTees.filter((tee: any) => {
        let count = 0;
        for (let key of Object.keys(tee)) {
          if (key.slice(0, 2) != 'S.I') {
            count++;
          }
        }
        return count >= 26;
      });
    } else {
      this.completedTees = this.completedTees.filter((tee: any) => {
        let count = 0;
        for (let key of Object.keys(tee)) {
          if (key.slice(0, 2) != 'S.I') {
            count++;
          }
        }
        return count >= 62;
      });
    }
    this.completedTees = this.completedTees.sort((a: any, b: any) => {
      return a.Position - b.Position;
    });
  }
  // alert user if there are no tees ready to be played with
  alertUserOfTees() {
    if (this.completedTees.length == 0) {
      this.alertService.alert(
        'You must complete a tee in the scorecard to start a round.',
        { color: 'green', content: 'Accept' }
      );
    }
  }
  // set height of tee dropdown dynamically
  teeDropdown(set: boolean) {
    this.openTeeDropdown = set;
    let pixels = 44 * this.completedTees.length;
    try {
      if (this.openTeeDropdown) {
        document.getElementById(
          'selectTeeBtnSlide'
        )!.style.height = `${pixels}px`;
      } else {
        document.getElementById('selectTeeBtnSlide')!.style.height = '0px';
      }
    } catch (error) {}
  }
}
