import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../services/course-details.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ScoreService } from '../../services/score.service';

@Component({
  selector: 'edit-score-card',
  templateUrl: './edit-score-card.component.html',
  styleUrls: ['./edit-score-card.component.scss'],
})
export class EditScoreCardComponent {
  @Input() fullSize: boolean = false;
  signedIn: boolean = false;
  title!: string;
  courseId!: string;
  courseData: any;
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
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;
    this.isLoading = true;

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });
  }

  async ngAfterViewInit() {
    setTimeout(() => {
      this.courseService.courseData.asObservable().subscribe((value) => {
        if (value) {
          this.courseData = value;
          this.reload();
        }
      });
    });
  }

  async reload() {
    this.isLoading = true;
    this.title = this.courseData.name;
    this.removedBackNine = this.courseData.courseDetails.nineHoleGolfCourse;

    if (this.frontNineContainer && this.backNineContainer) {
      this.frontNineContainer.clear();
      this.backNineContainer.clear();
    }

    let teeRenderOrder = [];
    for (let tee of this.courseData.scorecard) {
      teeRenderOrder.push(tee);
    }

    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });

    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender);
    }
    this.isLoading = false;
  }

  onSubmit(data: any) {
    this.onSubmitInput.next(data);
    for (let tee of this.courseData.scorecard) {
      if (tee.id == data.id[0]) {
        tee[data.id[1]] = data.value;
      }
    }
  }

  async finishEdit() {
    this.isLoading = true;
    this.editing = false;
    this.courseService.editingScoreCard.next(this.editing);
    this.courseService.courseData.next(this.courseData);
    await this.courseService.updateColumn(
      this.courseId,
      this.courseData.scorecard,
      'scorecard'
    );
  }

  edit() {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.editing = true;
    this.courseService.editingScoreCard.next(this.editing);
  }

  async removebacknine() {
    this.isLoading = true;
    this.courseData.courseDetails['nineHoleGolfCourse'] =
      !this.courseData.courseDetails['nineHoleGolfCourse'];

    await this.courseService.updateColumn(
      this.courseId,
      this.courseData.courseDetails,
      'courseDetails'
    );
    this.courseService.courseData.next(this.courseData);
  }

  async addNewTee() {
    this.isLoading = true;
    const response: any = await this.courseService.setScorecardValue(
      this.courseId,
      { id: 'new', value: '' }
    );
    this.courseData.scorecard = response.scorecard;

    let mapLayout = this.courseData.mapLayout;
    let scorecard = this.courseData.scorecard;

    for (let [key, value] of Object.entries(mapLayout)) {
      mapLayout[key].teeLocations.push({
        id: scorecard[scorecard.length - 1].id,
        lat: mapLayout[key].location.lat,
        lng: mapLayout[key].location.lng,
      });
    }

    await this.courseService.updateColumn(
      this.courseId,
      mapLayout,
      'mapLayout'
    );
    this.courseData.mapLayout = mapLayout;
    this.courseService.courseData.next(this.courseData);
  }

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
    backNineTee.instance.submitInput = this.onSubmitInput.asObservable();
  }
}
