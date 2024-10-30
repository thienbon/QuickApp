import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { AlertService, MessageSeverity } from '../../services/alert.service';
import { ConfigurationService } from '../../services/configuration.service';
import { Utilities } from '../../services/utilities';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  // Existing properties
  userLogin = {
    userName: '',
    password: '',
    rememberMe: false
  };
  isLoading = false;
  formResetToggle = true;
  modalClosedCallback: () => void;
  loginStatusSubscription: any;
  isLoginPage: boolean;

  // New properties for enhanced functionality
  private destroy$ = new Subject<void>();
  private loginAttempts = 0;
  private readonly MAX_LOGIN_ATTEMPTS = 3;
  isAccountLocked = false;
  lockoutEndTime: Date | null = null;
  showPassword = false;
  lastLoginTime: string | null = null;
  loadingState: 'idle' | 'loading' | 'success' | 'error' = 'idle';

  // New countdown timer properties
  remainingLockoutTime = 0;
  private lockoutDuration = 5 * 60; // 5 minutes in seconds
  private countdownInterval: any;

  // Form validation properties
  readonly USERNAME_MIN_LENGTH = 3;
  readonly PASSWORD_MIN_LENGTH = 6;
  formErrors: { username?: string; password?: string } = {};

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private configurations: ConfigurationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isLoginPage = this.router.url === '/login';
    this.lastLoginTime = localStorage.getItem('lastLoginTime');
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.reset();
    });

    if (this.getShouldRedirect()) {
      this.authService.redirectLoginUser();
    } else {
      this.loginStatusSubscription = this.authService.getLoginStatusEvent()
        .subscribe(isLoggedIn => {
          if (isLoggedIn) {
            this.authService.redirectLoginUser();
          }
        });
    }

    // New initialization code
    this.listenToFormChanges();
    this.checkAccountLockStatus();
  }

  // New method for form changes
  private listenToFormChanges() {
    if (this.f) {
      this.f.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.validateForm();
        });
    }
  }

  // New method for password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Updated login method
  login() {
    if (this.isAccountLocked) {
      this.alertService.showMessage('Account Locked', 
        `Too many failed attempts. Please try again in ${Math.ceil(this.remainingLockoutTime / 60)} minutes.`, 
        MessageSeverity.error);
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.loadingState = 'loading';
    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Attempting login...');

    this.authService.login(this.userLogin.userName, this.userLogin.password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.loadingState = 'success';
          this.loginAttempts = 0;
          this.updateLastLoginTime();
          
          setTimeout(() => {
            this.alertService.stopLoadingMessage();
            this.isLoading = false;
            this.reset();

            if (!this.isLoginPage) {
              this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
            }
          }, 500);
        },
        error: error => {
          this.loadingState = 'error';
          this.alertService.stopLoadingMessage();
          this.isLoading = false;
          this.handleLoginError(error);
        }
      });
  }

  // New error handling method
  private handleLoginError(error: any) {
    this.loginAttempts++;
    
    if (this.loginAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.lockAccount();
    }

    const errorMessage = error.error?.error_description || error.message || 'An error occurred';
    this.alertService.showMessage('Login Failed', errorMessage, MessageSeverity.error);
  }

  // New account locking methods
  private lockAccount() {
    this.isAccountLocked = true;
    this.lockoutEndTime = new Date(Date.now() + this.lockoutDuration * 1000);
    localStorage.setItem('lockoutEndTime', this.lockoutEndTime.toISOString());
    this.startLockoutCountdown();
  }

  private startLockoutCountdown() {
    this.remainingLockoutTime = this.lockoutDuration;
    
    this.countdownInterval = setInterval(() => {
      this.remainingLockoutTime--;
      
      if (this.remainingLockoutTime <= 0) {
        this.unlockAccount();
      }
    }, 1000);
  }

  private unlockAccount() {
    this.isAccountLocked = false;
    this.loginAttempts = 0;
    this.lockoutEndTime = null;
    localStorage.removeItem('lockoutEndTime');
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private checkAccountLockStatus() {
    const lockoutEndTimeStr = localStorage.getItem('lockoutEndTime');
    if (lockoutEndTimeStr) {
      const lockoutEndTime = new Date(lockoutEndTimeStr);
      if (lockoutEndTime > new Date()) {
        this.isAccountLocked = true;
        this.lockoutEndTime = lockoutEndTime;
        this.remainingLockoutTime = Math.floor((lockoutEndTime.getTime() - Date.now()) / 1000);
        this.startLockoutCountdown();
      } else {
        localStorage.removeItem('lockoutEndTime');
      }
    }
  }

  // New method for tracking last login
  private updateLastLoginTime() {
    const now = new Date().toLocaleString();
    localStorage.setItem('lastLoginTime', now);
    this.lastLoginTime = now;
  }

  // Existing methods with updates
  private validateForm(): boolean {
    this.formErrors = {};
    
    if (!this.userLogin.userName || this.userLogin.userName.length < this.USERNAME_MIN_LENGTH) {
      this.formErrors.username = `Username must be at least ${this.USERNAME_MIN_LENGTH} characters`;
    }
    
    if (!this.userLogin.password || this.userLogin.password.length < this.PASSWORD_MIN_LENGTH) {
      this.formErrors.password = `Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`;
    }

    return Object.keys(this.formErrors).length === 0;
  }

  reset() {
    this.formResetToggle = false;
    setTimeout(() => {
      this.formResetToggle = true;
      this.loadingState = 'idle';
      this.formErrors = {};
    });
  }

  getShouldRedirect() {
    return !this.isLoginPage && this.authService.isLoggedIn && !this.authService.isSessionExpired;
  }

  // Updated logout method
  logout() {
    localStorage.removeItem('lastLoginTime');
    this.authService.logout();
    this.authService.redirectLogoutUser();
  }

  // Updated ngOnDestroy
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.loginStatusSubscription) {
      this.loginStatusSubscription.unsubscribe();
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
