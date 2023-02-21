import { Component, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../Service/course-details.service';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { map, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'edit-score-card',
  templateUrl: './edit-score-card.component.html',
  styleUrls: ['./edit-score-card.component.scss'],
})
export class EditScoreCardComponent {
  signedIn: boolean = false;
  title: string = 'New Golf Course ScoreCard';
  courseId!: string;
  courseData: any;
  eventsSubject: Subject<any> = new Subject<any>();
  @Output() onFinishEdit: EventEmitter<any> = new EventEmitter();
  @Output() edited: EventEmitter<any> = new EventEmitter();
  @Output() rBackNine: EventEmitter<any> = new EventEmitter();
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
    private router: Router
  ) {}

  async ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    this.courseService.courseData.asObservable().subscribe((value) => {
      if (value) {
        this.courseData = value;
        this.reload();
      }
    });
  }

  async reload() {
    this.isLoading = true;

    this.title = this.courseData.name;
    this.removedBackNine = this.courseData.courseDetails.nineHoleGolfCourse;

    let teeRenderOrder = [];
    for (let tee of this.courseData.scorecard) {
      document.getElementById(tee.id)?.remove();
      document.getElementById(tee.id)?.remove();
      teeRenderOrder.push(tee);
    }

    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });

    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender);
    }

    this.edited.emit();

    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  onSubmit(data: any) {
    this.eventsSubject.next(data);
    if (data.id[1] == 'Color' || data.id[1] == 'ColorName') this.edited.emit();
  }

  async finishEdit() {
    this.editing = false;
    this.courseService.editingScoreCard.next(this.editing);
    const response: any = await this.courseService.get(this.courseId);
    this.courseService.courseData.next(response.course);
    this.onFinishEdit.emit();
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
    this.courseData.courseDetails['nineHoleGolfCourse'] = !this.courseData.courseDetails['nineHoleGolfCourse'];

    await this.courseService.update(this.courseId, this.courseData.courseDetails, 'courseDetails');
    this.courseService.courseData.next(this.courseData);
  }

  async addNewTee() {
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

    this.courseService.update(this.courseId, mapLayout, 'mapLayout');
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
    frontNineTee.instance.onReload.subscribe((value) => {
      this.reload();
    });
    frontNineTee.instance.events = this.eventsSubject.asObservable();

    if (this.removedBackNine) return;
    const backNineTee = this.backNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    backNineTee.setInput('id', teeData.id);
    backNineTee.setInput('teeData', teeData);
    backNineTee.setInput('isFrontNine', false);
    backNineTee.instance.onReload.subscribe((value) => {
      this.reload();
    });
    backNineTee.instance.onSubmitofInput.subscribe((value) => {
      this.onSubmit(value);
    });
    backNineTee.instance.events = this.eventsSubject.asObservable();
  }
}
