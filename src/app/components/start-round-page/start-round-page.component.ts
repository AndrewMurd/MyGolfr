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
  tees: any = [];
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
          this.tees = JSON.parse(
            JSON.stringify(this.courseData.scorecard)
          );
          this.tees = this.tees.sort((a: any, b: any) => {
            return a.Position - b.Position;
          });
          this.loadingService.loading.next(false);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getTee(id: string) {
    for (let tee of this.courseData.scorecard) {
      if (tee.id == id) {
        return tee;
      }
    }
  }

  selectTee(tee: any) {
    this.popUp = true;
    this.teeDropdown(false);
    this.selectedTee = tee;
  }
  // start round based on selected inputs
  async startRound() {
    if (!this.userData) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadingService.loading.next(true);
    try {
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
      this.scoreService.inProgressScoreData.next(response.scores[0]);
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
  // alert user if there are no tees ready to be played with
  alertUserOfTees() {
    if (this.tees.length == 0) {
      this.alertService.alert(
        'You must complete a tee in the scorecard to start a round.',
        { color: 'green', content: 'Accept' }
      );
    }
  }
  // set height of tee dropdown dynamically
  teeDropdown(set: boolean) {
    this.openTeeDropdown = set;
    let pixels = 44 * this.tees.length;
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
