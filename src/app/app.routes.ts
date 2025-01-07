import { Routes } from '@angular/router';
import { NavbarComponent } from './common/navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';

export const routes: Routes = [
  {path:'',component:HomeComponent},
  { path: 'Navbar', component: NavbarComponent },
  { path: 'Home', component: HomeComponent },
  {path:'timeTracker',component:TimeTrackerComponent}
];
