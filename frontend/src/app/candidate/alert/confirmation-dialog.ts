import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, ConfirmationDialog } from '../../services/alert.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.html',
  styleUrls: ['./confirmation-dialog.css']
})
export class ConfirmationDialogComponent {
  private alertService = inject(AlertService);
  dialog: ConfirmationDialog | null = null;

  constructor() {
    this.alertService.confirmation$.subscribe(dialog => {
      this.dialog = dialog;
    });
  }

  confirm(): void {
    this.alertService.confirmResponse(true);
  }

  cancel(): void {
    this.alertService.confirmResponse(false);
  }

  getDialogIcon(type?: string): string {
    switch (type) {
      case 'danger': return 'bi-exclamation-triangle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-question-circle-fill';
    }
  }

  getDialogClass(type?: string): string {
    return `confirmation-dialog confirmation-${type || 'warning'}`;
  }
}
