import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';
import { convertSqlDateTime } from '../../utilities/functions';
import {
  trigger,
  state,
  style,
  animate,
  stagger,
  query,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-rounds-page',
  templateUrl: './rounds-page.component.html',
  styleUrls: ['./rounds-page.component.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0 }),
            stagger(100, [animate('0.5s', style({ opacity: 1 }))]),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
})
export class RoundsPageComponent {
  subscriptions: Subscription = new Subscription();
  selectedUser: boolean = true;
  userData: any;
  scores: any = [];
  userName: string = 'Guest';
  numberOfScores: number = 0;
  datedScores: any = {};
  amountOfRoundsThisYear: number = 0;
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
    private alertService: AlertService,
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
          const response: any = await this.scoreService.getUser(params['id']);
          this.scores = response.scores;
          this.userName = this.scores[0].username;

          this.reload();

          this.loadingService.loading.next(false);
        } catch (error) {
          console.log(error);
          this.loadingService.loading.next(false);
        }
        this.subscriptions.add(
          this.authService.user.asObservable().subscribe(async (value) => {
            if (value) {
              this.userData = value;
              this.selectedUser = true;
              if (
                this.scores[0]?.userId == this.userData.id ||
                this.scores.length == 0
              )
                this.selectedUser = false;
            }
          })
        );
      })
    );
  }

  reload() {
    this.amountOfRoundsThisYear = 0;
    this.numberOfScores = this.scores.length;

    this.scores.sort((a: any, b: any) => {
      return (
        convertSqlDateTime(b.endTime).getTime() -
        convertSqlDateTime(a.endTime).getTime()
      );
    });

    const currentDate = new Date();
    for (let score of this.scores) {
      const newDate = convertSqlDateTime(score.startTime);
      if (newDate.getFullYear() == currentDate.getFullYear()) {
        this.amountOfRoundsThisYear += 1;
      }
      score.formattedDate = newDate.toLocaleDateString();

      let count = 0;
      for (let [key, value] of Object.entries(score.score)) {
        if (value != '' && key != 'In' && key != 'Out') {
          count++;
        }
      }
      score['holes'] = count;

      if (score.statusComplete == 0) {
        this.scores.splice(this.scores.indexOf(score), 1);
        this.scores.unshift(score);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showOverview(score: any) {
    if (score.statusComplete == 0) {
      if (this.userData.id != score.userId) {
        this.router.navigate(['/round', score.id]);
        return
      }
      this.router.navigate(['/round/in-progress', score.id]);
      setTimeout(() => {
        this.scoreService.inProgressScoreData.next(score);
      });
    } else {
      this.router.navigate(['/round', score.id]);
    }
  }

  async deleteRound(s: any, event: any) {
    event.stopPropagation();
    this.alertService.confirm(
      'This round can only be deleted once, and it cannot be recovered. Are you certain that you want to remove it?',
      { color: 'red', content: 'Delete' },
      async () => {
        try {
          this.loadingService.loading.next(true);
          this.scores = this.scores.filter((score: any) => {
            return s.id != score.id;
          });
          const response: any = await this.scoreService.delete(s);
          const userData = this.authService.user.getValue();
          userData.hdcp = response.scoreData.hdcp;
          this.authService.user.next(userData);
          if (s.statusComplete == 0) {
            this.scoreService.inProgressScoreData.next(null);
          }
          this.reload();
        } catch (error) {}
        this.loadingService.loading.next(false);
      },
      () => {}
    );
  }

  onPan(event: any, index: number) {
    if (
      event.additionalEvent == 'panleft' &&
      window.innerWidth < 830 &&
      !this.selectedUser
    ) {
      // event.target.style.right = `${-event.deltaX}px`;
      // event.target.style.transform = `translateX(${event.deltaX}px)`;
      if (event.deltaX < -50 || event.deltaX > 0) return;
      document.getElementById(
        `roundItem${index}`
      )!.style.transform = `translateX(${event.deltaX}px)`;
      document.getElementById(
        `roundItem${index}`
      )!.style.borderRadius = `8px 0px 0px 8px`;
    }
  }

  openDelete(index: number) {
    if (this.selectedUser) return;
    document.getElementById(
      `roundItem${index}`
    )!.style.transition = `transform 0.5s`;
    document.getElementById(
      `roundItem${index}`
    )!.style.transform = `translateX(-50px)`;
  }

  closeDelete(index: number) {
    document.getElementById(
      `roundItem${index}`
    )!.style.transition = `transform 0.5s`;
    document.getElementById(
      `roundItem${index}`
    )!.style.transform = `translateX(0px)`;
    document.getElementById(`roundItem${index}`)!.style.borderRadius = `8px`;
  }

  resetDelete() {
    for (let i = 0; i < this.scores.length; i++) {
      document.getElementById(
        `roundItem${i}`
      )!.style.transform = `translateX(0px)`;
      document.getElementById(`roundItem${i}`)!.style.borderRadius = `8px`;
    }
  }
}
