import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DefaultService } from '../Services/defaultGets.service';
import { SelectChangeEvent } from 'primeng/select';
import { HttpClient } from '@angular/common/http';
import { Projects, Tasks } from '../modals/modal';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedModule } from '../shared/shared.module';
import { NavbarComponent } from '../common/navbar/navbar.component';

@Component({
  selector: 'app-time-tracker',
  imports: [
    NavbarComponent,
    SharedModule,
    CommonModule,
    FormsModule,
  ],
  standalone: true,
  templateUrl: './time-tracker.component.html',
  styleUrl: './time-tracker.component.scss',
  providers: [MessageService]
})
export class TimeTrackerComponent implements OnInit {
  taskss: any[] = [{ delete: '', clone: '', c_name: '', p_name: '', t_name: '', start_time: 0, end_time: 0, totalTime: 0, description: '' }];
  dates: Date = new Date
  maxDate: Date | undefined;
  id!: number;
  clients: { c_name: string, id: number }[] = []
  selectedClients: string = ''

  projects: { p_name: string, id: number }[] = []
  selectedprojects: string = ''

  tasks: { t_name: string, id: number, p_id?: number }[] = []
  selectedtasks: string = ''
  isDateDisabled: boolean = true;
  toggleDateField() {
    this.isDateDisabled = !this.isDateDisabled;
  }

  constructor(private getServices: DefaultService, private httpClient: HttpClient, private messageService: MessageService) { }

  getProjects(row: any) {
    const url = `http://localhost:3000/projects?c_id=${row.selectedClients.id}`
    this.httpClient.get<Projects[]>(url).subscribe(
      (res) => {
        row.projects = res
      }
    )
  }
  getTasks(row: any) {
    const url = `http://localhost:3000/tasks?p_id=${row.selectedprojects.id}`
    this.httpClient.get<Tasks[]>(url).subscribe(
      (res) => {
        row.tasks = res
      }
    )
  }
  getTaskName(number: SelectChangeEvent) {
    this.selectedtasks = number.value.t_name
  }
  save() {
    // Group tasks by client and project
    const groupedTasks = this.taskss.reduce((acc, task) => {
      const clientName = task.selectedClients?.c_name;
      const projectName = task.selectedprojects?.p_name;
      const key = `${clientName}_${projectName}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      // Format individual task details
      const taskName = typeof task.selectedtasks?.t_name === 'object'
        ? task.selectedtasks?.t_name.t_name
        : task.selectedtasks?.t_name;

      const startTime = task.start_time ? new Date(task.start_time).getTime() : null;
      const endTime = task.end_time ? new Date(task.end_time).getTime() : null;

      let totalTime = '0hr 0min 0sec';
      if (startTime && endTime && endTime > startTime) {
        const totalTimeInMs = endTime - startTime;
        const hours = Math.floor(totalTimeInMs / 3600000);
        const minutes = Math.floor((totalTimeInMs % 3600000) / 60000);
        const seconds = Math.floor((totalTimeInMs % 60000) / 1000);
        totalTime = `${hours}hr ${minutes}min ${seconds}sec`;
      }
      acc[key].push({
        taskName,
        startTime,
        endTime,
        totalTime,
        description: task.description,
      });

      return acc;
    }, {});

    // Create request body entries for each client-project pair
    const requestBodies = Object.entries(groupedTasks).map(([key, tasks]) => {
      const [clientName, projectName] = key.split('_');
      return {
        u_id: this.id,
        date: this.formatDate(this.dates),
        c_name: clientName,
        p_name: projectName,
        tasks,
      };
    });

    // Send each grouped entry to the backend
    const url = `http://localhost:3000/logs`;
    requestBodies.forEach((requestBody) => {
      this.httpClient.post(url, requestBody).subscribe(
        (res) => {
          console.log('Data saved successfully:', res);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Data for ${requestBody.c_name} - ${requestBody.p_name} saved successfully!`,
          });
        },
        (error) => {
          console.error('Error saving data:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to save data for ${requestBody.c_name} - ${requestBody.p_name}!`,
          });
        }
      );
    });
  }
  getLogsForDate() {
    const formattedDate = this.formatDate(this.dates); // Format the selected date
    const url = `http://localhost:3000/logs/getByDate?u_id=${this.id}&date=${formattedDate}`;

    this.httpClient.get<{ logs: any[] }>(url).subscribe(
      (res) => {
        if (res.logs && res.logs.length > 0) {
          this.taskss = res.logs.flatMap((log) =>
            log.tasks.map((task: any) => ({
              delete: '',
              clone: '',
              c_name: log?.c_name,
              p_name: log?.p_name,
              t_name: task?.taskName,
              start_time: task?.startTime,
              end_time: task?.endTime,
              totalTime: task?.totalTime,
              description: task?.description || '',
            }))
          );
          console.log('Logs fetched successfully:', res.logs);
        } else {
          this.taskss = [];
          this.messageService.add({
            severity: 'info',
            summary: 'No Logs Found',
            detail: 'No logs found for the selected date.',
          });
        }
      },
      (error) => {
        console.error('Error fetching logs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch logs for the selected date.',
        });
      }
    );
  }
  convertMillisecondsToTime(timestamp: number): string {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  onDateChange() {
    const today = new Date().toISOString().split('T')[0];
    const selectedDate = this.dates.toISOString().split('T')[0];

    if (selectedDate < today) {
      this.getLogsForDate();
    } else {
      this.taskss = [{ delete: '', clone: '', c_name: '', p_name: '', t_name: '', start_time: 0, end_time: 0, totalTime: 0, description: '' }];
    }
  }


  MAX_TASK_TIME = 9 * 3600000;
  totalElapsedTime = 0;
  sharedProgress = 0;

  calculateTotalTime(task: any, event: any) {
    if (task.start_time && task.end_time) {
      const startTime = new Date(task.start_time).getTime();
      const endTime = new Date(task.end_time).getTime();

      if (endTime <= startTime) {
        task.totalTime = "Invalid time range";
        task.displayedTime = "Invalid time range";
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid Time',
          detail: `End time must be after start time.`,
        });
        return;
      }

      const elapsedTimeInMs = endTime - startTime;
      const previousTaskTime = task.previousElapsedTime || 0;
      const newTotalElapsedTime = this.totalElapsedTime - previousTaskTime + elapsedTimeInMs;

      if (newTotalElapsedTime > this.MAX_TASK_TIME) {
        this.messageService.add({
          severity: 'error',
          summary: 'Limit Exceeded',
          detail: `Cannot add time. Total time exceeds the 9-hour limit.`,
        });
        task.totalTime = "Exceeds limit";
        task.displayedTime = "Exceeds limit";
        return;
      }
      task.totalTime = this.formatTime(elapsedTimeInMs);
      task.displayedTime = task.totalTime;

      this.totalElapsedTime = newTotalElapsedTime;
      task.previousElapsedTime = elapsedTimeInMs;
      this.updateSharedProgress();
    }
  }


  updateSharedProgress() {
    const cappedTimeInMs = Math.min(this.totalElapsedTime, this.MAX_TASK_TIME);
    this.sharedProgress = (cappedTimeInMs / this.MAX_TASK_TIME) * 100;
    if (this.sharedProgress >= 100) {
      this.sharedProgress = 100;
      this.messageService.add({
        severity: 'info',
        summary: 'Success',
        detail: 'Reached the maximum allowed time (9 hours).',
      });
    }
  }


  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${hours}hr ${minutes}min`;
  }

  addRow() {
    const clonedRow = {}
    this.taskss.push(clonedRow)
  }


  cloneData(data: any) {
    const clonedRow = {
      ...data,
      c_name: data.selectedClients?.c_name || data.c_name,
      p_name: data.selectedprojects?.p_name || data.p_name,
      t_name: data.selectedtasks?.t_name || data.t_name,
    };
    const lastTaskEndTime = this.taskss.length
      ? new Date(this.taskss[this.taskss.length - 1].end_time).getTime()
      : new Date().getTime();

    const newStartTime = new Date(lastTaskEndTime + 3600000);
    const newEndTime = new Date(newStartTime.getTime() + 3600000);
    if (this.totalElapsedTime + (newEndTime.getTime() - newStartTime.getTime()) > this.MAX_TASK_TIME) {
      this.messageService.add({
        severity: 'error',
        summary: 'Limit Exceeded',
        detail: `Cannot clone the row. Total time exceeds the 9-hour limit.`,
      });
      return;
    }
    clonedRow.start_time = newStartTime;
    clonedRow.end_time = newEndTime;
    clonedRow.totalTime = this.formatTime(newEndTime.getTime() - newStartTime.getTime());
    clonedRow.previousElapsedTime = newEndTime.getTime() - newStartTime.getTime();
    clonedRow.description = '';
    this.taskss.push(clonedRow);
    this.totalElapsedTime += newEndTime.getTime() - newStartTime.getTime();
    this.updateSharedProgress();
  }


  deleteRow(row: any) {
    this.taskss = this.taskss.filter((task) => task !== row);
  }
  ngOnInit() {
    this.getServices.getCLient().subscribe(
      (res) => {
        this.clients = res
      }
    )
    this.getServices.getMe().subscribe(
      (res) => {
        this.id = res.user.id
        // this.getLogs()
      }
    )
    let today = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(today.getDate() + 3);
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }

}
