import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { AlertService } from '../services/alert.service';
import { MessageSeverity } from '../models/message-severity';
import { UserEdit } from '../models/user-edit';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      userName: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      phoneNumber: ['', Validators.maxLength(20)],
      jobTitle: ['', Validators.maxLength(50)]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.alertService.startLoadingMessage('Creating account...');

      const formModel = this.signupForm.value;

      const newUser = new UserEdit();
      
      // Required fields from form
      newUser.userName = formModel.userName;
      newUser.fullName = formModel.fullName;
      newUser.email = formModel.email;
      newUser.password = formModel.password;
      
      // Optional fields from form
      newUser.phoneNumber = formModel.phoneNumber || '';
      newUser.jobTitle = formModel.jobTitle || '';
      
      // Default values for required properties
      newUser.id = '';
      newUser.isLockedOut = false;
      newUser.roles = ['user'];
      newUser.isEnabled = true;

      this.accountService.signup(newUser)
        .subscribe({
          next: () => {
            this.alertService.stopLoadingMessage();
            this.alertService.showMessage('Success', 'Account created successfully', MessageSeverity.success);
            
            // Optionally, you can automatically log in the user here
            this.accountService.login(newUser.userName, newUser.password!)
              .subscribe({
                next: () => {
                  this.router.navigate(['/']);
                },
                error: loginError => {
                  console.error('Auto-login failed:', loginError);
                  this.router.navigate(['/login']);
                }
              });
          },
          error: error => {
            this.isLoading = false;
            this.alertService.stopLoadingMessage();
            
            let errorMessage = 'An error occurred while creating your account.';
            if (error.error?.errors) {
              // Handle validation errors
              errorMessage = Object.values(error.error.errors).join('\n');
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            
            this.alertService.showStickyMessage('Create Error',
              `${errorMessage}`,
              MessageSeverity.error);
          }
        });
    }
  }
}
