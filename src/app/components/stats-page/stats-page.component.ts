import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from 'src/app/utilities/functions';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.scss'],
})
export class StatsPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  scores: any;
  selectedUser: boolean = true;
  userName: string = 'Guest';
  timePlayed: string = '';
  lowestScore: any;
  highestScore: any;
  scoreAvg: string = '0';

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        try {
          const response: any = await this.scoreService.getUser(
            params['id'],
            1
          );
          this.scores = response.scores;
          console.log(this.scores);
          this.userName = this.scores[0].username;

          let sumTime = 0, scoreSum = 0;
          this.lowestScore = this.scores[0];
          this.highestScore = this.scores[0];
          for (let score of this.scores) {
            sumTime += new Date(
              convertSqlDateTime(score.endTime) -
                convertSqlDateTime(score.startTime)
            ).getTime();

            scoreSum += Number(this.calculateShotsToPar(score));

            if (
              Number(this.calculateShotsToPar(this.lowestScore)) >
              Number(this.calculateShotsToPar(score))
            ) {
              this.lowestScore = score;
            }
            if (
              Number(this.calculateShotsToPar(this.lowestScore)) <
              Number(this.calculateShotsToPar(score))
            ) {
              this.highestScore = score;
            }
          }
          this.timePlayed = this.msToTime(sumTime);
          this.scoreAvg = (scoreSum / this.scores.length).toFixed(2);

          this.loadingService.loading.next(false);
        } catch (error) {}
        this.subscriptions.add(
          this.authService.user.asObservable().subscribe(async (value) => {
            if (value) {
              this.userData = value;
              this.selectedUser = true;
              if (this.scores[0]?.userId == this.userData.id)
                this.selectedUser = false;
            }
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  navigateToRound(score: any) {
    this.router.navigate(['/round', score.id]);
  }

  calculateShotsToPar(score: any) {
    const scoreToPar =
      score?.score.In +
      score?.score.Out -
      (score?.teeData.SumInPar + score?.teeData.SumOutPar);
    if (scoreToPar < 0 || scoreToPar == 0) {
      return `${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    }
    return '';
  }

  msToTime(s: number) {
    function pad(n: any, z: any = 0) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }

    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs);
  }
}
