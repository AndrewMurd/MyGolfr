import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from 'src/app/utilities/functions';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.scss'],
})
export class StatsPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  scores: any = [];
  selectedUser: boolean = true;
  userName: string = 'Guest';
  timePlayed: string = '0d 0h 0m';
  lowestScore: any = null;
  highestScore: any = null;
  scoreAvg: string = 'N/A';

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

          let sumTime = 0,
            scoreSum = 0;
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
          this.timePlayed = this.dhm(sumTime);
          this.scoreAvg = (scoreSum / this.scores.length).toFixed(2);

          // const canvas1: any = document.getElementById('scoreDoughnutChart');
          // new Chart(canvas1, {
          //   type: 'doughnut',
          //   data: {
          //     labels: typesOfScore.map(
          //       (row) => `(${row.value}) ${row.label}`
          //     ),
          //     datasets: [
          //       {
          //         data: typesOfScore.map((row) => row.value),
          //         backgroundColor: [
          //           'green',
          //           'white',
          //           'yellow',
          //           'red',
          //           'black',
          //         ],
          //       },
          //     ],
          //   },
          //   options: {
          //     cutout: 40,
          //     color: 'black',
          //     borderColor: 'grey',
          //     responsive: false,
          //     plugins: {
          //       legend: {
          //         position: 'right',
          //         maxWidth: 185,
          //         labels: {
          //           boxWidth: 15,
          //         }
          //       },
          //     },
          //   },
          // })

          this.loadingService.loading.next(false);
        } catch (error) {
          this.loadingService.loading.next(false);
        }
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
    if (!score) return 'N/A';
    const scoreToPar =
      score?.score.In +
      score?.score.Out -
      (score?.teeData.SumInPar + score?.teeData.SumOutPar);
    if (scoreToPar < 0 || scoreToPar == 0) {
      return `${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    }
    return 'N/A';
  }

  dhm(ms: number) {
    const days = Math.floor(ms / (24*60*60*1000));
    const daysms = ms % (24*60*60*1000);
    const hours = Math.floor(daysms / (60*60*1000));
    const hoursms = ms % (60*60*1000);
    const minutes = Math.floor(hoursms / (60*1000));
    const minutesms = ms % (60*1000);
    const sec = Math.floor(minutesms / 1000);
    return days + "d " + hours + "h " + minutes + "m ";
  }
}
