import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { Chart, registerables } from 'chart.js';
import {
  numberOfHolesPlayed,
  diffCurrentTime,
} from '../../utilities/functions';

// stats page for displaying all stats and info based on a user's career and submitted scores
@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.component.html',
  styleUrls: ['./stats-page.component.scss'],
})
export class StatsPageComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  @Input() scoresSubject!: Observable<any>;
  scores: any = [];
  hdcp!: number;
  usedForHdcpScores: any = [];
  selectedUser: boolean = true;
  selectedUserData: any;
  userName: string = 'Guest';
  timePlayed: string = '0d 0h 0m';
  lowestScore: any = null;
  highestScore: any = null;
  scoreAvg: string = 'N/A';
  avgTypesOfScores: any = {
    'Eagles or Better': 0,
    Birdies: 0,
    Pars: 0,
    Bogeys: 0,
    'Double Bogeys': 0,
    'Triples or Worse': 0,
  };
  limit: any = 40;
  avgScoreToParData: any = [];
  charts: any = [];
  canvas: any;
  numberOfHolesPlayed: Function = numberOfHolesPlayed;

  constructor(
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    Chart.register(...registerables);
  }

  async ngOnInit() {
    this.subscriptions.add(
      this.scoresSubject.subscribe((value) => {
        if (value) {
          for (let score of value.scores) {
            if (score.statusComplete == 1) this.scores.push(score);
          }
          this.selectedUserData = value.selectedUserData;
          this.userName = this.selectedUserData.name;
          // filter scores used in hdcp calculation
          for (let score of this.scores) {
            if (score.usedForHdcp == 1) this.usedForHdcpScores.push(score);
          }
          if (!this.selectedUserData?.hdcp) {
            this.hdcp = 0.0;
          } else {
            this.hdcp = this.selectedUserData.hdcp;
          }
          this.subscriptions.add(
            this.authService.user.asObservable().subscribe(async (value) => {
              if (value) {
                this.userData = value;
                this.selectedUser = true;
                if (this.selectedUserData.id == this.userData.id)
                  this.selectedUser = false;

                this.reload();

                // create doughnut visual for handicap index
                const canvas: any = document.getElementById('indexChart');
                const ctx = canvas.getContext('2d');
                this.canvas = canvas;

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
                // We need to convert handicap range to angle range while keeping same ratio
                const handicapRange = 54 - 0;
                const anglesRange = -0.5 - 1.5;
                const angleValue =
                  ((54 - this.hdcp - 0) * anglesRange) / handicapRange + 1.5;

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
                // animate when user hdcp is zero
                if (this.hdcp == 0) {
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
        }
      })
    );
  }
  // when queries a different range of rounds reload calculations
  async newQuery() {
    let id = this.scores[0].userId;
    this.scores.length = 0;
    let response: any;
    try {
      this.loadingService.loading.next(true);
      // all rounds
      if (this.limit == 'all') {
        response = await this.scoreService.getUser(id, 1, 0);
        this.scores = response.scores;
        this.userName = this.scores[0].username;
      } else if (this.limit == 'thisYear') {
        // rounds only this year
        response = await this.scoreService.getUser(id, 1, 0);
        for (let score of response.scores) {
          const currentDate = new Date();
          const newDate = new Date(score.endTime);
          if (newDate.getFullYear() == currentDate.getFullYear()) {
            this.scores.push(score);
          }
        }
        this.userName = this.scores[0].username;
      } else {
        // number of rounds selected (5, 20, 40)
        response = await this.scoreService.getUser(id, 1, this.limit);
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
    this.lowestScore = null;
    this.highestScore = null;
    const scoreByPar: any = { 3: [], 4: [], 5: [] };
    this.avgScoreToParData = [];
    let typesOfScoresArr = [];
    let scoresLn = this.scores.length;
    for (let score of this.scores) {
      let typeOfScore: any = {
        'Eagles or Better': 0,
        Birdies: 0,
        Pars: 0,
        Bogeys: 0,
        'Double Bogeys': 0,
        'Triples or Worse': 0,
      };
      let factor = 0;
      score.courseDetails.nineHoleGolfCourse ? (factor = 10) : (factor = 20);

      // count number of inputed score values
      let count = 0;
      for (let value of Object.values(score.score)) {
        if (value != '') {
          count++;
        }
      }

      // get the total time played for user
      sumTime +=
        new Date(score.endTime).getTime() - new Date(score.startTime).getTime();

      // remove score from calculations if it is not completed
      if (Object.keys(score.score).length < factor || count != factor) {
        scoresLn--;
        continue;
      }

      scoreSum += Number(this.calculateShotsToPar(score));
      // calculate best and worst score
      if (
        Number(this.calculateShotsToPar(this.lowestScore)) >
          Number(this.calculateShotsToPar(score)) ||
        this.lowestScore == null
      ) {
        this.lowestScore = score;
      }
      if (
        Number(this.calculateShotsToPar(this.highestScore)) <
          Number(this.calculateShotsToPar(score)) ||
        this.highestScore == null
      ) {
        this.highestScore = score;
      }
      // get scores for all holes
      let key: any, value: any;
      for ([key, value] of Object.entries(score.teeData)) {
        if (key.charAt(0) == 'P' && key != 'Position') {
          const hole = key.length == 2 ? key.charAt(1) : key.slice(-2);
          scoreByPar[value].push(Number(score.score[hole]));
        }
      }
      // calculate total number of each type of score
      for ([key, value] of Object.entries(score.teeData)) {
        if (key.charAt(0) == 'P' && key != 'Position') {
          const hole = key.length == 2 ? key.charAt(1) : key.slice(-2);
          const diff = Number(score.score[hole]) - value;
          if (diff <= -2) {
            typeOfScore['Eagles or Better']++;
          } else if (diff <= -1) {
            typeOfScore['Birdies']++;
          } else if (diff == 0) {
            typeOfScore['Pars']++;
          } else if (diff == 1) {
            typeOfScore['Bogeys']++;
          } else if (diff == 2) {
            typeOfScore['Double Bogeys']++;
          } else if (diff >= 3) {
            typeOfScore['Triples or Worse']++;
          }
        }
      }
      for (let [key, value] of Object.entries(typeOfScore)) {
        if (score.courseDetails.nineHoleGolfCourse) {
          typeOfScore[key] = Number(value) * 2;
        } else {
          typeOfScore[key] = Number(value);
        }
      }
      typesOfScoresArr.push(typeOfScore);
    }
    // chart displaying changes in hdcp over time (history)
    const histCanvas: any = document.getElementById('handicapHistoryChart');
    const history = this.scores[0].hdcpHistory;
    this.charts.push(
      new Chart(histCanvas, {
        type: 'line',
        data: {
          labels: history.map((row: any) => new Date(row.date).toLocaleDateString()),
          datasets: [
            {
              data: history.map((row: any) => row.hdcp),
            },
          ],
        },
        options: {
          color: 'black',
          scales: {
            x: {
              ticks: {
                font: {
                  weight: 'bold',
                },
                color: 'black',
              },
            },
            y: {
              ticks: {
                font: {
                  weight: 'bold',
                },
                color: 'black',
              },
              grid: {
                color: 'black',
                tickBorderDash: [4],
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    )

    this.timePlayed = this.dhm(sumTime);
    // caculate avg score
    const scoreAvg = Number((scoreSum / scoresLn).toFixed(1));
    if (scoreAvg < 0 || scoreAvg == 0) {
      this.scoreAvg = `${scoreAvg}`;
    } else if (scoreAvg > 0) {
      this.scoreAvg = `+${scoreAvg}`;
    }
    // calculate data for bar chart
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
      if (Math.round((sum / value.length) * 10) / 10 - key < 0) {
        colors.push('green');
      } else {
        colors.push('rgb(109, 0, 0)');
      }
    }
    // bar chart displays how the user scores on avg on a par 3, 4 and 5
    const canvas: any = document.getElementById('scoreByParChart');
    this.charts.push(
      new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.avgScoreToParData.map((row: any) => `Above/Below Par:`),
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
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      })
    );

    for (let score of typesOfScoresArr) {
      for ([key, value] of Object.entries(score)) {
        this.avgTypesOfScores[key] += Number(value);
      }
    }
    for ([key, value] of Object.entries(this.avgTypesOfScores)) {
      this.avgTypesOfScores[key] = parseFloat(
        (Number(value) / scoresLn).toFixed(2)
      );
      if (isNaN(parseFloat((Number(value) / scoresLn).toFixed(2))))
        this.avgTypesOfScores[key] = '0.0';
    }
    // doughnut charts for displaying the avg amount of each type of score
    const parChart: any = document.getElementById('doughnutChartPar');
    this.charts.push(
      new Chart(parChart, {
        type: 'doughnut',
        data: {
          labels: ['grey', 'Pars'],
          datasets: [
            {
              data: [
                this.avgTypesOfScores.Pars,
                18 - this.avgTypesOfScores.Pars,
              ],
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
              data: [
                this.avgTypesOfScores.Bogeys,
                18 - this.avgTypesOfScores.Bogeys,
              ],
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
              data: [
                this.avgTypesOfScores.Birdies,
                18 - this.avgTypesOfScores.Birdies,
              ],
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
                this.avgTypesOfScores['Eagles or Better'],
                18 - this.avgTypesOfScores['Eagles or Better'],
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
                this.avgTypesOfScores['Double Bogeys'],
                18 - this.avgTypesOfScores['Double Bogeys'],
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
                this.avgTypesOfScores['Triples or Worse'],
                18 - this.avgTypesOfScores['Triples or Worse'],
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
  // converts time in ms to a more readable format of days/hours/mins
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

  getTimeDifference(score: any) {
    return diffCurrentTime(score.endTime);
  }
}
