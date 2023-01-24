import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { StartScoreComponent } from './components/start-score/start-score.component';
import { ScorecardComponent } from './components/scorecard/scorecard.component';
import { ScorecardInputComponent } from './components/scorecard-input/scorecard-input.component';
import { NewGolfCourseScoreCardComponent } from './components/new-golf-course-score-card/new-golf-course-score-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomePageComponent,
    StartScoreComponent,
    ScorecardComponent,
    ScorecardInputComponent,
    NewGolfCourseScoreCardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
