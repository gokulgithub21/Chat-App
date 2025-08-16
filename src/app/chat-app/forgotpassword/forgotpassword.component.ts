import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient,HttpClientModule} from '@angular/common/http';


@Component({
  selector: 'app-forgotpassword',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,HttpClientModule],
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css'
})
export class ForgotpasswordComponent {

  forgotPasswordForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {  
    if (this.forgotPasswordForm.invalid) {
      return;
    }
  
    const email = this.forgotPasswordForm.value.email;
    console.log('Sending email:', email);  // Debug the email value
    
    this.http.post('http://localhost/forgot_password.php', { email }).subscribe(
      (response: any) => {
        this.message = response.message;
        this.error = '';
      },
      (error) => {
        console.error('Error occurred:', error); // Debug the error message
        this.error = 'Failed to send reset link. Please try again later.';
        this.message = '';
      }
    );
  }
  
  

}
