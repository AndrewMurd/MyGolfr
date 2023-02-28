import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { LoadingService } from 'src/app/Service/loading.service';
import { ScoreService } from 'src/app/Service/score.service';

@Component({
  selector: 'app-rounds-page',
  templateUrl: './rounds-page.component.html',
  styleUrls: ['./rounds-page.component.scss'],
})
export class RoundsPageComponent {
  userData: any;
  selectedScore: any;
  scores: any;
  datedScores: any = {};
  initMargin: number = 40;
  initPos: number =
    screen.width < 830 ? this.initMargin / 2 : screen.width * 0.2;
  maxWidth: number = screen.width - this.initPos * 2;
  amountOfRoundsThisYear: number = 0;
  pos: any;
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.onResize();

    this.loadingService.loading.next(true);
    this.authService.user.asObservable().subscribe(async (value) => {
      if (value) {
        this.userData = value;
        try {
          const response: any = await this.scoreService.getUser(
            this.userData.id,
            1
          );
          this.scores = response.scores;

          const currentDate = new Date();
          for (let score of this.scores) {
            const dateParts = score.dateTime.split('-');
            const newDate = new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2].substr(0, 2)
            );
            if (newDate.getFullYear() == currentDate.getFullYear()) {
              this.amountOfRoundsThisYear += 1;
            }
            score.formattedDate = newDate.toLocaleDateString();
          }

          this.scores.sort((a: any, b: any) => {
            return (
              new Date(
                b.dateTime.split('-')[0],
                b.dateTime.split('-')[1] - 1,
                b.dateTime.split('-')[2].substr(0, 2)
              ).getTime() -
              new Date(
                a.dateTime.split('-')[0],
                a.dateTime.split('-')[1] - 1,
                a.dateTime.split('-')[2].substr(0, 2)
              ).getTime()
            );
          });
          this.loadingService.loading.next(false);
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  showOverview(score: any) {
    console.log(score);
    this.selectedScore = score;
    localStorage.setItem('selectedScore', JSON.stringify(score));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // get position to set Container
    let pos = window.innerWidth - screen.width + this.initPos;
    // Set Width of Container
    if (this.initPos < this.initMargin) {
      document.getElementById('roundsPageContainer')!.style.width = `${
        window.innerWidth - this.initPos * 2
      }px`;
    } else if (
      pos < this.initMargin &&
      this.maxWidth + this.initMargin * 2 - window.innerWidth > 0
    ) {
      document.getElementById('roundsPageContainer')!.style.width = `${
        window.innerWidth - this.initMargin * 2
      }px`;
    } else {
      document.getElementById(
        'roundsPageContainer'
      )!.style.width = `${this.maxWidth}px`;
    }

    // Set Position of Container
    if (this.initPos < this.initMargin) {
      document.getElementById(
        'roundsPageContainer'
      )!.style.marginLeft = `${this.initPos}px`;
    } else if (
      pos < this.initMargin ||
      screen.width < this.initMargin * 2 ||
      screen.width < this.maxWidth
    ) {
      document.getElementById(
        'roundsPageContainer'
      )!.style.marginLeft = `${this.initMargin}px`;
    } else if (pos > this.initMargin && pos < this.initPos) {
      document.getElementById(
        'roundsPageContainer'
      )!.style.marginLeft = `${pos}px`;
    } else {
      document.getElementById(
        'roundsPageContainer'
      )!.style.marginLeft = `${this.initPos}px`;
    }
  }
}
