import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from '../../utilities/functions';

@Component({
  selector: 'app-round-page',
  templateUrl: './round-page.component.html',
  styleUrls: ['./round-page.component.scss'],
})
export class RoundPageComponent {
  subscriptions: Subscription = new Subscription();
  scoreData: any;
  addressInfo: string = '';
  date: any;
  timeDifference: any;
  scoreLn: any;
  charts: any = [];

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
        const response: any = await this.scoreService.get(params['id']);
        this.scoreData = response.score;
        this.scoreService.selectedScoreData.next(this.scoreData);
        this.loadingService.loading.next(false);

        let count = 0;
        for (let [key, value] of Object.entries(this.scoreData.score)) {
          if (value != '' && key != 'In' && key != 'Out') {
            count++;
          }
        }
        this.scoreLn = count;

        this.date = convertSqlDateTime(this.scoreData.startTime);

        this.timeDifference = new Date(
          convertSqlDateTime(this.scoreData.endTime) - this.date
        )
          .toISOString()
          .slice(11, 19);

        let stringArray =
          this.scoreData.googleDetails.plus_code.compound_code.split(/(\s+)/);
        this.addressInfo = '';
        for (let i = 1; i < stringArray.length; i++) {
          this.addressInfo += stringArray[i];
        }
      })
    );

    this.subscriptions.add(
      this.scoreService.selectedScoreData.asObservable().subscribe((value) => {
        if (value) {
          this.scoreData = value;

          for (let chart of this.charts) {
            chart.destroy();
          }

          const canvas: any = document.getElementById('scoreLineChart');
          const canvas1: any = document.getElementById('scoreDoughnutChart');

          const scorecardPar = [];
          const score = [];

          if (!this.scoreData?.teeData) return;
          let sum = 0;
          for (let [key, value] of Object.entries(this.scoreData.teeData)) {
            if (key.charAt(0) == 'P' && key != 'Position') {
              sum += Number(value);
              scorecardPar.push({
                hole: key.length == 2 ? key.charAt(1) : key.slice(-2),
                value: value,
                sum: sum,
              });
            }
          }
          sum = 0;
          for (let [key, value] of Object.entries(this.scoreData.score)) {
            if (key != 'In' && key != 'Out') {
              sum += Number(value);
              score.push({ hole: key, value: value, sum: sum });
            }
          }

          this.charts.push(
            new Chart(canvas, {
              type: 'line',
              data: {
                labels: scorecardPar.map((row) => row.hole),
                datasets: [
                  {
                    label: 'Par',
                    data: scorecardPar.map((row) => row.sum),
                    backgroundColor: 'white',
                    borderColor: 'white',
                    pointRadius: 0,
                    borderDash: [6],
                  },
                  {
                    label: 'Score',
                    data: score.map((row) => row.sum),
                    backgroundColor: 'green',
                    borderColor: 'green',
                    pointRadius: 0,
                  },
                ],
              },
              options: {
                color: 'black',
                scales: {
                  x: {
                    ticks: {
                      color: 'black',
                    },
                    grid: {
                      color: 'black',
                    },
                  },
                  y: {
                    ticks: {
                      color: 'black',
                    },
                    grid: {
                      color: 'black',
                    },
                  },
                },
              },
            })
          );

          let birdies = 0,
            par = 0,
            bogeys = 0,
            double = 0,
            triple = 0;
          for (let i = 0; i < 18; i++) {
            const diff = Number(score[i].value) - Number(scorecardPar[i].value);
            if (diff == 0) {
              par++;
            } else if (diff <= -1) {
              birdies++;
            } else if (diff == 1) {
              bogeys++;
            } else if (diff == 2) {
              double++;
            } else if (diff >= 3) {
              triple++;
            }
          }

          const typesOfScore = [
            { label: 'Birdies or Better', value: birdies },
            { label: 'Par', value: par },
            { label: 'Bogeys', value: bogeys },
            { label: 'Double Bogeys', value: double },
            { label: 'Triple Bogeys or Worse', value: triple },
          ];

          this.charts.push(
            new Chart(canvas1, {
              type: 'doughnut',
              data: {
                labels: typesOfScore.map(
                  (row) => `(${row.value}) ${row.label}`
                ),
                datasets: [
                  {
                    data: typesOfScore.map((row) => row.value),
                    backgroundColor: [
                      'green',
                      'white',
                      'yellow',
                      'red',
                      'black',
                    ],
                  },
                ],
              },
              options: {
                cutout: 40,
                color: 'black',
                borderColor: 'grey',
                responsive: false,
                plugins: {
                  legend: {
                    position: 'right',
                    maxWidth: 185,
                    labels: {
                      boxWidth: 15,
                    }
                  },
                },
              },
            })
          );
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    for (let chart of this.charts) {
      chart.destroy();
    }
  }

  calculateShotsToPar() {
    const scoreToPar =
      this.scoreData?.score.In +
      this.scoreData?.score.Out -
      (this.scoreData?.teeData.SumInPar + this.scoreData?.teeData.SumOutPar);
    if (scoreToPar < 0 || scoreToPar == 0) {
      return `${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    }
    return '';
  }
}
