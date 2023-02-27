import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { StartRoundPageComponent } from './components/start-round-page/start-round-page.component';
import { StatsPageComponent } from './components/stats-page/stats-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent},
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'course', component: CoursePageComponent },
  { path: 'stats', component: StatsPageComponent },
  { path: 'rounds', component: StatsPageComponent },
  { path: 'start_round', component: StartRoundPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
