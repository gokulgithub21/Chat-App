import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient,HttpClientModule } from '@angular/common/http';  
import { ToastrService } from 'ngx-toastr';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule,HttpClientModule,CommonModule,ImageCropperComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  @ViewChild('fileInput') fileInput!: ElementRef;

  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  croppedBlob: Blob | null = null;

  constructor(private router: Router,private http: HttpClient,private toastr: ToastrService,private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.getUserData();
  }
  

  getUserData() {
    const currentUserEmail = sessionStorage.getItem('current_user_email');
    if (currentUserEmail) {
      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      if (userData) {
        this.user = JSON.parse(userData);
        this.user.avatar = this.user.avatar || 'https://via.placeholder.com/150';
      }
    }
  }

  user = {
    name: '',
    phoneno: '',
    email: '',
    avatar: 'https://via.placeholder.com/150', 
  };

  isEditingUsername: boolean = false;
  editedName: string = '';
  
  onEditUsername() {
    this.isEditingUsername = true;
    this.editedName = this.user.name; // Load current username into input field
  }
  
  saveUsername() {
    if (this.editedName.trim() !== '' && this.editedName !== this.user.name) {
      this.updateUsername(this.editedName.trim());
    }
    this.isEditingUsername = false; // Hide input field after saving
  }
  
  cancelEditUsername() {
    this.isEditingUsername = false; // Hide input field without saving
  }
  
  updateUsername(newName: string) {
    const payload = {
      email: this.user.email,
      newName: newName
    };
  
    this.http.post('http://localhost/angular-auth/updateUsername.php', payload)
      .subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.toastr.success('Username updated successfully!', 'Success');
            this.user.name = newName; // Update displayed username
            sessionStorage.setItem(`user_${this.user.email}`, JSON.stringify(this.user));
            localStorage.setItem(`user_${this.user.email}`, JSON.stringify(this.user));
          } else {
            this.toastr.error(response.message || 'Failed to update username.', 'Error');
          }
        },
        error => {
          this.toastr.error('An error occurred while updating the username.', 'Error');
        }
      );
  }
  

 


  fileChangeEvent(event: any): void {
    if (event.target.files.length > 0) {
      this.imageChangedEvent = event;
    }
  }
  

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
      this.user.avatar = event.objectUrl; 
    }
    if (event.blob) {
      this.croppedBlob = event.blob; 
    }
  }
  
  cancelImageSelection() {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.croppedBlob = null;
  
    // ✅ Restore original avatar from sessionStorage
    const currentUserEmail = sessionStorage.getItem('current_user_email');
    if (currentUserEmail) {
      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      if (userData) {
        this.user.avatar = JSON.parse(userData).avatar || 'https://via.placeholder.com/150';
      }
    }
  
    // ✅ Reset file input to allow re-selecting the same file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  

  cropImageConfirm() {
    if (this.croppedBlob) {
      this.uploadProfileImage(this.croppedBlob);
      this.imageChangedEvent = null;  
      this.croppedImage = '';        
    }
  }



  uploadProfileImage(imageBlob: Blob) {
    const formData = new FormData();
    formData.append('file', imageBlob, 'cropped_image.png');
    formData.append('email', this.user.email);
  
    this.http.post('http://localhost/angular-auth/uploadProfileImage.php', formData)
      .subscribe((response: any) => {
        if (response.status === 'success') {
          this.toastr.success('Profile image updated successfully!', 'Success');
          this.user.avatar = response.avatarUrl;
          sessionStorage.setItem(`user_${this.user.email}`, JSON.stringify(this.user));
  
          // ✅ Hide the cropper & clear selections after successful upload
          this.imageChangedEvent = null;
          this.croppedImage = '';
        } else {
          this.toastr.error(response.message || 'Failed to upload profile image', 'Error');
        }
      }, error => {
        this.toastr.error('An error occurred while uploading the profile image.', 'Error');
      });
  }
  



  isSidebarExpanded: boolean = false;

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      if (this.isSidebarExpanded) {
        sidebar.classList.add('expanded');
      } else {
        sidebar.classList.remove('expanded');
      }
    }
  }

  

  logout() {
    const storedUserEmail = sessionStorage.getItem('current_user_email');
  
    if (storedUserEmail) {
      sessionStorage.removeItem(`user_${storedUserEmail}`); // Remove only current user’s session
    }
  
    sessionStorage.removeItem('current_user_email'); // Remove session tracking
    this.router.navigate(['']);
  
    this.toastr.info('You have been logged out.', 'Info', {
      timeOut: 3000, closeButton: true, progressBar: true
    });
  }
  
  


  deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      this.http.post('http://localhost/angular-auth/deleteAccount.php', { email: this.user.email })
        .subscribe(
          (response: any) => {
            if (response.status === 'success') {
              this.toastr.success('Account deleted successfully!', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
              sessionStorage.removeItem(`user_${this.user.email}`);
          sessionStorage.removeItem('current_user_email');
              this.router.navigate(['']); 
            } else {
              this.toastr.error(response.message || 'Error:', 'Error', {
                timeOut: 3000, 
                closeButton: true, 
                progressBar: true, 
                positionClass: 'toast-top-right' 
              });
            }
          },
          error => {
            this.toastr.error('An error occurred while deleting your account.', 'Error', {
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
