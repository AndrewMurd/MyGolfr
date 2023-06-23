import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { toStandardTime, hm } from '../../utilities/functions';

// this component displays the a selected round that has been completed
@Component({
  selector: 'app-round-page',
  templateUrl: './round-page.component.html',
  styleUrls: ['./round-page.component.scss'],
})
export class RoundPageComponent {
  subscriptions: Subscription = new Subscription();
  scoreData: any;
  userData: any;
  addressInfo: string = '';
  date: any;
  timeDifference: any;
  scoreLn: any;
  charts: any = [];
  nineHole: boolean = false;
  top!: string;
  popUp: boolean = false;
  hdcpType!: string;
  editing: boolean = false;
  time: string = '';

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private alertService: AlertService,
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
          const response: any = await this.scoreService.get(params['id']);
          this.scoreData = response.score;
          this.scoreService.selectedScoreData.next(this.scoreData);
          this.loadingService.loading.next(false);

          if (this.scoreData.courseDetails.nineHoleGolfCourse)
            this.nineHole = true;
          this.onResize();

          this.hdcpType = this.scoreData.hdcpType;
          // count number of completed holes
          let count = 0;
          for (let [key, value] of Object.entries(this.scoreData.score)) {
            if (value != '' && key != 'In' && key != 'Out') {
              count++;
            }
          }
          this.scoreLn = count;
          // convert date from database
          this.date = new Date(this.scoreData.endTime).toLocaleDateString();
          // get the time lasped from start to finish of round
          this.timeDifference = hm(
            new Date(this.scoreData.endTime).getTime() -
              new Date(this.scoreData.startTime).getTime()
          );

          this.time =
            toStandardTime(
              new Date(this.scoreData.endTime).toString().slice(15, 25),
              false
            ) + ` (${this.timeDifference})`;

          let stringArray =
            this.scoreData.googleDetails.plus_code.compound_code.split(/(\s+)/);
          this.addressInfo = '';
          for (let i = 1; i < stringArray.length; i++) {
            this.addressInfo += stringArray[i];
          }

          this.subscriptions.add(
            this.authService.user.asObservable().subscribe(async (value) => {
              if (value) {
                this.userData = value;
                this.editing = false;
                // check whether this round is from the currently logged in user or not
                if (this.scoreData.userId == this.userData.id)
                  this.editing = true;
              }
            })
          );
        } catch (error) {
          this.router.navigate(['']);
        }
      })
    );

    this.subscriptions.add(
      this.scoreService.selectedScoreData.asObservable().subscribe((value) => {
        if (value) {
          this.scoreData = value;
          // destroy current charts
          for (let chart of this.charts) {
            chart.destroy();
          }
          // get canvas from dom
          const canvas: any = document.getElementById('scoreLineChart');
          const canvas1: any = document.getElementById('scoreDoughnutChart');

          const scorecardPar = [];
          const score = [];

          if (!this.scoreData?.teeData) return;
          // get data for teeData par and sum it for chart
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
          // get data for score and sum it for chart
          sum = 0;
          for (let [key, value] of Object.entries(this.scoreData.score)) {
            if (key != 'In' && key != 'Out') {
              sum += Number(value);
              score.push({ hole: key, value: value, sum: sum });
            }
          }
          // create line chart for displaying increase in score sum vs increase in par sum for each hole
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
          // count types of score for each hole
          let birdies = 0,
            par = 0,
            bogeys = 0,
            double = 0,
            triple = 0;
          for (let i = 0; i < Object.keys(score).length; i++) {
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
          // create doughnut chart for displaying ratio between each type of score
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
                    borderWidth: 0,
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
                    },
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

  navigateToCourse() {
    this.router.navigate(['/course', this.scoreData.courseId]);
  }

  async deleteRound() {
    this.alertService.confirm(
      'This round can only be deleted once, and it cannot be recovered. Are you certain that you want to remove it?',
      { color: 'red', content: 'Delete' },
      async () => {
        try {
          const response: any = await this.scoreService.delete(this.scoreData);
          this.router.navigate(['/profile', 'rounds', this.userData.id]);
          const userData = this.authService.user.getValue();
          userData.hdcp = response.scoreData.hdcp;
          this.authService.user.next(userData);
        } catch (error) {}
      },
      () => {}
    );
  }

  editRound() {
    this.popUp = true;
  }

  // edit whether course should be counted towards hdcp
  async submitEdit() {
    if (this.scoreData.hdcpType == this.hdcpType) {
      this.popUp = false;
      return;
    }
    this.loadingService.loading.next(true);

    let factor = 0;
    this.scoreData.courseDetails.nineHoleGolfCourse
      ? (factor = 10)
      : (factor = 20);

    // count number of inputed score values
    let count = 0;
    for (let value of Object.values(this.scoreData.score)) {
      if (value != '') {
        count++;
      }
    }

    // check whether user should be able to switch round to count towards hdcp calculation
    if (this.hdcpType == 'basic') {
      // need a slope and rating for calculating hdcp
      if (
        this.scoreData.teeData.Rating == '' ||
        this.scoreData.teeData.Rating == undefined ||
        this.scoreData.teeData.Slope == '' ||
        this.scoreData.teeData.Rating == undefined
      ) {
        this.alertService.alert(
          'Must enter Slope Rating and Course Rating for Basic Mode (Needed for Handicap Calculation).',
          {
            color: 'green',
            content: 'Accept',
          }
        );
        this.hdcpType = 'none';
        this.popUp = false;
        this.loadingService.loading.next(false);
        return;
      }

      if (
        Object.keys(this.scoreData.score).length >= factor &&
        count == factor
      ) {
        try {
          this.scoreData.hdcpType = this.hdcpType;
          await this.scoreService.update(this.scoreData, 'hdcpType');
        } catch (error) {
          console.log(error);
        }
      } else {
        // warn user that the score is imcomplete and they cant change it to count towards hdcp calculation
        this.alertService.alert(
          'This score is incomplete! You must complete every hole when calculating handicap.',
          { color: 'green', content: 'Accept' }
        );
        this.hdcpType = 'none';
      }
    } else {
      try {
        this.scoreData.hdcpType = this.hdcpType;
        await this.scoreService.update(this.scoreData, 'hdcpType');
      } catch (error) {
        console.log(error);
      }
    }
    this.popUp = false;
    this.loadingService.loading.next(false);
  }

  // calculate difference between total sum par and total score
  calculateShotsToPar() {
    let sumScore = 0,
      sumPar = 0;
    if (!this.scoreData?.score) return '';
    for (let [key, value] of Object.entries(this.scoreData.score)) {
      if (value != '' && key != 'Out' && key != 'In') {
        sumScore += Number(value);
        sumPar += Number(this.scoreData.teeData['P' + key]);
      }
    }
    const scoreToPar = sumScore - sumPar;
    console.log(scoreToPar);
    if (scoreToPar == 0) {
      return 'E';
    } else if (scoreToPar < 0 || scoreToPar == 0) {
      return `${scoreToPar}`;
    } else if (scoreToPar > 0) {
      return `+${scoreToPar}`;
    }
    return '';
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 830) {
      if (this.nineHole) {
        this.top = '155px';
      } else {
        this.top = '255px';
      }
    } else if (window.innerWidth < 1650) {
      if (this.nineHole) {
        this.top = '260px';
      } else {
        this.top = '460px';
      }
    } else {
      this.top = '0px';
    }
  }
}
