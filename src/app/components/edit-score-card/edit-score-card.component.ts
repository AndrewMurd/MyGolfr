import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../services/course-details.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ScoreService } from '../../services/score.service';

// this component allows logged in user to edit entire scorecard for selected course
@Component({
  selector: 'edit-score-card',
  templateUrl: './edit-score-card.component.html',
  styleUrls: ['./edit-score-card.component.scss'],
})
export class EditScoreCardComponent {
  subscriptions: Subscription = new Subscription();
  @Input() fullSize: boolean = false;
  signedIn: boolean = false;
  title!: string;
  courseData: any;
  scoreData: any;
  currentRound: any;
  onSubmitInput: Subject<any> = new Subject<any>();
  removedBackNine!: boolean;
  isLoading: boolean = false;
  editing: boolean = false;

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private scoreService: ScoreService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.isLoading = true;

    this.subscriptions.add(
      this.authService.token.asObservable().subscribe((value) => {
        if (value) {
          this.signedIn = true;
        } else {
          this.signedIn = false;
        }
      })
    );

    this.scoreService.inProgressScoreData.asObservable().subscribe((value) => {
      if (value) {
        this.scoreData = value;
      }
    });
  }

  async ngAfterViewInit() {
    setTimeout(() => {
      this.subscriptions.add(
        this.courseService.courseData.asObservable().subscribe((value) => {
          if (value) {
            this.courseData = value;
            this.reload();
          }
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async reload() {
    this.isLoading = true;
    this.title = this.courseData.name;
    this.removedBackNine = this.courseData.courseDetails.nineHoleGolfCourse;

    // clear scorecard of dymically added tees
    if (this.frontNineContainer && this.backNineContainer) {
      this.frontNineContainer.clear();
      this.backNineContainer.clear();
    }

    let teeRenderOrder = [];
    for (let tee of this.courseData.scorecard) {
      teeRenderOrder.push(tee);
    }
    // sorts the order of the tees for scorecard view based on user editing position of tee on scorecard
    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });
    // render tee in order
    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender);
    }
    this.isLoading = false;
  }

  onSubmit(data: any) {
    this.onSubmitInput.next(data);
    // after submitting data recalculate Sums for Out and In scores and Par In and Out
    for (let tee of this.courseData.scorecard) {
      if (tee.id == data.id[0]) {
        tee[data.id[1]] = data.value;

        if (data.id[1].charAt(0) == 'H') {
          let inNum = 0;
          let outNum = 0;
          for (let [key, value] of Object.entries(tee)) {
            if (key.charAt(0) == 'H' && key.length == 2) {
              outNum += Number(value);
            } else if (key.charAt(0) == 'H' && key.length == 3) {
              inNum += Number(value);
            }
          }
          tee['SumOut'] = outNum;
          tee['SumIn'] = inNum;
        } else if (data.id[1].charAt(0) == 'P') {
          let inNum = 0;
          let outNum = 0;
          for (let [key, value] of Object.entries(tee)) {
            if (key.charAt(0) == 'P' && key.length == 2) {
              outNum += Number(value);
            } else if (key.charAt(0) == 'P' && key.length == 3) {
              inNum += Number(value);
            }
          }
          tee['SumOutPar'] = outNum;
          tee['SumInPar'] = inNum;
        }
      }
    }
  }

  async finishEdit() {
    this.isLoading = true;
    this.editing = false;
    // update scorecard data based on edited values
    this.courseService.editingScoreCard.next(this.editing);
    this.courseService.courseData.next(this.courseData);
    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      this.courseData.scorecard,
      'scorecard'
    );
    if (!this.scoreData) return;
    this.scoreData.scorecard = JSON.parse(
      JSON.stringify(this.courseData.scorecard)
    );
    // update teeData with updated scorecard data for in progress score
    for (let tee of this.scoreData.scorecard) {
      if (tee.id == this.scoreData.teeData.id) {
        this.scoreData.teeData = tee;
        await this.scoreService.update(this.scoreData, 'teeData');
      }
    }
    this.scoreService.inProgressScoreData.next(this.scoreData);
  }

  edit() {
    // if (!this.signedIn) {
    //   this.router.navigate(['/login']);
    //   return;
    // }
    this.editing = true;
    this.courseService.editingScoreCard.next(this.editing);
  }

  // switch course to a 9 hole or vice versa
  async removebacknine() {
    this.isLoading = true;
    this.courseData.courseDetails['nineHoleGolfCourse'] =
      !this.courseData.courseDetails['nineHoleGolfCourse'];

    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      this.courseData.courseDetails,
      'courseDetails'
    );
    this.courseService.courseData.next(this.courseData);
  }

  // add new tee to scorecard
  async addNewTee() {
    this.isLoading = true;
    const response: any = await this.courseService.setScorecardValue(
      this.courseData.googleDetails.reference,
      { id: 'new', value: '' }
    );
    this.courseData.scorecard = response.scorecard;

    let mapLayout = this.courseData.mapLayout;
    let scorecard = this.courseData.scorecard;
    // set default values for flaglocations
    for (let [key, value] of Object.entries(mapLayout)) {
      mapLayout[key].teeLocations.push({
        id: scorecard[scorecard.length - 1].id,
        lat: mapLayout[key].location.lat,
        lng: mapLayout[key].location.lng,
      });
    }

    await this.courseService.updateColumn(
      this.courseData.googleDetails.reference,
      mapLayout,
      'mapLayout'
    );
    this.courseData.mapLayout = mapLayout;
    this.courseService.courseData.next(this.courseData);
  }
  // creates dynamic tees on scorecard based on number of tees on scorecard
  // and the current data for the course
  createTeeComponents(teeData: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('isFrontNine', true);
    frontNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    frontNineTee.instance.loading.subscribe((value) => {
      this.isLoading = value;
    });
    frontNineTee.instance.submitInput = this.onSubmitInput.asObservable();

    if (this.removedBackNine) return;
    const backNineTee = this.backNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.loading.subscribe((value) => {
      this.isLoading = value;
    });
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
