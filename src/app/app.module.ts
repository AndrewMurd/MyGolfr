import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { GoogleMapsModule } from '@angular/google-maps';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { StartScoreComponent } from './components/start-score/start-score.component';
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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomePageComponent,
    StartScoreComponent,
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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
    GoogleMapsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
