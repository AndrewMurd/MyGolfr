import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faFlag, faMapPin, faCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable, take } from 'rxjs';
import { AuthenticationService } from 'src/app/Service/authentication.service';
import { CourseDetailsService } from 'src/app/Service/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';

@Component({
  selector: 'app-course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss'],
})
export class CourseMapComponent {
  @Input() editedScorecard!: Observable<any>;
  @Input() rBackNine!: Observable<any>;
  @Input() changeView!: Observable<any>;
  @Input() mapHeight: string = '400px';
  courseData: any;
  signedIn: boolean = false;
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
  flagMarker: any = [];
  distanceMarker: any = [];
  lines: any = [];
  mapLabels: any = [];
  editOn: boolean = false;
  offsetFactor = 0.0006;
  layoutData: any;
  scorecard: any;
  googleDetails: any;
  createRange: Function = createRange;
  getColorWhite: Function = getColorWhite;
  getRGB: Function = getRGB;
  roundInProgress: boolean = false;
  selectedTeeView: any;

  constructor(
    private courseService: CourseDetailsService,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.selectedCourse = JSON.parse(localStorage.getItem('selectedCourse')!);

    this.authService.token.asObservable().subscribe((value) => {
      if (value) {
        this.signedIn = true;
      } else {
        this.signedIn = false;
      }
    });

    if (this.editedScorecard) {
      this.editedScorecard.subscribe(async () => {
        const response: any = await this.courseService.get(
          this.selectedCourse.reference
        );
        this.courseData = response.course;
        if (!this.roundInProgress) {
          this.reload();
        }
      });
    }
    if (this.rBackNine) {
      this.rBackNine.subscribe(() => {
        this.isNineHole = !this.isNineHole;
      });
    }
    if (this.changeView) {
      this.changeView.subscribe((value) => {
        this.scorecard = [value.teeData];
        this.roundInProgress = value.roundInProgress;
        this.selectedTeeView = this.scorecard[0];
        this.setMapView(value.view);
      });
    }

    this.courseService.courseData.asObservable().subscribe((value) => {
      if (value) {
        this.courseData = value;
        this.reload();
      }
    });
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

    this.isNineHole = this.courseData.courseDetails.nineHoleGolfCourse;
    this.layoutData = this.courseData.mapLayout;
    this.scorecard = this.courseData.scorecard;
    this.googleDetails = this.courseData.googleDetails;

    this.setMapView(this.selectedMapView);

    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }

  selectTeeView(tee: any) {
    this.selectedTeeView = tee;
  }

  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(null);
    }
    this.markers.length = 0;

    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].setMap(null);
    }
    this.lines.length = 0;

    for (var i = 0; i < this.mapLabels.length; i++) {
      this.mapLabels[i].setMap(null);
    }
    this.mapLabels.length = 0;

    this.flagMarker[0]?.setMap(null);
    this.flagMarker.length = 0;

    this.distanceMarker[0]?.setMap(null);
    this.distanceMarker.length = 0;
  }

  disableDrag(value: boolean) {
    if (!this.signedIn) {
      this.router.navigate(['/login']);
      return;
    }
    if (value) {
      for (const marker of this.markers) {
        marker.setDraggable(true);
      }
    } else {
      for (const marker of this.markers) {
        marker.setDraggable(false);
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

    while (holeLayout.teeLocations.length > this.scorecard.length) {
      holeLayout.teeLocations.pop();
    }

    this.map.setCenter(holeLayout.location);
    if (this.isPhone) {
      this.map.setZoom(holeLayout.zoom - 1);
    } else {
      this.map.setZoom(holeLayout.zoom);
    }

    let offsetTee = this.offsetFactor;
    for (let teeLoc of holeLayout.teeLocations) {
      if (this.roundInProgress && teeLoc.id != this.selectedTeeView.id) return;

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

      if (this.roundInProgress) {
        this.lines.push(
          new google.maps.Polyline({
            path: [teeLoc, holeLayout.location],
            map: map,
            strokeWeight: 2,
          })
        );
        const inBetween = google.maps.geometry.spherical.interpolate(
          teeLoc,
          holeLayout.location,
          0.5
        );
        this.mapLabels.push(
          new google.maps.Marker({
            position: {
              lat: inBetween.lat() + 0.00006,
              lng: inBetween.lng() + 0.00012,
            },
            label: '',
            map: map,
            icon: {
              path: faFlag.icon[4] as string,
              scale: 0.0,
            },
          })
        );
      }

      // tee markers
      this.markers.push(
        new google.maps.Marker({
          position: teeLoc,
          map,
          icon: {
            path: faMapPin.icon[4] as string,
            fillColor: color,
            fillOpacity: 1,
            anchor: new google.maps.Point(
              faMapPin.icon[0] / 1.8, // width
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

    // flag marker
    const flagLoc = holeLayout.flagLocation;
    if (
      flagLoc.lat == this.googleDetails.geometry.location.lat &&
      flagLoc.lng == this.googleDetails.geometry.location.lng
    ) {
      flagLoc.lat = flagLoc.lat - this.offsetFactor;
      flagLoc.lng = flagLoc.lng + this.offsetFactor;
    }
    this.flagMarker.push(
      new google.maps.Marker({
        position: flagLoc,
        map,
        icon: {
          path: faFlag.icon[4] as string,
          fillColor: 'black',
          fillOpacity: 1,
          anchor: new google.maps.Point(
            faFlag.icon[0] / 10, // width
            faFlag.icon[1] // height
          ),
          strokeWeight: 1,
          strokeColor: '#ffffff',
          scale: 0.04,
        },
        draggable: true,
      })
    );

    if (this.roundInProgress) {
      // distance marker
      this.distanceMarker.push(
        new google.maps.Marker({
          position: holeLayout.location,
          map,
          icon: {
            path: faCircle.icon[4] as string,
            fillColor: 'black',
            fillOpacity: 1,
            anchor: new google.maps.Point(
              faCircle.icon[0] / 2, // width
              faCircle.icon[1] / 2 // height
            ),
            strokeWeight: 1,
            strokeColor: '#ffffff',
            scale: 0.03,
          },
          draggable: true,
        })
      );

      this.lines.push(
        new google.maps.Polyline({
          path: [flagLoc, holeLayout.location],
          map: map,
          strokeWeight: 2,
        })
      );
      const inBetween = google.maps.geometry.spherical.interpolate(
        flagLoc,
        holeLayout.location,
        0.5
      );
      this.mapLabels.push(
        new google.maps.Marker({
          position: {
            lat: inBetween.lat() + 0.00006,
            lng: inBetween.lng() + 0.00012,
          },
          label: '',
          map: map,
          icon: {
            path: faFlag.icon[4] as string,
            scale: 0.0,
          },
        })
      );

      this.mapLabels[0].setLabel({
        text:
          Math.round(
            this.haversine_distance(this.distanceMarker[0], this.markers[0]) *
              1760
          ) + '',
        color: 'white',
      });
      this.mapLabels[1].setLabel({
        text:
          Math.round(
            this.haversine_distance(
              this.distanceMarker[0],
              this.flagMarker[0]
            ) * 1760
          ) + '',
        color: 'white',
      });

      google.maps.event.addListener(this.distanceMarker[0], 'drag', () => {
        let disMarkerpos = { lat: 0, lng: 0 };
        disMarkerpos.lat = this.distanceMarker[0].getPosition().lat();
        disMarkerpos.lng = this.distanceMarker[0].getPosition().lng();
        for (let i = 0; i < this.lines.length; i++) {
          let path = this.lines[i].getPath().getArray();
          let markerPos = { lat: 0, lng: 0 };
          markerPos.lat = path[0].lat();
          markerPos.lng = path[0].lng();
          this.lines[i].setPath([markerPos, disMarkerpos]);
          let inBetween = google.maps.geometry.spherical.interpolate(
            markerPos,
            disMarkerpos,
            0.5
          );
          this.mapLabels[i].setPosition({
            lat: inBetween.lat() + 0.00006,
            lng: inBetween.lng(),
          });
          if (i == 0) {
            this.mapLabels[0].setLabel({
              text:
                Math.round(
                  this.haversine_distance(
                    this.distanceMarker[0],
                    this.markers[0]
                  ) * 1760
                ) + '',
              color: 'white',
            });
          } else {
            this.mapLabels[1].setLabel({
              text:
                Math.round(
                  this.haversine_distance(
                    this.distanceMarker[0],
                    this.flagMarker[0]
                  ) * 1760
                ) + '',
              color: 'white',
            });
          }
        }
      });

      google.maps.event.addListener(this.flagMarker[0], 'drag', () => {
        let flagMarkerpos = { lat: 0, lng: 0 };
        flagMarkerpos.lat = this.flagMarker[0].getPosition().lat();
        flagMarkerpos.lng = this.flagMarker[0].getPosition().lng();

        let path = this.lines[1].getPath().getArray();
        let distMarkerPos = { lat: 0, lng: 0 };
        distMarkerPos.lat = path[1].lat();
        distMarkerPos.lng = path[1].lng();
        this.lines[1].setPath([flagMarkerpos, distMarkerPos]);
        let inBetween = google.maps.geometry.spherical.interpolate(
          flagMarkerpos,
          distMarkerPos,
          0.5
        );
        this.mapLabels[1].setPosition({
          lat: inBetween.lat() + 0.00006,
          lng: inBetween.lng(),
        });

        this.mapLabels[1].setLabel({
          text:
            Math.round(
              this.haversine_distance(
                this.distanceMarker[0],
                this.flagMarker[0]
              ) * 1760
            ) + '',
          color: 'white',
        });
      });
    }
  }

  haversine_distance(mk1: any, mk2: any) {
    const R = 3958.8; // Radius of the Earth in miles
    const rlat1 = mk1.position.lat() * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = mk2.position.lat() * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon = (mk2.position.lng() - mk1.position.lng()) * (Math.PI / 180); // Radian difference (longitudes)

    const d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );
    return d;
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

    this.courseData.mapLayout = response.course.mapLayout;
    this.setMapView(this.selectedMapView);
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

    layoutData.flagLocation.lat = this.flagMarker[0].getPosition()?.lat();
    layoutData.flagLocation.lng = this.flagMarker[0].getPosition()?.lng();

    await this.courseService.update(
      this.selectedCourse.reference,
      response.course.mapLayout,
      'mapLayout'
    );

    this.courseData.mapLayout = response.course.mapLayout;
    this.setMapView(this.selectedMapView);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 830) {
      this.isPhone = true;
    } else {
      this.isPhone = false;
    }
  }
}
