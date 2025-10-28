import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // in milliseconds, 0 means persistent
}

export interface ConfirmationDialog {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  private confirmationSubject = new BehaviorSubject<ConfirmationDialog | null>(null);
  public confirmation$ = this.confirmationSubject.asObservable();

  constructor() {}

  /**
   * Show a success alert
   */
  success(title: string, message: string, duration: number = 5000): void {
    this.show('success', title, message, duration);
  }

  /**
   * Show an error alert
   */
  error(title: string, message: string, duration: number = 7000): void {
    this.show('error', title, message, duration);
  }

  /**
   * Show a warning alert
   */
  warning(title: string, message: string, duration: number = 6000): void {
    this.show('warning', title, message, duration);
  }

  /**
   * Show an info alert
   */
  info(title: string, message: string, duration: number = 5000): void {
    this.show('info', title, message, duration);
  }

  /**
   * Show a custom alert
   */
  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000): void {
    const alert: Alert = {
      id: this.generateId(),
      type,
      title,
      message,
      duration
    };

    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next([...currentAlerts, alert]);

    // Auto-remove after duration if not persistent
    if (duration > 0) {
      setTimeout(() => {
        this.remove(alert.id);
      }, duration);
    }
  }

  /**
   * Remove an alert by ID
   */
  remove(id: string): void {
    const currentAlerts = this.alertsSubject.value;
    this.alertsSubject.next(currentAlerts.filter(alert => alert.id !== id));
  }

  /**
   * Clear all alerts
   */
  clear(): void {
    this.alertsSubject.next([]);
  }

  /**
   * Show a confirmation dialog
   */
  confirm(title: string, message: string, options?: {
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const dialog: ConfirmationDialog = {
        id: this.generateId(),
        title,
        message,
        confirmText: options?.confirmText || 'Confirm',
        cancelText: options?.cancelText || 'Cancel',
        type: options?.type || 'warning'
      };

      this.confirmationSubject.next(dialog);

      // Store the resolve function to be called when user responds
      (this as any).pendingConfirmations = (this as any).pendingConfirmations || new Map();
      (this as any).pendingConfirmations.set(dialog.id, resolve);
    });
  }

  /**
   * Handle confirmation response
   */
  confirmResponse(confirmed: boolean): void {
    const currentDialog = this.confirmationSubject.value;
    if (currentDialog) {
      const resolve = (this as any).pendingConfirmations?.get(currentDialog.id);
      if (resolve) {
        resolve(confirmed);
        (this as any).pendingConfirmations.delete(currentDialog.id);
      }
      this.confirmationSubject.next(null);
    }
  }

  /**
   * Cancel current confirmation dialog
   */
  cancelConfirmation(): void {
    this.confirmResponse(false);
  }

  /**
   * Generate a unique ID for alerts
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
