import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from 'src/app/utilities/functions';
import { Chart, registerables } from 'chart.js';
import {
  convertDateTime,
  numberOfHolesPlayed,
} from '../../utilities/functions';

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
  convertDateTime: Function = convertDateTime;
  numberOfHolesPlayed: Function = numberOfHolesPlayed;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(
      this.route.params.subscribe(async (params) => {
        try {
          const limit = 20;
          const response: any = await this.scoreService.getUser(
            params['id'],
            1,
            limit
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
              Number(this.calculateShotsToPar(this.highestScore)) <
              Number(this.calculateShotsToPar(score))
            ) {
              this.highestScore = score;
            }
          }
          this.timePlayed = this.dhm(sumTime);
          const scoreAvg = Number((scoreSum / this.scores.length).toFixed(2));
          if (scoreAvg < 0 || scoreAvg == 0) {
            this.scoreAvg = `${scoreAvg}`;
          } else if (scoreAvg > 0) {
            this.scoreAvg = `+${scoreAvg}`;
          }
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

              const canvas: any = document.getElementById('indexChart');
              const ctx = canvas.getContext('2d');

              ctx.translate(50, 30);

              var greenPart = ctx.createLinearGradient(0, 0, 0, 335);
              greenPart.addColorStop(0, 'red');
              greenPart.addColorStop(1, 'yellow');

              var whitePart = ctx.createLinearGradient(0, 0, 0, 335);
              whitePart.addColorStop(0, 'green');
              whitePart.addColorStop(1, 'yellow');

              var width = 40;
              ctx.lineWidth = width;

              const size = 150;

              // First we make a clipping region for the left half
              ctx.save();
              ctx.beginPath();
              ctx.rect(-width, -width, size + width, size + 200 + width * 2);
              ctx.clip();

              // Then we draw the left half
              ctx.strokeStyle = greenPart;
              ctx.beginPath();
              ctx.arc(size, size, size, 0, Math.PI * 2, false);
              ctx.stroke();

              ctx.restore(); // restore clipping region to default

              // Then we make a clipping region for the right half
              ctx.save();
              ctx.beginPath();
              ctx.rect(size, -width, size + width, size + 200 + width * 2);
              ctx.clip();

              // Then we draw the right half
              ctx.strokeStyle = whitePart;
              ctx.beginPath();
              ctx.arc(size, size, size, 0, Math.PI * 2, false);
              ctx.stroke();

              ctx.restore();

              // A handicap ranges from [0, 54]
              // The angles range from [1.5, -0.5] * Math.PI
              // We need to convert handicap range to angle range while keeping ratio
              const handicapRange = 54 - 0;
              const anglesRange = -0.5 - 1.5;
              const angleValue =
                ((54 - 15 - 0) * anglesRange) / handicapRange +
                1.5;

              // grey out for handicap
              ctx.strokeStyle = 'grey';
              ctx.beginPath();
              ctx.arc(
                size,
                size,
                size,
                Math.PI * 1.5,
                Math.PI * angleValue,
                true
              );
              ctx.lineWidth = 41;
              ctx.stroke();

              // const canvas1: any = document.getElementById('overlayChartjs');
              // const factor = 54 - Math.round(this.userData.hdcp);
              // const handicapIndexChart = [
              //   { label: 'handicap', value: Math.round(this.userData.hdcp) },
              //   { label: 'space', value: factor },
              // ];
              // console.log(handicapIndexChart);

              // new Chart(canvas1, {
              //   type: 'doughnut',
              //   data: {
              //     labels: handicapIndexChart.map(
              //       (row) => `(${row.value}) ${row.label}`
              //     ),
              //     datasets: [
              //       {
              //         data: handicapIndexChart.map((row) => row.value),
              //         borderWidth: 0,
              //         backgroundColor: ['green', 'grey'],
              //       },
              //     ],
              //   },
              //   options: {
              //     cutout: 80,
              //     responsive: false,
              //     events: [],
              //     plugins: {
              //       tooltip: {
              //         enabled: false,
              //       },
              //       legend: {
              //         display: false,
              //       },
              //     },
              //   },
              // });
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
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);
    return days + 'd ' + hours + 'h ' + minutes + 'm ';
  }
}
