import { Component, Input, Output, EventEmitter, ViewChild, ViewContainerRef } from '@angular/core';
import { NewScorecardTeeComponent } from '../new-scorecard-tee/new-scorecard-tee.component';
import { CourseDetailsService } from '../../Service/course-details.service';
import { map, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'edit-score-card',
  templateUrl: './edit-score-card.component.html',
  styleUrls: ['./edit-score-card.component.scss'],
})
export class EditScoreCardComponent {
  title: string = 'New Golf Course ScoreCard';
  courseId!: string;
  eventsSubject: Subject<any> = new Subject<any>();
  @Output() onFinishEdit: EventEmitter<any> = new EventEmitter();
  @Output() edited: EventEmitter<any> = new EventEmitter();
  @Output() rBackNine: EventEmitter<any> = new EventEmitter();
  removedBackNine!: boolean;
  isLoading: boolean = false;

  @ViewChild('frontNine', { read: ViewContainerRef })
  frontNineContainer!: ViewContainerRef;
  @ViewChild('backNine', { read: ViewContainerRef })
  backNineContainer!: ViewContainerRef;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.courseId = JSON.parse(
      localStorage.getItem('selectedCourse')!
    ).reference;

    this.reload();
  }

  async reload() {
    this.isLoading = true;
    const response: any = await this.courseService.get(this.courseId);
    this.courseService.courseData.next(response.course);

    this.title = response.course.name;
    this.removedBackNine = response.course.courseDetails.nineHoleGolfCourse;

    let teeRenderOrder = [];
    for (let tee of response.course.scorecard) {
      document.getElementById(tee.id)?.remove();
      document.getElementById(tee.id)?.remove();
      teeRenderOrder.push(tee);
    }

    teeRenderOrder.sort((a: any, b: any): any => {
      return a.Position - b.Position;
    });

    for (let teeToRender of teeRenderOrder) {
      this.createTeeComponents(teeToRender, response.course.scorecard);
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

  finishEdit() {
    this.onFinishEdit.emit();
  }

  async removebacknine() {
    const response: any = await this.courseService.get(this.courseId);

    response.course.courseDetails['nineHoleGolfCourse'] = !response.course.courseDetails['nineHoleGolfCourse'];

    this.courseService.update(this.courseId, response.course.courseDetails, 'courseDetails').then(() => {
      this.reload();
    });
    this.rBackNine.emit();
  }

  async addNewTee() {
    await this.courseService.setScorecardValue(
      this.courseId,
      { id: 'new', value: '' }
    );

    const courseDataRes: any = await this.courseService.get(this.courseId);

    let mapLayout = courseDataRes.course.mapLayout;
    let scorecard = courseDataRes.course.scorecard;

    for (let [key, value] of Object.entries(mapLayout)) {
      mapLayout[key].teeLocations.push({
        id: scorecard[scorecard.length - 1].id,
        lat: mapLayout[key].location.lat,
        lng: mapLayout[key].location.lng,
      });
      // mapLayout[key].flagLocations.push({
      //   id: scorecard[scorecard.length - 1].id,
      //   lat: mapLayout[key].location.lat,
      //   lng: mapLayout[key].location.lng,
      // });
    }

    this.courseService.update(this.courseId, mapLayout, 'mapLayout').then(() => {
      this.reload();
    });
  }

  createTeeComponents(teeData: any, scorecardData: any) {
    const frontNineTee = this.frontNineContainer.createComponent(
      NewScorecardTeeComponent
    );
    frontNineTee.setInput('id', teeData.id);
    frontNineTee.setInput('teeData', teeData);
    frontNineTee.setInput('scorecard', scorecardData);
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
    backNineTee.setInput('scorecard', scorecardData);
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
