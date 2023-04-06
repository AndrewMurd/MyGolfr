import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';
import { HammerModule } from '../../node_modules/@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ScorecardInputComponent } from './components/scorecard-input/scorecard-input.component';
import { EditScoreCardComponent } from './components/edit-score-card/edit-score-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { RegisterPageComponent } from './components/register-page/register-page.component';
import { SearchItemComponent } from './components/search-item/search-item.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { CoursePageComponent } from './components/course-page/course-page.component';
import { StartRoundPageComponent } from './components/start-round-page/start-round-page.component';
import { NewScorecardTeeComponent } from './components/new-scorecard-tee/new-scorecard-tee.component';
import { ScorecardHeaderComponent } from './components/scorecard-header/scorecard-header.component';
import { CourseMapComponent } from './components/course-map/course-map.component';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { ActiveScorecardComponent } from './components/active-scorecard/active-scorecard.component';
import { ActiveTeeComponent } from './components/active-tee/active-tee.component';
import { ScoreInputComponent } from './components/score-input/score-input.component';
import { StatsPageComponent } from './components/stats-page/stats-page.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { RoundsPageComponent } from './components/rounds-page/rounds-page.component';
import { ConfirmationPopupComponent } from './components/confirmation-popup/confirmation-popup.component';
import { RoundInProgressPageComponent } from './components/round-in-progress-page/round-in-progress-page.component';
import { RoundPageComponent } from './components/round-page/round-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AccountComponent } from './components/account/account.component';
import { ProfilePageComponent } from './components/profile-page/profile-page.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomePageComponent,
    ScorecardInputComponent,
    EditScoreCardComponent,
    LoginPageComponent,
    RegisterPageComponent,
    SearchItemComponent,
    SearchBarComponent,
    CoursePageComponent,
    StartRoundPageComponent,
    NewScorecardTeeComponent,
    ScorecardHeaderComponent,
    CourseMapComponent,
    LoadingAnimationComponent,
    ActiveScorecardComponent,
    ActiveTeeComponent,
    ScoreInputComponent,
    StatsPageComponent,
    ClickOutsideDirective,
    RoundsPageComponent,
    ConfirmationPopupComponent,
    RoundInProgressPageComponent,
    RoundPageComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AccountComponent,
    ProfilePageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
    GoogleMapsModule,
    HammerModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
