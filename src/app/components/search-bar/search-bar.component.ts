import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { ROOT_URL } from '../../utilities/enviroment';
import { CourseDetailsService } from '../../services/course-details.service';
import { Subject, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  subscriptions: Subscription = new Subscription();
  userData: any;
  search!: string;
  courses: any = [];
  sessionToken: any = null;
  src: any = '../../../assets/check.png';
  isLoading: boolean = false;
  amountToDisplay: number = 5;

  constructor(
    private http: HttpClient,
    private courseService: CourseDetailsService,
    private userService: UserService,
    private authService: AuthenticationService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    this.setBorder();

    this.subscriptions.add(
      this.authService.user.asObservable().subscribe(async (value) => {
        if (value) {
          this.isLoading = true;
          this.userData = value;
          if (value.favCourses) {
            if (Object.keys(this.userData.favCourses).length == 0) {
              const response: any = await this.courseService.getCoursesByClicks(
                15
              );
              for (let course of response.courses) {
                this.courses.push(course.googleDetails);
              }
            } else {
              const items = Object.keys(this.userData.favCourses).map((key) => {
                return [key, this.userData.favCourses[key]];
              });
              items.sort((first, second) => {
                return second[1] - first[1];
              });
              items.slice(0, this.amountToDisplay * 3);
              const response: any = await this.courseService.getCourses(items);
              for (let course of response.courses) {
                this.courses.push(course.googleDetails);
              }
            }
          } else {
            this.userData.favCourses = {};
            await this.userService.update(this.userData);
          }
          this.isLoading = false;
          this.setBorder();
        }
      })
    );

    this.subscriptions.add(
      this.authService.token.asObservable().subscribe(async (value) => {
        if (value == '') {
          const response: any = await this.courseService.getCoursesByClicks(15);
          for (let course of response.courses) {
            this.courses.push(course.googleDetails);
          }
          this.isLoading = false;
          this.setBorder();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  async resetSession(data: any) {
    this.sessionToken = null;
    await this.courseService.addClick(data.reference);
  }

  async searchCourses() {
    this.amountToDisplay = 5;
    this.courses = [];

    if (this.sessionToken == null) {
      this.sessionToken = uuidv4();
    }

    if (this.search.length > 0) {
      document.getElementById('homepageSearch')!.style.borderRadius =
        '10px 10px 0px 0px';
      try {
        this.isLoading = true;
        let searchRes: any = await this.courseService.searchCourses(
          this.search
        );
        let temp = searchRes.data.sort((a: any, b: any) => {
          return b.clicks - a.clicks;
        });
        for (let index of temp) {
          this.courses.push(index.course);
        }
        this.setBorder();

        console.log('from database: ', this.courses);

        if (this.courses.length < 5) {
          try {
            const res: any = await this.getCourses();
            this.courses = res.results.filter((course: any) => {
              return (
                !course.name.toLowerCase().includes('mini') &&
                !course.name.toLowerCase().includes('disc') &&
                !course.name.toLowerCase().includes('simulator') &&
                course.name.toLowerCase().includes('golf') &&
                (course.name.toLowerCase().includes('pine') ||
                  course.name.toLowerCase().includes('link') ||
                  course.name.toLowerCase().includes('course') ||
                  course.name.toLowerCase().includes('club'))
              );
            });
            this.setBorder();
            this.isLoading = false;

            console.log('from googleAPI: ', this.courses);

            this.http
              .post(ROOT_URL + 'courses/add', {
                courses: this.courses,
              })
              .subscribe(() => {});
          } catch (error) {
            console.log(error);
          }
        }
        this.isLoading = false;
      } catch (error: any) {
        console.log(error.error.error);
      }
    } else {
      document.getElementById('homepageSearch')!.style.borderRadius = '10px';
    }
  }

  setBorder() {
    try {
      if (this.courses.length > 0 || this.isLoading) {
        document.getElementById('homepageSearch')!.style.borderRadius =
          '10px 10px 0px 0px';
      } else {
        document.getElementById('homepageSearch')!.style.borderRadius = '10px';
      }
    } catch (error) {}
  }

  showMore() {
    this.amountToDisplay = this.courses.length;
  }

  getCourses() {
    return new Promise((resolve, reject) => {
      this.http
        .get(ROOT_URL + 'google/search', {
          params: new HttpParams()
            .set('search', this.search)
            .set('sessionToken', this.sessionToken),
        })
        .subscribe({
          next: (data) => {
            return resolve(data);
          },
          error: (error) => {
            return reject(error);
          },
        });
    });
  }
}
