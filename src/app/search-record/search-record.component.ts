import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { SharedModule } from '../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { DefaultService } from '../Services/defaultGets.service';
import { SelectChangeEvent } from 'primeng/select';
import { Logs, Projects, Tasks } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-record',
  imports: [
    NavbarComponent,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './search-record.component.html',
  styleUrl: './search-record.component.scss',
  providers: [MessageService]
})
export class SearchRecordComponent implements OnInit {
  logs: Logs[] = [];
  id!: number;
  fromDate: Date = new Date
  toDate: Date = new Date

  clients: { c_name: string, id: number }[] = []
  selectedClients: string = ''

  projects: { p_name: string, id: number }[] = []
  selectedprojects: string = ''

  tasks: { t_name: string, id: number, p_id?: number }[] = []
  selectedtasks: string = ''

  constructor(private getServices: DefaultService, private httpClient: HttpClient, private messageService: MessageService) { }

  getProjects(number: SelectChangeEvent) {
    this.selectedClients = number.value.c_name
    const url = `http://localhost:3000/projects?c_id=${number.value.id}`
    this.httpClient.get<Projects[]>(url).subscribe(
      (res) => {
        this.projects = res
      }
    )
  }
  getTasks(number: SelectChangeEvent) {
    this.selectedprojects = number.value.p_name
    const url = `http://localhost:3000/tasks?p_id=${number.value.id}`
    this.httpClient.get<Tasks[]>(url).subscribe(
      (res) => {
        this.tasks = res
      }
    )
  }
  getData() {
    const FromDate = this.formatDate(this.fromDate);
    const ToDate = this.formatDate(this.toDate);

    let url: string;
    if (this.selectedClients && this.selectedprojects) {
      url = `http://localhost:3000/logs/getData?u_id=${this.id}
    &client_name=${this.selectedClients}&project_name=${this.selectedprojects}&from_date=${FromDate}&to_date=${ToDate}`;
    } else {
      url = `http://localhost:3000/logs/getAllLogs?u_id=${this.id}&from_date=${FromDate}&to_date=${ToDate}`;
    }
    this.httpClient.get<{ logs: Logs[] }>(url).subscribe(
      (res) => {
        this.logs = res.logs;
        this.selectedClients = ''
        this.selectedprojects = ''
      }
    );

  }

  ngOnInit(): void {
    this.getServices.getCLient().subscribe(
      (res) => {
        this.clients = res
      }
    )
    this.getServices.getMe().subscribe(
      (res) => {
        this.id = res.user.id
      }
    )
  }
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
  convertMillisecondsToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
