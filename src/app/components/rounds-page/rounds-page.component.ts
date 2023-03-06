import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { CourseDetailsService } from 'src/app/services/course-details.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ScoreService } from 'src/app/services/score.service';

@Component({
  selector: 'app-rounds-page',
  templateUrl: './rounds-page.component.html',
  styleUrls: ['./rounds-page.component.scss'],
})
export class RoundsPageComponent {
  subscriptions: Subscription = new Subscription();
  @Input() selectedUser: any;
  userData: any;
  selectedScore: any;
  scores: any;
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
    private loadingService: LoadingService
  ) {}

  async ngOnInit() {
    this.loadingService.loading.next(true);
    this.subscriptions.add(this.authService.user.asObservable().subscribe(async (value) => {
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
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showOverview(score: any) {
    console.log(score);
    this.selectedScore = score;
  }

  async deleteRound(s: any, event: any) {
    event.stopPropagation();
    this.alertService.confirm(
      'Deleting this round will make it disappear forever and will not be retrievable. Are you sure you want to delete it?',
      { color: 'red', content: 'Delete' },
      'confirm',
      async () => {
        try {
          this.scores = this.scores.filter((score: any) => {
            return s.id != score.id;
          });
          await this.scoreService.delete(s.id);
        } catch (error) {}
      },
      () => {}
    );
  }

  onPan(event: any, index: number) {
    if (event.additionalEvent == 'panleft') {
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
