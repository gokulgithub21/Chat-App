import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private http: HttpClient,private toastr: ToastrService) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/)]],
      phoneno: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator
    });
  }

  onSignUp() {
    if (this.signupForm.valid) {
      const userData = this.signupForm.value;
      delete userData.confirmPassword;

      this.http.post('http://localhost/angular-auth/signup.php', userData).subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.toastr.success('Registration successful', 'Success', {
              timeOut: 3000, 
              closeButton: true, 
              progressBar: true, 
              positionClass: 'toast-top-right' 
            });
            
            this.router.navigate(['']);
          } else {
            this.toastr.error(response.message || 'Registration failed', 'Error', {
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
    } else {
      this.toastr.warning('Please fill all details correctly.', 'Warning', {
        timeOut: 3000, 
        closeButton: true, 
        progressBar: true, 
        positionClass: 'toast-top-right' 
      });
    }
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent): void {
    const clipboardData = event.clipboardData?.getData('text');
    if (clipboardData && !/^\d+$/.test(clipboardData)) {
      event.preventDefault();
    }
  }
}
