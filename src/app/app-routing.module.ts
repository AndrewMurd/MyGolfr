import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { StartRoundPageComponent } from './components/start-round-page/start-round-page.component';
import { StatsPageComponent } from './components/stats-page/stats-page.component';
import { RoundsPageComponent } from './components/rounds-page/rounds-page.component';
import { RoundInProgressPageComponent } from './components/round-in-progress-page/round-in-progress-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent},
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'course/:id', component: CoursePageComponent },
  { path: 'stats', component: StatsPageComponent },
  { path: 'rounds', component: RoundsPageComponent },
  { path: 'round/:id', component: RoundsPageComponent }, // when clicking on a round in rounds not implemented
  { path: 'start-round/:id', component: StartRoundPageComponent },
  { path: 'round/in-progress/:id', component: RoundInProgressPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
