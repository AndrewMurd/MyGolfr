import { Component } from '@angular/core';
import { CourseDetailsService } from '../../services/course-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { ScoreService } from '../../services/score.service';
import { AuthenticationService } from '../../services/authentication.service';
import { createRange, getColorWhite, getRGB } from '../../utilities/functions';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-start-round-page',
  templateUrl: './start-round-page.component.html',
  styleUrls: ['./start-round-page.component.scss'],
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
        }
      })
    );
    this.loadingService.loading.next(false);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  selectTee(tee: any) {
    this.popUp = true;
    this.teeDropdown(false);
    this.selectedTee = tee;
  }

  async startRound() {
    this.loadingService.loading.next(true);
    try {
      await this.scoreService.newScore(
        this.userData.id,
        this.courseData.id,
        this.selectedTee,
        this.hdcpType,
        this.sqlDate()
      );
      // navigate to round in progress page
      const response: any = await this.scoreService.getUser(
        this.userData.id,
        0
      );
      this.router.navigate(['/round/in-progress', response.scores[0].id]);
      setTimeout(() => {
        this.scoreService.inProgressScoreData.next(response.scores[0]);
      });
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

  checkCompleteTees() {
    if (this.courseData.courseDetails.nineHoleGolfCourse) {
      this.completedTees = this.completedTees.filter((tee: any) => {
        return Object.keys(tee).length >= 31;
      });
    } else {
      this.completedTees = this.completedTees.filter((tee: any) => {
        return Object.keys(tee).length === 32 * 2;
      });
    }
    this.completedTees = this.completedTees.sort((a: any, b: any) => {
      return a.Position - b.Position;
    });
  }

  sqlDate() {
    const date = new Date();
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  alertUserOfTees() {
    if (this.completedTees.length == 0) {
      this.alertService.alert(
        'You must complete a tee in the scorecard to start a round.',
        { color: 'green', content: 'Accept' }
      );
    }
  }

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
