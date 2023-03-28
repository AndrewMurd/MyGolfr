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
  usedForHdcpScores: any = [];
  selectedUser: boolean = true;
  userName: string = 'Guest';
  timePlayed: string = '0d 0h 0m';
  lowestScore: any = null;
  highestScore: any = null;
  scoreAvg: string = 'N/A';
  limit: any = 40;
  avgScoreToParData: any = [];
  typeOfScore: any = {
    'Eagles or Better': 0,
    Birdies: 0,
    Pars: 0,
    Bogeys: 0,
    'Double Bogeys': 0,
    'Triples or Worse': 0,
  };
  charts: any = [];
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
          const response: any = await this.scoreService.getUser(
            params['id'],
            1,
            this.limit
          );
          this.scores = response.scores;
          this.userName = this.scores[0].username;

          for (let score of this.scores) {
            if (score.usedForHdcp == 1) this.usedForHdcpScores.push(score);
          }

          this.loadingService.loading.next(false);
        } catch (error) {
          this.loadingService.loading.next(false);
        }
        this.subscriptions.add(
          this.authService.user.asObservable().subscribe(async (value) => {
            if (value) {
              this.userData = value;
              if (!this.userData.hdcp) this.userData.hdcp = 0.0;
              this.selectedUser = true;
              if (
                this.scores[0]?.userId == this.userData.id ||
                this.scores.length == 0
              )
                this.selectedUser = false;

              this.reload();

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
                ((54 - this.userData.hdcp - 0) * anglesRange) / handicapRange +
                1.5;

              // Animate arc on canvas
              requestAnimationFrame(animate);
              let eAngle = 1.5;
              function animate() {
                if (eAngle >= angleValue) {
                  draw(eAngle);
                  eAngle -= 0.01;
                  requestAnimationFrame(animate);
                }
              }

              function draw(eAngle: number) {
                ctx.strokeStyle = 'grey';
                ctx.beginPath();
                ctx.arc(
                  size,
                  size,
                  size,
                  Math.PI * 1.5,
                  Math.PI * eAngle,
                  true
                );
                ctx.lineWidth = 41;
                ctx.stroke();
              }

              if (this.userData.hdcp == 0) {
                requestAnimationFrame(animate);
                let eAngle = 1.5;
                function animate() {
                  if (eAngle >= 1.5) {
                    eAngle += 0.01;
                    draw(eAngle);
                    requestAnimationFrame(animate);
                  }
                }

                function draw(eAngle: number) {
                  ctx.strokeStyle = 'green';
                  ctx.beginPath();
                  ctx.arc(
                    size,
                    size,
                    size,
                    Math.PI * 1.5,
                    Math.PI * eAngle,
                    false
                  );
                  ctx.lineWidth = 41;
                  ctx.stroke();
                }
              }
            }
          })
        );
      })
    );
  }

  async newQuery() {
    this.scores.length = 0;
    let response: any;
    try {
      this.loadingService.loading.next(true);
      if (this.limit == 'all') {
        response = await this.scoreService.getUser(this.userData.id, 1, 0);
        this.scores = response.scores;
        this.userName = this.scores[0].username;
      } else if (this.limit == 'thisYear') {
        response = await this.scoreService.getUser(this.userData.id, 1, 0);
        for (let score of response.scores) {
          const currentDate = new Date();
          const newDate = convertSqlDateTime(score.endTime);
          if (newDate.getFullYear() == currentDate.getFullYear()) {
            this.scores.push(score);
          }
        }
        this.userName = this.scores[0].username;
      } else {
        response = await this.scoreService.getUser(
          this.userData.id,
          1,
          this.limit
        );
        this.scores = response.scores;
        this.userName = this.scores[0].username;
      }

      this.reload();
      this.loadingService.loading.next(false);
    } catch (error) {
      this.loadingService.loading.next(false);
    }
  }

  reload() {
    for (let chart of this.charts) {
      chart.destroy();
    }

    let sumTime = 0,
      scoreSum = 0;
    this.lowestScore = this.scores[0];
    this.highestScore = this.scores[0];
    const scoreByPar: any = { 3: [], 4: [], 5: [] };
    this.avgScoreToParData = [];
    this.typeOfScore = {
      'Eagles or Better': 0,
      Birdies: 0,
      Pars: 0,
      Bogeys: 0,
      'Double Bogeys': 0,
      'Triples or Worse': 0,
    };
    for (let score of this.scores) {
      sumTime += new Date(
        convertSqlDateTime(score.endTime) - convertSqlDateTime(score.startTime)
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

      let key: any, value: any;
      for ([key, value] of Object.entries(score.teeData)) {
        if (key.charAt(0) == 'P' && key != 'Position') {
          const hole = key.length == 2 ? key.charAt(1) : key.slice(-2);
          scoreByPar[value].push(Number(score.score[hole]));
        }
      }

      for ([key, value] of Object.entries(score.teeData)) {
        if (key.charAt(0) == 'P' && key != 'Position') {
          const hole = key.length == 2 ? key.charAt(1) : key.slice(-2);
          const diff = Number(score.score[hole]) - value;
          if (diff <= -2) {
            this.typeOfScore['Eagles or Better']++;
          } else if (diff <= -1) {
            this.typeOfScore['Birdies']++;
          } else if (diff == 0) {
            this.typeOfScore['Pars']++;
          } else if (diff == 1) {
            this.typeOfScore['Bogeys']++;
          } else if (diff == 2) {
            this.typeOfScore['Double Bogeys']++;
          } else if (diff >= 3) {
            this.typeOfScore['Triples or Worse']++;
          }
        }
      }
    }
    this.timePlayed = this.dhm(sumTime);
    const scoreAvg = Number((scoreSum / this.scores.length).toFixed(1));
    if (scoreAvg < 0 || scoreAvg == 0) {
      this.scoreAvg = `${scoreAvg}`;
    } else if (scoreAvg > 0) {
      this.scoreAvg = `+${scoreAvg}`;
    }

    let key: any, value: any;
    const colors = [];
    for ([key, value] of Object.entries(scoreByPar)) {
      let sum = 0;
      for (let val of value) {
        sum += val;
      }
      let avg = (Math.round((sum / value.length) * 10) / 10).toFixed(1);
      if (avg == 'NaN') avg = '0.0';
      this.avgScoreToParData.push({
        label: key,
        value: avg,
      });
      if (Math.round((sum / value.length) * 10) / 10 < 0) {
        colors.push('green');
      } else {
        colors.push('rgb(109, 0, 0)');
      }
    }

    const canvas: any = document.getElementById('scoreByParChart');
    this.charts.push(
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.avgScoreToParData.map(
            (row: any) => `(${row.value}) Par ${row.label}s`
          ),
          datasets: [
            {
              data: this.avgScoreToParData.map((row: any) => {
                if (row.value == '0.0') {
                  return Number(row.value);
                }
                return Number(row.value) - Number(row.label);
              }),
              backgroundColor: colors,
              borderRadius: 5,
              barThickness: 70,
            },
          ],
        },
        options: {
          color: 'black',
          scales: {
            x: {
              ticks: {
                display: false,
                // font: {
                //   size: 20,
                //   weight: 'bold',
                // },
                // color: 'black',
              },
              grid: {
                display: false,
              },
            },
            y: {
              ticks: {
                font: {
                  weight: 'bold',
                },
                stepSize: 1,
                callback: function (val: any, index) {
                  if (this.getLabelForValue(val) == '0') {
                    return 'E';
                  } else if (Number(this.getLabelForValue(val)) < 0) {
                    return this.getLabelForValue(val);
                  } else {
                    return '+' + this.getLabelForValue(val);
                  }
                },
                color: 'black',
              },
              grid: {
                color: 'black',
                tickBorderDash: [4],
              },
            },
          },
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    for (let [key, value] of Object.entries(this.typeOfScore)) {
      const newValue = Number(value) / this.scores.length;
      if (Number.isNaN(newValue)) {
        this.typeOfScore[key] = '0.0';
        continue;
      } else if (newValue == 0) {
        this.typeOfScore[key] = '0.0';
        continue;
      }
      if (newValue < 1) {
        this.typeOfScore[key] = newValue.toFixed(3);
        this.typeOfScore[key] = parseFloat(this.typeOfScore[key]);
        this.typeOfScore[key] = this.typeOfScore[key]
          .toString()
          .replace(/^./, '');
      } else {
        this.typeOfScore[key] = newValue.toFixed(1);
      }
    }

    const parChart: any = document.getElementById('doughnutChartPar');
    this.charts.push(
      new Chart(parChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'Pars'],
          datasets: [
            {
              data: [this.typeOfScore.Pars, 18 - this.typeOfScore.Pars],
              borderWidth: 0,
              backgroundColor: ['blue', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    const bogeysChart: any = document.getElementById('doughnutChartBogeys');
    this.charts.push(
      new Chart(bogeysChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'Bogeys'],
          datasets: [
            {
              data: [this.typeOfScore.Bogeys, 18 - this.typeOfScore.Bogeys],
              borderWidth: 0,
              backgroundColor: ['yellow', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    const birdiesChart: any = document.getElementById('doughnutChartBirdies');
    this.charts.push(
      new Chart(birdiesChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'Bogeys'],
          datasets: [
            {
              data: [this.typeOfScore.Birdies, 18 - this.typeOfScore.Birdies],
              borderWidth: 0,
              backgroundColor: ['green', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    const eaglesChart: any = document.getElementById('doughnutChartEagles');
    this.charts.push(
      new Chart(eaglesChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'Bogeys'],
          datasets: [
            {
              data: [
                this.typeOfScore['Eagles or Better'],
                18 - this.typeOfScore['Eagles or Better'],
              ],
              borderWidth: 0,
              backgroundColor: ['rgb(2, 207, 2)', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    const doubleBogeysChart: any = document.getElementById(
      'doughnutChartDoubleBogeys'
    );
    this.charts.push(
      new Chart(doubleBogeysChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'DoubleBogeys'],
          datasets: [
            {
              data: [
                this.typeOfScore['Double Bogeys'],
                18 - this.typeOfScore['Double Bogeys'],
              ],
              borderWidth: 0,
              backgroundColor: ['red', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );

    const tripleBogeys: any = document.getElementById(
      'doughnutChartTripleBogeys'
    );
    this.charts.push(
      new Chart(tripleBogeys, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'TripleBogeys'],
          datasets: [
            {
              data: [
                this.typeOfScore['Triples or Worse'],
                18 - this.typeOfScore['Triples or Worse'],
              ],
              borderWidth: 0,
              backgroundColor: ['black', 'grey'],
            },
          ],
        },
        options: {
          cutout: 30,
          events: [],
          plugins: {
            tooltip: {
              enabled: false,
            },
            legend: {
              display: false,
            },
          },
        },
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    for (let chart of this.charts) {
      chart.destroy();
    }
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
