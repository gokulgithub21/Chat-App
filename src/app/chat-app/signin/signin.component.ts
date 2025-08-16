import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  signinForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient, private toastr: ToastrService) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSignIn() {
    if (this.signinForm.valid) {
      const userData = this.signinForm.value;

      this.http.post('http://localhost/angular-auth/signin.php', userData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            sessionStorage.setItem('current_user_email', response.data.email);
          sessionStorage.setItem(`user_${response.data.email}`, JSON.stringify(response.data));

            this.toastr.success('Login Successful', 'Success', {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
              positionClass: 'toast-top-right'
            });

            this.router.navigate(['chatlist']);
          } else if (response.message === 'Invalid password.') {
            this.toastr.warning('Incorrect password. Please try again.', 'Warning', {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
              positionClass: 'toast-top-right'
            });
          } else if (response.message === 'User not found.') {
            this.toastr.info('No account found with this email.', 'Info', {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
              positionClass: 'toast-top-right'
            });
          } else {
            this.toastr.error(response.message || 'Login failed.', 'Error', {
              timeOut: 3000,
              closeButton: true,
              progressBar: true,
              positionClass: 'toast-top-right'
            });
          }
        },
        (error) => {
          this.toastr.error('An error occurred. Please try again.', 'Error', {
            timeOut: 3000,
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-right'
          });
        }
      );
    }
  }



}
