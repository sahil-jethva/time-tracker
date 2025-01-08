import { Routes } from '@angular/router';
import { NavbarComponent } from './common/navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';
import { RegisterComponent } from './authentication/register/register.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthGuardService } from './Services/auth-guard.service';
import { ProtectedAuthGuardService } from './Services/protected-auth-guard.service';
import { LogoutComponent } from './authentication/logout/logout.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [AuthGuardService] },
  { path: 'Navbar', component: NavbarComponent },
  { path: 'Home', component: HomeComponent,canActivate:[ProtectedAuthGuardService] },
  { path: 'timeTracker', component: TimeTrackerComponent, canActivate: [ProtectedAuthGuardService] },
  { path: 'Register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {path:'logout',component:LogoutComponent}
];
