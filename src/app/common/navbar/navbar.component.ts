import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MegaMenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MegaMenu } from 'primeng/megamenu';
@Component({
  selector: 'app-navbar',
  imports: [ButtonModule, MegaMenu, CommonModule, AvatarModule,RouterLink],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  items: MegaMenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home',
        root: true,
        routerLink: '/Home'
      },
      {
        label: 'Time-Tracker',
        icon: 'pi pi-clock',
        root: true,
        routerLink:'/timeTracker'
      }
    ];
  }
}
