import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-groupchat',
  standalone: true,
  imports: [HttpClientModule, FormsModule, CommonModule],
  templateUrl: './groupchat.component.html',
  styleUrls: ['./groupchat.component.css']
})
export class GroupchatComponent implements OnInit {

  contacts: any[] = [];  // Store the contacts fetched from the backend
  selectedContacts: { id: number, name: string }[] = [];  // Store only selected contacts
  groupName: string = '';
  groupDescription: string = '';
  userEmail: string = '';  // Store the logged-in user's email
  searchQuery: string = '';
  filteredContacts: any[] = [];

  constructor(private router: Router, private http: HttpClient,private toastr: ToastrService) { }

  ngOnInit() {
    this.loadContacts(); // Load contacts when the component is initialized
    this.getUserEmail(); // Get the user's email
  }


   // Get user email from localStorage (could be handled by a service)
  
   getUserEmail() {
    const currentUserEmail = sessionStorage.getItem('current_user_email'); // ✅ Ensure consistency in using sessionStorage
    if (currentUserEmail) {
      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      this.userEmail = userData ? JSON.parse(userData).email : '';
    }
  }

  loadContacts() {
    const currentUserEmail = sessionStorage.getItem('current_user_email');  // Get active session user

    if (!currentUserEmail) {
        console.error("No active user session found.");
        return;
    }

    const userData = JSON.parse(sessionStorage.getItem(`user_${currentUserEmail}`) || '{}');
    this.userEmail = userData?.email || '';

    if (this.userEmail) {
        this.http.get<any[]>(`http://localhost/angular-auth/get_contacts.php?user_email=${this.userEmail}`)
            .subscribe(
                (response) => {
                    this.contacts = response;  // Populate contacts array
                    this.filteredContacts = [...this.contacts]; // Keep a copy for filtering
                },
                (error) => {
                    console.error("Error fetching contacts:", error);
                }
            );
    }
}


  // Function to update selected contacts when checkbox changes
  updateSelectedContacts(contact: any, isChecked: boolean) {
    contact.selected = isChecked;

    if (isChecked) {
      if (!this.selectedContacts.some(c => c.id === contact.id)) {
        this.selectedContacts.push({ id: contact.id, name: contact.name });
      }
    } else {
      this.selectedContacts = this.selectedContacts.filter(c => c.id !== contact.id);
    }
  }

  // Function to check if the group creation button should be enabled
  isCreateGroupDisabled(): boolean {
    return this.selectedContacts.length === 0 || !this.groupName.trim();  // Disable if no contacts selected or group name is empty
  }

  // Function to create the group and send it to the backend
  createGroup() {
    const groupData = {
      groupName: this.groupName.trim(),
      groupDescription: this.groupDescription.trim(),
      userEmail: this.userEmail,
      selectedContacts: this.selectedContacts.map(contact => contact.id) // Send selected contact IDs
    };

    this.http.post('http://localhost/angular-auth/groupchat.php', groupData)
      .subscribe(
        (response: any) => {
          if (response.status === 'success') {

            
            this.toastr.success(
              `Group "${this.groupName}" created successfully with ${this.selectedContacts.length} members.`,
              'Success',
              {
                timeOut: 3000, // Auto close after 3 seconds
                closeButton: true, // Show close button
                progressBar: true, // Show progress bar
                positionClass: 'toast-top-right'
              }
            );
            
            // Reset form fields after success
            this.groupName = '';
            this.groupDescription = '';
            this.selectedContacts = [];

            // Reset checkboxes
            this.contacts.forEach(contact => contact.selected = false);
            this.filteredContacts = [...this.contacts];
          } else {
            this.toastr.error(response.message || 'Error:', 'Error', {
              timeOut: 3000, 
              closeButton: true, 
              progressBar: true, 
              positionClass: 'toast-top-right' 
            });
          
          }
        },
        (error) => {
          this.toastr.error('An error occurred while creating the group.', 'Error', {
            timeOut: 3000, 
            closeButton: true, 
            progressBar: true, 
            positionClass: 'toast-top-right' 
          });
         
        }
      );
  }

  // Toggle sidebar visibility
  isSidebarExpanded: boolean = false;
  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expanded');
    }
  }

  // Logout function
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
  

 
  filterContacts() {
    if (!this.searchQuery) {
      // If no search query, show all contacts
      this.filteredContacts = [...this.contacts];
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }


}
