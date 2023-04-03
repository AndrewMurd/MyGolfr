import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { faFlag, faMapPin, faCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable, Subscription, take } from 'rxjs';
import { ScoreService } from 'src/app/services/score.service';
import { AuthenticationService } from '../../services/authentication.service';
import { CourseDetailsService } from '../../services/course-details.service';
import { createRange, getRGB, getColorWhite } from '../../utilities/functions';
import { LoadingService } from 'src/app/services/loading.service';

// this component is a map view of the currently viewed course in course page or in progress round page
@Component({
  selector: 'app-course-map',
  templateUrl: './course-map.component.html',
  styleUrls: ['./course-map.component.scss'],
})
export class CourseMapComponent {
  subscriptions: Subscription = new Subscription();
  @Input() changeView!: Observable<any>;
  @Input() mapHeight: string = '400px';
  @Output() changedView: EventEmitter<any> = new EventEmitter();
  courseData: any;
  scoreData: any;
  signedIn: boolean = false;
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
  offsetFactor = 0.0006; // ofset placed on markers to spread them apart
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
    private scoreService: ScoreService,
    private loadingService: LoadingService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.map = new google.maps.Map(
      document.getElementById('map') as HTMLElement,
      {
        zoom: 16,
        center: this.center,
        mapTypeId: 'hybrid',
        minZoom: 15,
        heading: 0,
        tilt: 0,
        disableDefaultUI: true,
        mapId: '90f87356969d889c',
      }
    );

    let map = this.map;

    const buttons: [string, string, number, google.maps.ControlPosition][] = [
      ['Rotate Left', 'rotate', 20, google.maps.ControlPosition.LEFT_CENTER],
      ['Rotate Right', 'rotate', -20, google.maps.ControlPosition.RIGHT_CENTER],
      // ['Tilt Down', 'tilt', 20, google.maps.ControlPosition.TOP_CENTER],
      // ['Tilt Up', 'tilt', -20, google.maps.ControlPosition.BOTTOM_CENTER],
    ];

    buttons.forEach(([text, mode, amount, position]) => {
      const controlDiv = document.createElement('div');
      const controlUI = document.createElement('button');

      controlUI.classList.add('ui-button');
      controlUI.innerText = `${text}`;
      controlUI.addEventListener('click', () => {
        adjustMap(mode, amount);
      });
      controlDiv.appendChild(controlUI);
      map.controls[position].push(controlDiv);
    });

    const adjustMap = (mode: string, amount: number) => {
      switch (mode) {
        case 'tilt':
          map.setTilt(map.getTilt()! + amount);
          break;
        case 'rotate':
          map.setHeading(map.getHeading()! + amount);
          break;
        default:
          break;
      }
    };

    this.subscriptions.add(
      this.authService.token.asObservable().subscribe((value) => {
        if (value) {
          this.signedIn = true;
        } else {
          this.signedIn = false;
        }
      })
    );

    this.subscriptions.add(
      this.scoreService.inProgressScoreData
        .asObservable()
        .subscribe((value) => {
          // check whether map is being used for course page or in progress round page
          if (this.router.url.split('/')[1] == 'course') {
            this.scoreData = value;
            this.roundInProgress = false;
            return;
          }
          if (value) {
            // set data for in progress round
            this.roundInProgress = true;
            this.scoreData = value;
            this.courseData = JSON.parse(JSON.stringify(this.scoreData));
            this.courseData.id = this.courseData.googleDetails.reference;
            this.selectedTeeView = this.scoreData.teeData;
            this.reload();
          } else {
            this.scoreData = null;
            this.roundInProgress = false;
          }
        })
    );

    this.subscriptions.add(
      this.courseService.courseData.asObservable().subscribe((value) => {
        if (value && this.roundInProgress == false) {
          this.courseData = value;
          this.reload();
        }
      })
    );

    // change view of map based on hole
    if (this.changeView) {
      this.subscriptions.add(
        this.changeView.subscribe((value) => {
          this.setMapView(value);
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // reloads map with correct selectedMapView (hole) value
  reload() {
    this.loadingService.loading.next(true);
    this.center.lat = this.courseData.googleDetails.geometry.location.lat;
    this.center.lng = this.courseData.googleDetails.geometry.location.lng;
    this.map.setCenter(this.center);

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
    this.loadingService.loading.next(false);
  }
  // clear map of all markers on reload
  clearOverlays() {
    for (var i = 0; i < this.markers.length; i++) {
      this.markers[i][0].setMap(null);
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
        marker[0].setDraggable(true);
      }
    } else {
      for (const marker of this.markers) {
        marker[0].setDraggable(false);
      }
    }
  }

  async setMapView(a: any) {
    this.selectedMapView = `${a}`;
    // tell other component the view was changed
    this.changedView.emit(this.selectedMapView);
    let map = this.map;

    // check whether view is of whole course or a specific hole
    if (a === 'course') {
      this.map.setCenter(this.center);
      this.map.setZoom(16);
      this.clearOverlays();
      return;
    } else {
      this.clearOverlays();
    }

    let holeLayout;
    try {
      // remove reference on layout data for ease of use and easier manipulation
      holeLayout = JSON.parse(JSON.stringify(this.layoutData[a]));
    } catch (err) {
      return;
    }

    // remove layout data for each tee that isnt for in progress round
    if (this.scorecard.length == 1) {
      holeLayout.teeLocations = holeLayout.teeLocations.filter(
        (teeLoc: any) => {
          return teeLoc.id == this.scorecard[0].id;
        }
      );
    }

    // set center and zoom on map for the hole based on user set view
    this.map.setCenter(holeLayout.location);
    this.map.setHeading(holeLayout.heading);
    if (this.isPhone) {
      this.map.setZoom(holeLayout.zoom - 2);
    } else {
      this.map.setZoom(holeLayout.zoom);
    }

    var offsetTee = this.offsetFactor;
    for (const teeLoc of holeLayout.teeLocations) {
      // if round is in progress skip all tees that arent being played
      if (this.roundInProgress && teeLoc.id != this.scoreData.teeData.id)
        continue;
      // get correct color of tee for map info display
      let color;
      let colorName;
      for (let tee of this.scorecard) {
        if (tee.id == teeLoc.id) {
          if (!tee.Color) {
            color = '';
          } else {
            color = tee.Color;
            colorName = tee.ColorName;
          }
        }
      }
      if (this.roundInProgress) {
        // create polyline from tee location center of view at the distance marker
        this.lines.push(
          new google.maps.Polyline({
            path: [teeLoc, holeLayout.location],
            map: map,
            strokeWeight: 2,
          })
        );
        // calculate center of polyline
        const inBetween = google.maps.geometry.spherical.interpolate(
          teeLoc,
          holeLayout.location,
          0.5
        );
        // push label for distance measurment between tee and distance marker
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

      // if tee has not been moved by user create offset on each tee displayed
      let lng: number = teeLoc.lng;
      if (
        teeLoc.lat == holeLayout.location.lat ||
        teeLoc.lng == holeLayout.location.lng ||
        teeLoc.lat == this.googleDetails.geometry.location.lat ||
        teeLoc.lng == this.googleDetails.geometry.location.lng
      ) {
        lng += offsetTee;
        offsetTee += this.offsetFactor;
      }

      // tee marker
      this.markers.push([
        new google.maps.Marker({
          position: { lat: teeLoc.lat, lng: lng },
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
          title: `${colorName}`,
        }),
        teeLoc.id,
      ]);
    }

    // flag marker
    const flagLoc = holeLayout.flagLocation;
    if (
      flagLoc.lat == this.googleDetails.geometry.location.lat &&
      flagLoc.lng == this.googleDetails.geometry.location.lng
    ) {
      flagLoc.lat -= this.offsetFactor;
      flagLoc.lng += this.offsetFactor;
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
      // distance marker that is dragged by user for distance info
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
      // polyline between distance marker (at center of view) and the flag marker
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
      // create another label for distance between distance marker and flag
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
      // set inital distance measurments
      this.mapLabels[0].setLabel({
        text:
          Math.round(
            this.haversine_distance(
              this.distanceMarker[0],
              this.markers[0][0]
            ) * 1760
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
      // calculates distance between tee and distance marker when distance marker is being dragged
      google.maps.event.addListener(this.distanceMarker[0], 'drag', () => {
        // current distance marker position
        let disMarkerpos = { lat: 0, lng: 0 };
        disMarkerpos.lat = this.distanceMarker[0].getPosition().lat();
        disMarkerpos.lng = this.distanceMarker[0].getPosition().lng();
        for (let i = 0; i < this.lines.length; i++) {
          // redraw path of the polyline based on change in distance marker's position
          let path = this.lines[i].getPath().getArray();
          let markerPos = { lat: 0, lng: 0 };
          markerPos.lat = path[0].lat();
          markerPos.lng = path[0].lng();
          this.lines[i].setPath([markerPos, disMarkerpos]);
          // move label based on change
          let inBetween = google.maps.geometry.spherical.interpolate(
            markerPos,
            disMarkerpos,
            0.5
          );
          this.mapLabels[i].setPosition({
            lat: inBetween.lat() + 0.00006,
            lng: inBetween.lng(),
          });
          // recalculate distance based on change
          if (i == 0) {
            this.mapLabels[0].setLabel({
              text:
                Math.round(
                  this.haversine_distance(
                    this.distanceMarker[0],
                    this.markers[0][0]
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
      // calculates distance between flag and distance marker when flag marker is being dragged
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
  // Sets hole view and marker location when in editing mode
  async setHoleLayout() {
    this.loadingService.loading.next(true);
    if (this.selectedMapView == 'course') return;

    // get current view
    this.courseData.mapLayout[this.selectedMapView].location.lat = this.map
      .getCenter()!
      .lat();
    this.courseData.mapLayout[this.selectedMapView].location.lng = this.map
      .getCenter()!
      .lng();
    this.courseData.mapLayout[this.selectedMapView].zoom = this.map.getZoom();
    this.courseData.mapLayout[this.selectedMapView].heading =
      this.map.getHeading();
    // get position of tee markers
    if (this.markers.length != 0) {
      const layoutData = this.courseData.mapLayout[this.selectedMapView];
      for (let teeLoc of layoutData.teeLocations) {
        for (let marker of this.markers) {
          if (teeLoc.id == marker[1]) {
            teeLoc.lat = marker[0].getPosition().lat();
            teeLoc.lng = marker[0].getPosition().lng();
          }
        }
      }
      // get flag location
      layoutData.flagLocation.lat = this.flagMarker[0].getPosition()?.lat();
      layoutData.flagLocation.lng = this.flagMarker[0].getPosition()?.lng();
    }
    // update hole map data in database
    await this.courseService.update(this.courseData);
    this.courseService.courseData.next(this.courseData);
    if (this.scoreData) {
      this.scoreData.mapLayout = JSON.parse(
        JSON.stringify(this.courseData.mapLayout)
      );
      this.scoreService.inProgressScoreData.next(this.scoreData);
    }
    this.loadingService.loading.next(false);
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
