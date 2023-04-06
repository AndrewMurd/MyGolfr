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
import { RoundPageComponent } from './components/round-page/round-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'password-reset/:token', component: ResetPasswordComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'course/:id', component: CoursePageComponent },
  // { path: 'stats/:id', component: StatsPageComponent },
  // { path: 'rounds/:id', component: RoundsPageComponent },
  { path: 'profile/:location/:id', component: ProfilePageComponent },
  { path: 'round/:id', component: RoundPageComponent },
  { path: 'start-round/:id', component: StartRoundPageComponent },
  { path: 'round/in-progress/:id', component: RoundInProgressPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
