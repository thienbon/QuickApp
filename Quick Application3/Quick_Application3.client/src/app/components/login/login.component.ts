// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { ConfigurationService } from '../../services/configuration.service';
import { LocalStoreManager } from '../../services/local-store-manager.service';
import { Utilities } from '../../services/utilities';
import { Router } from '@angular/router';

import { UserLogin } from '../../models/user-login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent implements OnInit, OnDestroy {
  userLogin = new UserLogin();
  isLoading = false;
  formResetToggle = true;
  modalClosedCallback: { (): void } | undefined;
  loginStatusSubscription: Subscription | undefined;
  private failedAttempts = 0;
  public isBlocked = false;
  private blockTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly MAX_ATTEMPTS = 3;
  private readonly BLOCK_DURATION = 30000;
  remainingTime: number = 0;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;



  @Input()
  isModal = false;


  constructor(private alertService: AlertService, 
    private authService: AuthService, 
    private configurations: ConfigurationService, private router: Router,
    private localStorage: LocalStoreManager) {

  }

  ngOnInit() {
    const blockedData = localStorage.getItem('loginBlocked');
    if (blockedData) {
      const { isBlocked, timestamp, failedAttempts } = JSON.parse(blockedData);
      const elapsedTime = Date.now() - timestamp;

      if (isBlocked && elapsedTime < this.BLOCK_DURATION) {
        // Still within block duration
        this.isBlocked = true;
        this.failedAttempts = failedAttempts;
        this.remainingTime = Math.ceil((this.BLOCK_DURATION - elapsedTime) / 1000);

        // Set up block timeout for remaining duration
        this.blockTimeout = setTimeout(() => {
          this.isBlocked = false;
          this.failedAttempts = 0;
          localStorage.removeItem('loginBlocked');
          this.remainingTime = 0;
          this.alertService.showMessage(
            'Account Unblocked',
            'You can now try to login again',
            MessageSeverity.info
          );
        }, this.BLOCK_DURATION - elapsedTime);

        // Start countdown timer
        this.countdownInterval = setInterval(() => {
          this.remainingTime--;
          if (this.remainingTime <= 0 && this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
          }
        }, 1000);
      } else {
        // Block duration has expired
        localStorage.removeItem('loginBlocked');
      }
    
    }
    this.userLogin.rememberMe = this.authService.rememberMe;

    if (this.getShouldRedirect()) {
      this.authService.redirectLoginUser();
    } else {
      this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe(() => {
        if (this.getShouldRedirect()) {
          this.authService.redirectLoginUser();
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.blockTimeout !== null) {
      clearTimeout(this.blockTimeout);
    }
    if (this.countdownInterval !== null) {
      clearInterval(this.countdownInterval);
    }
    this.loginStatusSubscription?.unsubscribe();
   
  }
  private handleFailedLogin() {
    this.failedAttempts++;
    if (this.failedAttempts >= this.MAX_ATTEMPTS) {
      this.isBlocked = true;

      this.remainingTime = this.BLOCK_DURATION / 1000;
      localStorage.setItem('loginBlocked', JSON.stringify({
        isBlocked: true,
        timestamp: Date.now(),
        failedAttempts: this.failedAttempts
      }));
      // Start countdown
      this.countdownInterval = setInterval(() => {
        this.remainingTime--;
        if (this.remainingTime <= 0 && this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
      }, 1000);

      this.alertService.showStickyMessage(
        'Account Blocked',
        `Too many failed attempts. Please wait ${this.remainingTime} seconds before trying again.`,
        MessageSeverity.error
      );

      this.blockTimeout = setTimeout(() => {
        this.isBlocked = false;
        this.failedAttempts = 0;
        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }
        this.remainingTime = 0;
        localStorage.removeItem('loginBlocked');
        this.alertService.showMessage(
          'Account Unblocked',
          'You can now try to login again',
          MessageSeverity.info
        );
      }, this.BLOCK_DURATION);
    }
  }
  getShouldRedirect() {
    return !this.isModal && this.authService.isLoggedIn && !this.authService.isSessionExpired;
  }

  showErrorAlert(caption: string, message: string) {
    this.alertService.showMessage(caption, message, MessageSeverity.error);
  }

  closeModal() {
    if (this.modalClosedCallback) {
      this.modalClosedCallback();
    }
  }

  login() {
    // First check if account is currently blocked
    const blockedData = localStorage.getItem('loginBlocked');
    if (blockedData) {
      const { isBlocked, timestamp } = JSON.parse(blockedData);
      const elapsedTime = Date.now() - timestamp;
      const blockCount = JSON.parse(blockedData).blockCount || 1;
      const currentBlockDuration = this.BLOCK_DURATION * Math.pow(3, blockCount - 1);

      if (isBlocked && elapsedTime < currentBlockDuration) {
        const remainingSeconds = Math.ceil((currentBlockDuration - elapsedTime) / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timeDisplay = minutes > 0
          ? `${minutes} minutes and ${seconds} seconds`
          : `${seconds} seconds`;

        this.alertService.showMessage(
          'Account Blocked',
          `Please wait ${timeDisplay} before trying again.`,
          MessageSeverity.error
        );
        return;
      }
    }

    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Attempting login...');

    this.authService.loginWithPassword(this.userLogin.userName, this.userLogin.password, this.userLogin.rememberMe)
      .subscribe({
        next: user => {
          // Reset failed attempts and remove blocked state on successful login
          this.failedAttempts = 0;
          localStorage.removeItem('loginBlocked');

          setTimeout(() => {
            this.alertService.stopLoadingMessage();
            this.isLoading = false;
            this.reset();

            if (!this.isModal) {
              this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
            } else {
              this.alertService.showMessage('Login', `Session for ${user.userName} restored!`, MessageSeverity.success);
              setTimeout(() => {
                this.alertService.showStickyMessage('Session Restored', 'Please try your last operation again', MessageSeverity.default);
              }, 500);

              this.closeModal();
            }
          }, 500);
        },
        error: error => {
          this.handleFailedLogin();
          this.alertService.stopLoadingMessage();

          if (Utilities.checkNoNetwork(error)) {
            this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
            this.offerAlternateHost();
          } else {
            const errorMessage = Utilities.getHttpResponseMessage(error);

            if (errorMessage) {
              this.alertService.showStickyMessage('Unable to login', this.mapLoginErrorMessage(errorMessage), MessageSeverity.error, error);
            } else {
              this.alertService.showStickyMessage('Unable to login',
                'An error occurred whilst logging in, please try again later.\nError: ' + Utilities.stringify(error), MessageSeverity.error, error);
            }
          }

          setTimeout(() => {
            this.isLoading = false;
          }, 500);
        }
      });
  }

  offerAlternateHost() {
    if (Utilities.checkIsLocalHost(location.origin) && Utilities.checkIsLocalHost(this.configurations.baseUrl)) {
      this.alertService.showDialog('Dear Developer!\nIt appears your backend Web API service is not running...\n' +
        'Would you want to temporarily switch to the online Demo API below?(Or specify another)', DialogType.prompt, value => {
          this.configurations.baseUrl = value as string;
          this.alertService.showStickyMessage('API Changed!', 'The target Web API has been changed to: ' + value, MessageSeverity.warn);
        },
        null,
        null,
        null,
        this.configurations.fallbackBaseUrl);
    }
  }

  mapLoginErrorMessage(error: string) {
    if (error === 'invalid_username_or_password') {
      return 'Invalid username or password';
    }

    return error;
  }
  navigateToSignup() {
    // Perform any necessary actions
    this.router.navigate(['/signup']);
  }

  reset() {
    this.formResetToggle = false;

    setTimeout(() => {
      this.formResetToggle = true;
    });
  }
}
