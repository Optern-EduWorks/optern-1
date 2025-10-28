import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, Alert } from '../../services/alert.service';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrls: ['./alert.css']
})
export class AlertComponent {
  private alertService = inject(AlertService);
  alerts: Alert[] = [];

  constructor() {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  removeAlert(id: string): void {
    this.alertService.remove(id);
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-exclamation-triangle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  }

  getAlertClass(type: string): string {
    return `alert alert-${type}`;
  }
}
