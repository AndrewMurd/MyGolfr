import { Component, HostListener } from '@angular/core';
import { CourseDetailsService } from '../../Service/course-details.service';
import { Router } from '@angular/router';
import { faMapPin, faFlag } from '@fortawesome/free-solid-svg-icons';

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
  editOn: any;
  offsetFactor = 0.0006;

  constructor(
    private courseService: CourseDetailsService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }

    this.isNineHole = response.course.courseDetails.nineHoleGolfCourse;

    this.center.lat = this.selectedCourse.geometry.location.lat;
    this.center.lng = this.selectedCourse.geometry.location.lng;

    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 16,
        center: this.center,
        mapTypeId: 'hybrid',
        minZoom: 15,
        tilt: 45,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false,
        rotateControl: true,
        // disableDefaultUI: true,
      } as google.maps.MapOptions
    );
  }

  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers.length = 0;
  }

  async setMapView(a: any) {
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

    const response: any = await this.courseService.get(
      this.selectedCourse.reference
    );

    const layoutData = response.course.mapLayout[a];

    this.map.setCenter(layoutData.location);
    this.map.setZoom(layoutData.zoom);

    let offsetTee = this.offsetFactor;
    for (let teeLoc of layoutData.teeLocations) {
      let color;
      for (let tee of response.course.scorecard) {
        if (tee.id == teeLoc.id) {
          if (!tee.Color) {
            color = '';
          } else {
            color = tee.Color;
          }
        }
      }

      if (
        teeLoc.lat == response.course.googleDetails.geometry.location.lat &&
        teeLoc.lng == response.course.googleDetails.geometry.location.lng
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
          draggable: true,
          title: `${teeLoc.id}`,
        })
      );
    }

    let offsetFlag = this.offsetFactor;
    for (let flagLoc of layoutData.flagLocations) {
      if (
        flagLoc.lat == response.course.googleDetails.geometry.location.lat &&
        flagLoc.lng == response.course.googleDetails.geometry.location.lng
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
          draggable: true,
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

    response.course.mapLayout[this.selectedMapView].location.lat = this.map.getCenter()!.lat();
    response.course.mapLayout[this.selectedMapView].location.lng = this.map.getCenter()!.lng();

    response.course.mapLayout[this.selectedMapView].zoom = this.map.getZoom();

    await this.courseService.update(this.selectedCourse.reference, response.course.mapLayout, 'mapLayout');
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
    
    await this.courseService.update(this.selectedCourse.reference, response.course.mapLayout, 'mapLayout');
  }

  addFlag() {
  }

  removeFlag() {
  }

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
