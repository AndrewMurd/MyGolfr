import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
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

// this component diplays all completed and in progress rounds by the selected user
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
  selectedUserData: any;
  @Input() scoresSubject!: Observable<any>;
  @Output() editedScores: EventEmitter<any> = new EventEmitter();
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
    private alertService: AlertService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.subscriptions.add(
      this.scoresSubject.subscribe((value) => {
        if (value) {
          this.scores = value.scores;
          this.selectedUserData = value.selectedUserData;
          this.userName = this.selectedUserData.name;
          this.reload();
          this.subscriptions.add(
            this.authService.user.asObservable().subscribe(async (value) => {
              if (value) {
                this.userData = value;
                this.selectedUser = true;
                // check whether these rounds are from the currently logged in user or not
                if (this.selectedUserData.id == this.userData.id)
                  this.selectedUser = false;
              }
            })
          );
        }
      })
    );
  }

  // reload rounds page data
  reload() {
    this.amountOfRoundsThisYear = 0;
    this.numberOfScores = this.scores.length;

    // sort rounds based on finish date time
    this.scores.sort((a: any, b: any) => {
      return (
        convertSqlDateTime(b.endTime).getTime() -
        convertSqlDateTime(a.endTime).getTime()
      );
    });

    const currentDate = new Date();
    for (let score of this.scores) {
      // count number of rounds this year
      const newDate = convertSqlDateTime(score.startTime);
      if (newDate.getFullYear() == currentDate.getFullYear()) {
        this.amountOfRoundsThisYear += 1;
      }
      score.formattedDate = newDate.toLocaleDateString();
      // count completed holes
      let count = 0;
      for (let [key, value] of Object.entries(score.score)) {
        if (value != '' && key != 'In' && key != 'Out') {
          count++;
        }
      }
      score['holes'] = count;
      // move the in progress round to top of rounds order
      if (score.statusComplete == 0) {
        this.scores.splice(this.scores.indexOf(score), 1);
        this.scores.unshift(score);
      }
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  // show round page for clicked on round
  showOverview(score: any) {
    if (score.statusComplete == 0) {
      if (this.userData?.id != score.userId || !this.userData?.id) {
        this.router.navigate(['/round', score.id]);
        return;
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
          this.editedScores.emit(this.scores);
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
  // when user with touch screen moves round to the left show delete button
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
  // show delete button
  openDelete(index: number) {
    if (this.selectedUser) return;
    document.getElementById(
      `roundItem${index}`
    )!.style.transition = `transform 0.5s`;
    document.getElementById(
      `roundItem${index}`
    )!.style.transform = `translateX(-50px)`;
    document.getElementById(
      `roundItem${index}`
    )!.style.borderRadius = `8px 0px 0px 8px`;
  }
  // cover delete button
  closeDelete(index: number) {
    document.getElementById(
      `roundItem${index}`
    )!.style.transition = `transform 0.5s`;
    document.getElementById(
      `roundItem${index}`
    )!.style.transform = `translateX(0px)`;
    document.getElementById(`roundItem${index}`)!.style.borderRadius = `8px`;
  }
  // (not in use) reset position of elements on delete btn
  resetDelete() {
    for (let i = 0; i < this.scores.length; i++) {
      document.getElementById(
        `roundItem${i}`
      )!.style.transform = `translateX(0px)`;
      document.getElementById(`roundItem${i}`)!.style.borderRadius = `8px`;
    }
  }
}
