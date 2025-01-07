import { Component } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';

@Component({
  selector: 'app-home',
  imports: [NavbarComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
