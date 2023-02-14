import { Component, HostListener } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { faMapPin, faFlag } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-course-page',
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.scss'],
})
export class CoursePageComponent {
  selectedCourse: any;
  display: any;
  center: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0,
  };
  isNineHole: boolean = false;
  isPhone: boolean = false;
  selectedMapView: string = 'course';
  map!: google.maps.Map;
  markers: any = [];
  editOn: boolean = false;
  offsetFactor = 0.0006;
  layoutData: any;
  scorecard: any;
  googleDetails: any;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    this.reload();
  }

  async reload() {
    this.center.lat = this.selectedCourse.geometry.location.lat;
    this.center.lng = this.selectedCourse.geometry.location.lng;

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 16,
        center: this.center,
        mapTypeId: 'hybrid',
        minZoom: 15,
        disableDefaultUI: true,
      } as google.maps.MapOptions
    );

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    this.isNineHole = response.course.courseDetails.nineHoleGolfCourse;
    this.layoutData = response.course.mapLayout;
    this.scorecard = response.course.scorecard;
    this.googleDetails = response.course.googleDetails;

    this.setMapView(this.selectedMapView);

    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }

  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers.length = 0;
  }

  disableDrag(value: boolean) {
    if (value) {
      for (const marker of this.markers) {
        console.log(marker);
        marker.setDraggable(true);
      }
    }
  }

  async setMapView(a: any) {
    if (this.editOn) {
      const response: any = await this.courseService.get(
        this.selectedCourse.reference
      );

      this.isNineHole = response.course.courseDetails.nineHoleGolfCourse;
      this.layoutData = response.course.mapLayout;
      this.scorecard = response.course.scorecard;
      this.googleDetails = response.course.googleDetails;
    }

    this.selectedMapView = `${a}`;
    let map = this.map;

    if (a === 'course') {
      this.map.setCenter(this.center);
      this.map.setZoom(16);
      this.clearOverlays();
      return;
    } else {
      this.clearOverlays();
    }

    const holeLayout = this.layoutData[a];

    console.log(holeLayout);

    this.map.setCenter(holeLayout.location);
    this.map.setZoom(holeLayout.zoom);

    let offsetTee = this.offsetFactor;
    for (let teeLoc of holeLayout.teeLocations) {
      let color;
      for (let tee of this.scorecard) {
        if (tee.id == teeLoc.id) {
          if (!tee.Color) {
            color = '';
          } else {
            color = tee.Color;
          }
        }
      }

      if (
        teeLoc.lat == this.googleDetails.geometry.location.lat &&
        teeLoc.lng == this.googleDetails.geometry.location.lng
      ) {
        teeLoc.lng = teeLoc.lng + offsetTee;
        offsetTee += this.offsetFactor;
      }

      // tee marker
      this.markers.push(
        new google.maps.Marker({
          position: {
            lat: teeLoc.lat,
            lng: teeLoc.lng,
          },
          map,
          icon: {
            path: faMapPin.icon[4] as string,
            fillColor: color,
            fillOpacity: 1,
            anchor: new google.maps.Point(
              faMapPin.icon[0] / 2, // width
              faMapPin.icon[1] // height
            ),
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 0.06,
          },
          draggable: this.editOn,
          title: `${teeLoc.id}`,
        })
      );
    }

    let offsetFlag = this.offsetFactor;
    for (let flagLoc of holeLayout.flagLocations) {
      if (
        flagLoc.lat == this.googleDetails.geometry.location.lat &&
        flagLoc.lng == this.googleDetails.geometry.location.lng
      ) {
        flagLoc.lat = flagLoc.lat - offsetFlag;
        offsetFlag += this.offsetFactor;
      }

      // flag marker
      this.markers.push(
        new google.maps.Marker({
          position: {
            lat: flagLoc.lat,
            lng: flagLoc.lng,
          },
          map,
          icon: {
            path: faFlag.icon[4] as string,
            fillColor: 'black',
            fillOpacity: 1,
            anchor: new google.maps.Point(
              faFlag.icon[0] / 4.2, // width
              faFlag.icon[1] // height
            ),
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 0.04,
          },
          draggable: this.editOn,
        })
      );
    }
  }

  async setLocation() {
    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    if (this.selectedMapView == 'course') {
      return;
    }

    response.course.mapLayout[this.selectedMapView].location.lat = this.map
      .getCenter()!
      .lat();
    response.course.mapLayout[this.selectedMapView].location.lng = this.map
      .getCenter()!
      .lng();

    response.course.mapLayout[this.selectedMapView].zoom = this.map.getZoom();

    await this.courseService.update(
      this.selectedCourse.reference,
      response.course.mapLayout,
      'mapLayout'
    );
  }

  async setMarkerLocations() {
    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    if (this.selectedMapView == 'course' || this.markers.length == 0) {
      return;
    }

    const layoutData = response.course.mapLayout[this.selectedMapView];
    for (let teeLoc of layoutData.teeLocations) {
      for (let marker of this.markers) {
        if (teeLoc.id == marker.title) {
          teeLoc.lat = marker.getPosition().lat();
          teeLoc.lng = marker.getPosition().lng();
        }
      }
    }

    await this.courseService.update(
      this.selectedCourse.reference,
      response.course.mapLayout,
      'mapLayout'
    );
  }

  addFlag() {}

  removeFlag() {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }

  createRange(number: number) {
    // return new Array(number);
    return new Array(number).fill('').map((n, index) => index + 1);
  }
}
