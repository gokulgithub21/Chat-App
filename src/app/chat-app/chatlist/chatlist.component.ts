import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SocketService } from '../../socket.service';
import { ToastrService } from 'ngx-toastr';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { format, isToday, isYesterday, differenceInHours, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chatlist',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ImageCropperComponent],
  templateUrl: './chatlist.component.html',
  styleUrl: './chatlist.component.css'
})
export class ChatlistComponent implements OnInit, OnDestroy {


  contacts: any[] = [];
  groups: any[] = [];
  filteredContacts: any[] = [];
  filteredGroups: any[] = [];
  selectedContact: any = null;
  messages: {
    id: number;
    sender: string;
    senderName: string;
    text: string;
    timestamp?: string;
    fileUrl?: string | null;
    deleted?: boolean;
  }[] = [];
  messageInput: string = '';
  isSidebarExpanded: boolean = false;
  user: any;
  contact = { name: '', email: '' };
  searchQuery: string = '';
  isGroupDetailsVisible: boolean = false;

  imageChangedEvent: Event | null = null;
  croppedImage: SafeUrl = '';
  croppedBlob: Blob | null = null;

  isGroupChat: boolean = false;
  selectedGroupId: string | null = null;
  private deleteMessageIds: number[] = [];
  showDeleteModal: boolean = false;
  unreadPrivateCount: number = 0;
  unreadGroupCount: number = 0;
  onlineUsers: any = {}; 
  onlineUsersSubscription!: Subscription; 

  
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  constructor(private router: Router, private http: HttpClient, private socketService: SocketService,
    private toastr: ToastrService, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef) { }

  ngOnInit() {

    const currentUserEmail = sessionStorage.getItem('current_user_email');
    if (currentUserEmail) {
      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      this.user = userData ? JSON.parse(userData) : null;
      this.socketService.setUserOnline(currentUserEmail);
    }

    if (!this.user || !this.user.email) {
      this.toastr.warning('User not found. Please log in.', 'Warning', { timeOut: 3000, closeButton: true, progressBar: true });
      this.router.navigate(['signin']);
      return;
    }

    this.onlineUsersSubscription = this.socketService.getOnlineUsers().subscribe((users) => {
      console.log('Online Users:', users); // Debug log
      this.onlineUsers = users;
    
      if (this.selectedContact?.email) {
        const contactEmail = this.selectedContact.email;
        const onlineStatus = this.onlineUsers[contactEmail];
        if (onlineStatus) {
          this.selectedContact.isOnline = onlineStatus.isOnline;
          this.selectedContact.lastSeen = onlineStatus.lastSeen;
        } else {
          this.selectedContact.isOnline = false;
          this.selectedContact.lastSeen = 'Offline';
        }
      }
    
      this.cdr.detectChanges();
    });
    
    
    
  

    this.socketService.handleDisconnect().subscribe(() => {
      console.log('Disconnected from server');
      // Mark all users as offline or show an appropriate message in the UI
      Object.keys(this.onlineUsers).forEach(email => {
        if (this.onlineUsers[email].isOnline) {
          this.onlineUsers[email].isOnline = false;
          this.onlineUsers[email].lastSeen = new Date().toISOString(); // Fallback last seen
        }
      });
      this.cdr.detectChanges();
    });
    

    this.loadContacts();
    this.loadGroups();
    this.loadUnreadCount();

    this.socketService.getMessages().subscribe((newMessage: any) => {
      if (newMessage) {
        this.updateContactTimestamp(newMessage); // ✅ Update timestamp for chat list
        this.loadUnreadCount();
        if (this.selectedContact) {
          if ((this.selectedContact.id && newMessage.group_id === this.selectedContact.id) ||
            (this.selectedContact.email && newMessage.receiver_email === this.user.email)) {

            let fileUrl = newMessage.fileUrl && !newMessage.fileUrl.startsWith("blob:")
              ? `http://localhost/angular-auth/uploads/msg_files/${this.getFileName(newMessage.fileUrl)}`
              : null;

            // ✅ Ensure fileUrl is properly set
            this.messages.push({
              id: newMessage.id || '',
              sender: newMessage.sender_email,
              senderName: newMessage.sender_name || 'Unknown',
              text: newMessage.message || '',
              fileUrl: fileUrl,
              timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            });

            this.scrollToBottom();
          }
        }
      }
    });
    this.socketService.getMessages().subscribe((data: any) => {
      if (data.type === 'deleteMessages' || data.type === 'deleteGroupMessages') {
        console.log("Real-time message deletion:", data);
        this.messages = this.messages.map(msg => {
          if (data.messageIds.includes(msg.id)) {
            return { ...msg, text: "This message was deleted", fileUrl: null, deleted: true };
          }
          return msg;
        });
      }
    });

    window.addEventListener("storage", () => {
      this.loadPinnedContacts();
      this.loadPinnedGroups();
    });

  }


  ngOnDestroy() {
    if (this.onlineUsersSubscription) {
      this.onlineUsersSubscription.unsubscribe(); // Clean up the subscription
    }
  }


  loadUnreadCount() {
    const apiUrl = `http://localhost/angular-auth/get_unread_count.php?user_email=${this.user.email}`;
  
    this.http
      .get<{
        status: string;
        unread_private_count?: number;
        unread_group_count?: number;
        private_counts?: { email: string; count: number }[];
        group_counts?: { group_id: number; count: number }[]; // Updated field name
      }>(apiUrl)
      .subscribe(
        (response) => {
          if (response.status === 'success') {
            
  
            this.unreadPrivateCount = response.unread_private_count ?? 0;
            this.unreadGroupCount = response.unread_group_count ?? 0;
  
            this.updateUnreadCountsForContacts(response.private_counts);
            this.updateUnreadCountsForGroups(response.group_counts);

            this.cdr.detectChanges();
           
          } else {
            console.error('❌ Error in unread counts response:', response);
          }
        },
        (error) => {
          console.error('❌ API Error fetching unread counts:', error);
        }
      );
  }
  
  private updateUnreadCountsForContacts(privateCounts?: { email: string; count: number }[]) {
    if (privateCounts?.length) {
      this.contacts.forEach((contact) => {
        const unreadData = privateCounts.find((pc) => pc.email === contact.email);
        contact.unreadCount = unreadData?.count ?? 0;
      });
    } else {
     
      this.contacts.forEach((contact) => {
        contact.unreadCount = 0;
      });
    }
  }
  
  private updateUnreadCountsForGroups(groupCounts?: { group_id: number; count: number }[]) {
    if (groupCounts?.length) {
  
      const groupCountMap = new Map(groupCounts.map((gc) => [gc.group_id, gc.count]));
   
  
      this.groups.forEach((group) => {
        const unreadCount = groupCountMap.get(group.id); // Match by group.id
        if (unreadCount !== undefined) {
          console.log(`🔄 Updating group ${group.id} unread count to ${unreadCount}`);
          group.unreadCount = unreadCount;
        } else {
    
          group.unreadCount = 0;
        }
      });
  
    } else {
     
      this.groups.forEach((group) => {
        group.unreadCount = 0;
      });
    }
  
    // Trigger UI update
    this.cdr.detectChanges();
  }
  
  
  
  
  
  
  
  
  markAsRead(contactEmail: string, groupId?: number) {
    const payload = groupId
      ? { user_email: this.user.email, group_id: groupId }
      : { user_email: this.user.email, sender_email: contactEmail }; // Include sender_email
    
    this.http.post('http://localhost/angular-auth/mark_messages_as_read.php', payload)
      .subscribe(
        (response: any) => {
          if (response.status === 'success') {
            this.loadUnreadCount(); // Refresh unread counts
          } else {
            console.error('❌ Failed to update read status:', response.message);
          }
        },
        (error) => console.error('❌ Error in updating read status:', error)
      );
  }
  
  


  updateContactTimestamp(newMessage: any) {
    const currentTimestamp = new Date().toISOString(); // ✅ Store in ISO format

    if (newMessage.group_id) {
      let group = this.filteredGroups.find(g => g.id === newMessage.group_id);
      if (group) {
        group.timestamp = currentTimestamp;
        localStorage.setItem(`group_timestamp_${group.id}`, currentTimestamp);
      }
    } else {
      let contact = this.filteredContacts.find(c =>
        c.email === newMessage.sender_email || c.email === newMessage.receiver_email
      );

      if (contact) {
        contact.timestamp = currentTimestamp;
        localStorage.setItem(`contact_timestamp_${contact.email}`, currentTimestamp);
      }
    }
  }


  getTimeAgo(timestamp: string | null): string {
  if (!timestamp) return 'Just now';

  const date = new Date(timestamp);
  const now = new Date();

  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const daysDiff = Math.floor(diffInMinutes / (60 * 24));
  const weeksDiff = Math.floor(daysDiff / 7);
  const monthsDiff = Math.floor(daysDiff / 30);

  if (diffInMinutes < 5) {
    return "Just now";
  } else if (diffInHours < 12) {
    // Show time in hh:mm a format (e.g., "10:40 PM")
    return format(date, "hh:mm a");
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else if (daysDiff < 7) {
    return `${daysDiff} days ago`;
  } else if (weeksDiff < 4) {
    return `${weeksDiff} weeks ago`;
  } else if (monthsDiff < 12) {
    return `${monthsDiff} months ago`;
  } else {
    return format(date, "dd MMM yyyy"); // Ex: "12 Jan 2024"
  }
}



  loadPinnedContacts() {
    const storedPinnedContacts = JSON.parse(localStorage.getItem('pinnedContacts') || '[]');
    this.contacts.forEach(contact => {
      contact.pinned = storedPinnedContacts.includes(contact.email);
    });

    this.filteredContacts.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }

  loadPinnedGroups() {
    const storedPinnedGroups = JSON.parse(localStorage.getItem('pinnedGroups') || '[]');
    this.groups.forEach(group => {
      group.pinned = storedPinnedGroups.includes(group.id);
    });

    this.filteredGroups.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }


  loadContacts() {
    const pinnedContacts: string[] = JSON.parse(localStorage.getItem('pinnedContacts') || '[]');
  
    this.filteredContacts.forEach(contact => {
      contact.pinned = pinnedContacts.includes(contact.email);
    });
  
    this.http.get<any[]>('http://localhost/angular-auth/get_contacts.php?user_email=' + this.user.email)
      .subscribe(
        (contactsResponse) => {
          this.http.get<{ lastMessages: { sender_email: string; receiver_email: string; message: string; timestamp: string; read?: boolean }[] }>(
            'http://localhost/angular-auth/get_last_messages.php?user_email=' + this.user.email
          ).subscribe(
            (messagesResponse) => {
              const lastMessages = messagesResponse.lastMessages || [];
  
              this.contacts = contactsResponse.map(contact => {
                const lastMessageData = lastMessages.find((msg) =>
                  msg.sender_email === contact.email || msg.receiver_email === contact.email
                ) || null;
  
                let unreadCount = 0;
                if (lastMessageData && lastMessageData.read === false) {
                  unreadCount++;
                }
  
                let storedTimestamp = localStorage.getItem(`contact_timestamp_${contact.email}`);
                if (lastMessageData) {
                  storedTimestamp = lastMessageData.timestamp;
                  localStorage.setItem(`contact_timestamp_${contact.email}`, storedTimestamp);
                }
  
                return {
                  ...contact,
                  avatar: contact.avatar || '/default_profile.png',
                  lastMessage: lastMessageData ? lastMessageData.message : 'Tap to chat',
                  timestamp: storedTimestamp || null,
                  unreadCount,
                  pinned: pinnedContacts.includes(contact.email)
                };
              });
              this.loadUnreadCount();
              

              this.filteredContacts = [...this.contacts].sort((a, b) => {
                if (a.pinned !== b.pinned) {
                  return b.pinned ? 1 : -1; // Keep pinned contacts on top
                }
                const timestampA = a.timestamp ? String(a.timestamp) : '';
                const timestampB = b.timestamp ? String(b.timestamp) : '';
              
                return timestampB.localeCompare(timestampA);
              });
              
              this.cdr.detectChanges();
            },
            (error) => console.error("❌ Error fetching last messages:", error)
          );
        },
        (error) => console.error("❌ Error fetching contacts:", error)
      );
  }
  





  loadGroups() {
    const pinnedGroups: number[] = JSON.parse(localStorage.getItem('pinnedGroups') || '[]');
    this.filteredGroups.forEach(group => group.pinned = pinnedGroups.includes(group.id));
  
    this.http.get<{ status: string, groups: any[] }>(
      `http://localhost/angular-auth/get_groups.php?user_email=${this.user.email}`
    ).subscribe(
      (groupsResponse) => {
        if (groupsResponse.status === 'success' && Array.isArray(groupsResponse.groups)) {
          this.http.get<{ lastGroupMessages: { [groupId: number]: { message: string, timestamp: string, read?: boolean } } }>(
            'http://localhost/angular-auth/get_last_messages.php?user_email=' + this.user.email
          ).subscribe(
            (messagesResponse) => {
              this.groups = groupsResponse.groups.map((group) => {
                const lastGroupMessageData = messagesResponse.lastGroupMessages[group.id] || null;
  
                let unreadCount = 0;
                if (lastGroupMessageData && lastGroupMessageData.read === false) {
                  unreadCount++;
                }
  
                let storedTimestamp = localStorage.getItem(`group_timestamp_${group.id}`);
                if (lastGroupMessageData) {
                  storedTimestamp = lastGroupMessageData.timestamp;
                  localStorage.setItem(`group_timestamp_${group.id}`, storedTimestamp);
                }
  
                return {
                  ...group,
                  avatar: group.group_avatar || '/group_default_image.png',
                  lastMessage: lastGroupMessageData ? lastGroupMessageData.message : 'Tap to chat',
                  timestamp: storedTimestamp || null,
                  unreadCount,
                  pinned: pinnedGroups.includes(group.id)
                };
              });
              this.loadUnreadCount();
              this.filteredGroups = [...this.groups].sort((a, b) => {
                if (a.pinned !== b.pinned) {
                  return b.pinned ? 1 : -1; // Keep pinned groups on top
                }
                return (b.timestamp || 0).localeCompare(a.timestamp || 0); // Sort by latest timestamp
              });

              this.cdr.detectChanges();
            },
            (error) => console.error("❌ Error fetching last group messages:", error)
          );
        } else {
          console.error("Invalid response format:", groupsResponse);
        }
      },
      (error) => console.error("❌ Error fetching groups:", error)
    );
  }
  


  getSenderClass(senderEmail: string): string {
    const hash = Array.from(senderEmail)
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10; // Create a unique index from email
    return `sender-${hash + 1}`; // Ensures it stays within sender-1 to sender-10
  }




  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.filePreviewUrl = URL.createObjectURL(file);
    } else {
      this.selectedFile = null;
      this.filePreviewUrl = null;
    }
  }

  cancelFilePreview(): void {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.fileInput.nativeElement.value = '';
  }

  clearPreview() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }



  sendMessage() {
    if (!this.selectedContact || (!this.selectedContact.email && !this.selectedContact.id)) {
      console.error("Error: No recipient selected.");
      return;
    }

    const formData = new FormData();
    formData.append('sender_email', this.user.email);
    formData.append('sender_name', this.user.name);
    formData.append('message', this.messageInput.trim());

    if (this.selectedContact.id) {
      formData.append('group_id', this.selectedContact.id.toString());
    } else {
      formData.append('receiver_email', this.selectedContact.email);
    }

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    let socketMessage = {
      sender_email: this.user.email,
      sender_name: this.user.name,
      receiver_email: this.selectedContact.email || null,
      group_id: this.selectedContact.id || null,
      message: this.messageInput.trim(),
      fileUrl: null as string | null
    };

    const tempMessage = {
      id: 0,
      sender: this.user.email,
      senderName: this.user.name,
      text: this.messageInput.trim(),
      fileUrl: this.selectedFile ? this.filePreviewUrl : null,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };

    if (!this.selectedContact.id) {
      this.messages.push(tempMessage);
    }

    this.scrollToBottom();



    this.http.post<{ status: string, fileUrl?: string, messageId?: string }>(
      'http://localhost/angular-auth/save_message.php',
      formData
    ).subscribe(response => {
      if (response.status === 'success') {
        const lastMessageIndex = this.messages.length - 1;
        if (this.messages[lastMessageIndex]) {
          this.messages[lastMessageIndex].id = parseInt(response.messageId ?? '0', 10);
          this.messages[lastMessageIndex].fileUrl = response.fileUrl
            ? `http://localhost/angular-auth/uploads/msg_files/${this.getFileName(response.fileUrl)}`
            : null;

          socketMessage.fileUrl = this.messages[lastMessageIndex].fileUrl ?? null;
          this.socketService.sendMessage(socketMessage);

        }
      } else {
        console.error('Failed to save message.');
      }
    });

    this.messageInput = '';
    this.selectedFile = null;
    this.filePreviewUrl = null;
  }






  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }





  loadMessages(contact: any) {
    this.isGroupChat = false;
    this.http.get<{ status: string, messages: any[] }>(
      `http://localhost/angular-auth/get_messages.php?user_email=${this.user.email}&contact_email=${contact.email}`
    ).subscribe(response => {
      if (response.status === 'success') {
        this.messages = response.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_email,
          senderName: msg.sender_name || 'Unknown',
          text: msg.deleted === 1 ? "This message was deleted" : msg.message,
          fileUrl: msg.file_url
            ? `http://localhost/angular-auth/uploads/msg_files/${this.getFileName(msg.file_url)}`
            : null,
          timestamp: this.formatTime(msg.timestamp),
          deleted: msg.deleted === 1,  // ✅ Convert to boolean

        }));
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        console.error('Failed to load messages:', response);
      }
    }, error => console.error('Error fetching messages:', error));
  }

  loadGroupMessages(groupId: string) {
    this.isGroupChat = true;
    this.http.get<{ status: string, messages: any[] }>(
      `http://localhost/angular-auth/get_group_messages.php?group_id=${groupId}`
    ).subscribe(response => {
      if (response.status === 'success') {
        this.messages = response.messages.map(msg => ({
          id: msg.id,
          sender: msg.sender_email,
          senderName: msg.sender_name || 'Unknown',
          text: msg.deleted === 1 ? "This message was deleted" : msg.message,
          fileUrl: msg.file_url
            ? `http://localhost/angular-auth/uploads/msg_files/${this.getFileName(msg.file_url)}`
            : null,
          timestamp: this.formatTime(msg.timestamp),
          deleted: msg.deleted === 1, // ✅ Ensure deleted is treated as boolean

        }));
        setTimeout(() => this.scrollToBottom(), 100);
      } else {
        console.error("Failed to load group messages:", response);
      }
    }, error => console.error("Error fetching group messages:", error));
  }



  formatTime(timestamp: string): string {
    if (!timestamp) return ''; // Handle empty timestamps
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }


  getFileName(fileUrl: string): string {
    try {
      const decodedUrl = decodeURIComponent(fileUrl);
      return decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1);
    } catch (e) {
      return 'downloaded_file';
    }
  }




  selectedMessages: any[] = []; // Store selected messages
  longPressTimeout: any = null; // Track long press timeout
  isSelectionMode: boolean = false; // Track selection mode

  toggleMessageSelection(event: MouseEvent, message: any) {
    if (!this.isSelectionMode) {
      // ✅ First selection requires long press (500ms)
      this.longPressTimeout = setTimeout(() => {
        this.isSelectionMode = true; // Enable selection mode
        this.selectedMessages.push(message);
      }, 500);
    } else {
      // ✅ Once selection mode is active, select on single click
      const index = this.selectedMessages.indexOf(message);
      if (index === -1) {
        this.selectedMessages.push(message);
      } else {
        this.selectedMessages.splice(index, 1);
      }

      // ✅ If no messages are selected, reset selection mode
      if (this.selectedMessages.length === 0) {
        this.isSelectionMode = false;
      }
    }
  }


  clearLongPressTimeout() {
    clearTimeout(this.longPressTimeout);
  }



  openDeleteModal(isGroup: boolean) {
    this.isGroupChat = isGroup;
    this.deleteMessageIds = this.selectedMessages.map(msg => msg.id);
    this.showDeleteModal = true;
  }


  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedMessages = [];
    this.isSelectionMode = false;
  }


  confirmDelete() {
    if (this.deleteMessageIds.length === 0) return;

    const apiUrl = this.isGroupChat
      ? 'http://localhost/angular-auth/delete_group_messages.php'
      : 'http://localhost/angular-auth/delete_messages.php';

    this.http.post<{ status: string; message?: string }>(
      apiUrl,
      { messageIds: JSON.stringify(this.deleteMessageIds) }
    ).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.messages = this.messages.map(msg => {
            if (this.deleteMessageIds.includes(msg.id)) {
              return { ...msg, text: "This message was deleted", fileUrl: null, deleted: true };
            }
            return msg;
          });
          this.socketService.sendMessage({
            type: this.isGroupChat ? 'deleteGroupMessages' : 'deleteMessages',
            messageIds: this.deleteMessageIds,
            groupId: this.selectedGroupId || null
          });

          this.selectedMessages = [];
          this.showDeleteModal = false;
          this.toastr.success('Messages deleted successfully.', 'Success');
        } else {
          console.error('Failed to delete messages:', response.message || 'Unknown error');
        }
      },
      (error) => {
        console.error('Error deleting messages:', error);
        this.toastr.error('Failed to delete messages. Check server logs.', 'Error');
      }
    );
  }


  cancelSelection() {
    this.selectedMessages = [];
    this.isSelectionMode = false;
    this.showDeleteModal = false;
  }



  // File Type Check Functions
  isImage(fileUrl: string): boolean {
    return fileUrl.endsWith('.jpg') || fileUrl.endsWith('.png');
  }

  isPDF(fileUrl: string): boolean {
    return fileUrl.endsWith('.pdf');
  }

  isAudio(fileUrl: string): boolean {
    return fileUrl.endsWith('.mp3') || fileUrl.endsWith('.wav');
  }

  isVideo(fileUrl: string): boolean {
    return fileUrl.endsWith('.mp4');
  }

  isOtherFile(fileUrl: string): boolean {
    return !this.isImage(fileUrl) && !this.isPDF(fileUrl) && !this.isAudio(fileUrl) && !this.isVideo(fileUrl);
  }





  selectContact(contact: any) {
    this.selectedContact = {
      name: contact.name,
      email: contact.email, 
      isOnline: this.onlineUsers[contact.email]?.isOnline || false,
      avatar: contact.avatar || '/default_profile.png',
      lastMessage: contact.lastMessage || 'Tap to chat',
      lastSeen: this.onlineUsers[contact.email]?.lastSeen || null,
    };

    if (contact.email) {
      this.markAsRead(contact.email);
    }
    this.loadMessages(contact);
    this.messages = [];
  }



  selectedContactToDelete: any = null;

  openContextMenu(event: MouseEvent, contact: any) {
    event.preventDefault();
    this.selectedContactToDelete = contact;

    const contextMenu = document.getElementById("contextMenu") as HTMLElement;
    if (contextMenu) {  // ✅ Ensure element exists
      contextMenu.style.display = "block";
      contextMenu.style.left = `${event.pageX}px`;
      contextMenu.style.top = `${event.pageY}px`;

      document.addEventListener("click", this.closeContextMenu);
    }
  }


  closeContextMenu = () => {
    const contextMenu = document.getElementById("contextMenu") as HTMLElement;
    contextMenu.style.display = "none";
    document.removeEventListener("click", this.closeContextMenu);
  };


  // ✅ Pin/unpin a contact
  pinContact(contact: any) {
    contact.pinned = !contact.pinned;

    let storedPinnedContacts: string[] = JSON.parse(localStorage.getItem('pinnedContacts') || '[]');

    if (contact.pinned) {
      if (!storedPinnedContacts.includes(contact.email)) {
        storedPinnedContacts.push(contact.email);
      }
    } else {
      storedPinnedContacts = storedPinnedContacts.filter(email => email !== contact.email);
    }

    localStorage.setItem('pinnedContacts', JSON.stringify(storedPinnedContacts));
    this.loadPinnedContacts();
  }


  pinGroup(group: any) {
    group.pinned = !group.pinned;

    let storedPinnedGroups: number[] = JSON.parse(localStorage.getItem('pinnedGroups') || '[]');

    if (group.pinned) {
      if (!storedPinnedGroups.includes(group.id)) {
        storedPinnedGroups.push(group.id);
      }
    } else {
      storedPinnedGroups = storedPinnedGroups.filter(id => id !== group.id);
    }

    localStorage.setItem('pinnedGroups', JSON.stringify(storedPinnedGroups));
    this.loadPinnedGroups();
  }



  selectedGroupToPin: any = null;

  openGroupContextMenu(event: MouseEvent, group: any) {
    event.preventDefault(); // Prevent default right-click menu
    this.selectedGroupToPin = group; // Store selected group

    // Show context menu at mouse position
    const contextMenu = document.getElementById("groupContextMenu") as HTMLElement;
    contextMenu.style.display = "block";
    contextMenu.style.left = `${event.pageX}px`;
    contextMenu.style.top = `${event.pageY}px`;

    // Close menu when clicking elsewhere
    document.addEventListener("click", this.closeGroupContextMenu);
  }

  closeGroupContextMenu = () => {
    const contextMenu = document.getElementById("groupContextMenu") as HTMLElement;
    contextMenu.style.display = "none";
    document.removeEventListener("click", this.closeGroupContextMenu);
  };






  confirmDeleteContact() {
    if (!this.selectedContactToDelete) return;

    const confirmation = confirm(`Are you sure you want to delete ${this.selectedContactToDelete.name}?`);
    if (confirmation) {
      this.deleteContact(this.selectedContactToDelete);
    }
  }

  deleteContact(contact: any) {
    const requestBody = {
      user_email: this.user.email,
      contact_email: contact.email
    };

    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/delete_contact.php',
      requestBody
    ).subscribe(
      (response) => {
        if (response.status === 'success') {

          this.toastr.success('Success Message', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
          alert("Contact deleted successfully!");

          // Remove from UI
          this.contacts = this.contacts.filter(c => c.email !== contact.email);
          this.filteredContacts = this.filteredContacts.filter(c => c.email !== contact.email);
        } else {
          alert("Error: " + response.message);
        }
      },
      (error) => {
        console.error("Error deleting contact:", error);
        this.toastr.error('Failed to delete contact. Please try again.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }



  selectGroup(group: any) {
    this.selectedGroupId = group.id;
    this.selectedContact = {
      name: group.group_name,
      avatar: group.group_avatar || '/group_default_image.png',
      description: group.group_description || 'No description available', // Store the description
      members: [],
      creator: { name: 'Loading...', email: '', avatar: '/default_profile.png' },
      id: group.id
    };
    this.isGroupDetailsVisible = false; // Initially hide group details
    this.messages = []; // Clear previous messages
    this.loadGroupMessages(group.id);
    this.markAsRead('', group.id);
    // Fetch group members and creator details
    this.http.get<{ status: string, creator: any, members: { name: string, email: string, avatar: string }, description?: string[] }>(
      `http://localhost/angular-auth/get_group_members.php?group_id=${group.id}`
    ).subscribe(
      (response) => {
        if (response.status === 'success') {
          // Ensure the creator data is available
          if (response.creator && response.creator.creator_name) {
            this.selectedContact.creator = {
              name: response.creator.creator_name,
              email: response.creator.creator_email,
              avatar: response.creator.creator_avatar || '/default_profile.png'
            };

            this.selectedContact.isCreator = this.selectedContact.creator.email === this.user.email;
          }

          this.selectedContact.members = response.members ?? [];
          this.selectedContact.description = response.description || 'No description available';
        } else {
          console.error("Invalid response format or no members found:", response);
        }
      },
      (error) => {
        console.error("Error fetching group members:", error);
      }
    );
  }

  // Toggle the visibility of the group details
  toggleGroupDetails() {
    this.isGroupDetailsVisible = !this.isGroupDetailsVisible;
  }



  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
      this.selectedContact.avatar = event.objectUrl; // ✅ Temporary update before upload
    }
    if (event.blob) {
      this.croppedBlob = event.blob; // Store cropped file for uploading
    }
  }



  // When user confirms the cropped image
  cropImageConfirm() {
    if (this.croppedBlob) {
      this.uploadGroupImage(this.croppedBlob);
      this.imageChangedEvent = null; // Hide cropper
      this.croppedImage = ''; // Clear preview
    }
  }

  cancelImageSelection() {
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.croppedBlob = null;

    // Restore original group avatar from session storage
    const currentUserEmail = sessionStorage.getItem('current_user_email');
    if (currentUserEmail) {
      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      if (userData) {
        this.selectedContact.avatar = JSON.parse(userData).avatar || '/group_default_image.png';
      }
    }

    // Reset file input to allow re-selection of the same file
    const fileInput = document.getElementById('groupImageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }


  // Upload the cropped image
  uploadGroupImage(imageBlob: Blob) {
    if (!this.selectedContact.id) {
      this.toastr.error('Group ID is missing.', 'Error');
      return;
    }

    const formData = new FormData();
    formData.append('group_id', this.selectedContact.id);
    formData.append('image', imageBlob, 'cropped_group_image.png');

    this.http.post<{ status: string; imageUrl: string }>('http://localhost/angular-auth/upload_group_image.php', formData)
      .subscribe(
        (response) => {
          if (response.status === 'success') {
            this.selectedContact.avatar = response.imageUrl; // Update UI

            // Update the group in group lists
            this.updateGroupImage(response.imageUrl);

            this.imageChangedEvent = null;
            this.croppedImage = '';
            this.toastr.success('Group image updated successfully!', 'Success');


          } else {
            this.toastr.error('Error uploading group image.', 'Error');
          }
        },
        (error) => {
          this.toastr.error('Upload failed.', 'Error');
        }
      );
  }

  // Update the group image in the list
  updateGroupImage(newImageUrl: string) {
    const groupIndex = this.groups.findIndex(group => group.id === this.selectedContact.id);
    if (groupIndex !== -1) {
      this.groups[groupIndex].avatar = newImageUrl;
    }

    const filteredGroupIndex = this.filteredGroups.findIndex(group => group.id === this.selectedContact.id);
    if (filteredGroupIndex !== -1) {
      this.filteredGroups[filteredGroupIndex].avatar = newImageUrl;
    }
  }




  searchUserQuery: string = '';

  addMemberToGroup(contact: any) {
    if (!this.selectedContact.id) {
      this.toastr.error('Group ID is missing.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    const requestBody = {
      group_id: this.selectedContact.id,
      user_email: contact.email
    };

    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/add_group_member.php',
      requestBody
    ).subscribe(
      (response) => {
        if (response.status === 'success') {

          this.toastr.success(
            `${contact.name} added to the group.`,
            'Success',
            {
              timeOut: 3000, // Auto close after 3 seconds
              closeButton: true, // Show close button
              progressBar: true, // Show progress bar
              positionClass: 'toast-top-right' // Adjust position (optional)
            }
          );


          // Add the new member to the UI
          this.selectedContact.members.push(contact);

          // Remove the added member from the available contacts list
          this.filteredContacts = this.filteredContacts.filter(c => c.email !== contact.email);
        } else {
          this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });

        }
      },
      (error) => {
        console.error("Error adding member:", error);
        this.toastr.error('Failed to add member. Please try again.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }




  openAddMembersModal() {
    // Ensure selectedContact has members before filtering
    if (!this.selectedContact?.members) {
      this.selectedContact.members = [];
    }

    // Filter contacts who are not already in the group
    this.filteredContacts = this.contacts.filter(contact =>
      !this.selectedContact.members.some((member: { email: string }) => member.email === contact.email)
    );

    // Open the modal
    const modal = document.getElementById('addMembersModal') as HTMLElement;
    modal.style.display = 'flex';
  }


  closeAddMembersModal() {
    const modal = document.getElementById('addMembersModal') as HTMLElement;
    modal.style.display = 'none';
  }


  filterAvailableContacts() {
   

    // Ensure selectedContact exists and members is an array
    if (!this.selectedContact) {
      console.warn("selectedContact is undefined. Fixing...");
      this.selectedContact = { members: [] }; // Ensure it exists
    }

    if (!Array.isArray(this.selectedContact.members)) {
      console.warn("selectedContact.members is not an array. Fixing...");
      this.selectedContact.members = []; // Ensure members is always an array
    }

    // Fix the TS7006 error by explicitly defining the type of 'member'
    if (!this.searchUserQuery) {
      this.filteredContacts = this.contacts.filter(contact =>
        !this.selectedContact.members.some((member: { email: string }) => member.email === contact.email)
      );
    } else {
      this.filteredContacts = this.contacts.filter(contact =>
        contact.name.toLowerCase().includes(this.searchUserQuery.toLowerCase()) &&
        !this.selectedContact.members.some((member: { email: string }) => member.email === contact.email)
      );
    }
  }



  removeMemberFromGroup(member: any) {
    if (!this.selectedContact.isCreator) {
      this.toastr.error('Only the group creator can remove members.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    // Ensure that group_id and member ID are present
    if (!this.selectedContact.id || !member.id) {
      this.toastr.error('Group ID or Member ID is missing.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    const requestBody = {
      group_id: this.selectedContact.id,   // Group ID
      contact_id: member.id  // Member ID
    };

    // Send the request to the backend to remove the member
    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/remove_group_member.php',
      requestBody
    ).subscribe(
      (response) => {
        if (response.status === 'success') {
          // Remove the member from the UI if the removal is successful
          this.selectedContact.members = this.selectedContact.members.filter(
            (m: { email: string }) => m.email !== member.email
          );
          this.toastr.success('Member removed successfully.', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
        } else {
          this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        }
      },
      (error) => {
        console.error("Error removing member:", error);
        this.toastr.error('Failed to remove member. Please try again.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }


  deleteGroup() {
    const confirmation = confirm("Are you sure you want to delete this group?");

    // Proceed only if the user confirms
    if (confirmation) {
      // Ensure selectedContact has a valid id and creator information
      if (!this.selectedContact || !this.selectedContact.id || !this.selectedContact.creator || !this.selectedContact.creator.email) {
        this.toastr.error('Group ID or creator information is missing.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
       
        return;
      }

      // Check if the current user is the creator of the group
      if (this.selectedContact.creator.email !== this.user.email) {
        this.toastr.error('Only the creator can delete the group.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        return;
      }

      const requestBody = {
        group_id: this.selectedContact.id,
        user_email: this.user.email // Send the logged-in user's email
      };

      // Log the request body for debugging
     

      // Send request to the backend to delete the group
      this.http.post<{ status: string, message?: string }>(
        'http://localhost/angular-auth/delete_group.php',
        requestBody
      ).subscribe(
        (response) => {
          if (response.status === 'success') {
            // Handle UI updates on success
            console.log("Group deleted:", response.message);

            // Optionally remove the group from the UI here
            this.groups = this.groups.filter(group => group.id !== this.selectedContact.id);
            this.filteredGroups = this.filteredGroups.filter(group => group.id !== this.selectedContact.id);
            this.selectedContact = null;  // Clear the selected group
            this.toastr.success('Group deleted successfully!', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
          } else {
            this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
          }
        },
        (error) => {
          console.error("Error deleting group:", error);
          this.toastr.error('Failed to delete group. Please try again.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        }
      );
    }
  }


  exitGroup() {
    const confirmation = confirm("Are you sure you want to exit this group?");

    if (!confirmation) return;

    if (!this.selectedContact || !this.selectedContact.id || !this.user.email) {
      this.toastr.error('Group ID or user email is missing.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    const requestBody = {
      group_id: this.selectedContact.id,
      user_email: this.user.email
    };

    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/exit_group.php',
      requestBody
    ).subscribe(
      (response) => {
        if (response.status === 'success') {
          this.toastr.success(response.message || 'You have successfully exited the group.', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });

          // ✅ Remove the group from the UI
          this.groups = this.groups.filter(group => group.id !== this.selectedContact.id);
          this.filteredGroups = this.filteredGroups.filter(group => group.id !== this.selectedContact.id);
          this.selectedContact = null;
        } else {
          this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        }
      },
      (error) => {
        console.error("Error exiting group:", error);
        this.toastr.error('Server error. Check logs.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }









  openGroupDetails() {
    this.isEditingGroupName = false;
    const modal = document.getElementById('groupDetailsModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  closeGroupDetails() {
    this.isEditingGroupName = false;
    const modal = document.getElementById('groupDetailsModal') as HTMLElement;
    modal.style.display = 'none';
  }


  isEditingDescription: boolean = false;
  originalDescription: string = '';

  toggleEditDescription() {
    this.originalDescription = this.selectedContact.description;
    this.isEditingDescription = true;
  }

  cancelEditDescription() {
    this.selectedContact.description = this.originalDescription;
    this.isEditingDescription = false;
  }

  saveDescription() {
    if (!this.selectedContact.id || !this.selectedContact.description.trim()) {
      this.toastr.warning('Invalid description', 'Warning', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    // Debugging: Log data before sending
    console.log("Sending Data:", {
      group_id: this.selectedContact.id,
      group_description: this.selectedContact.description.trim()
    });

    const formData = new FormData();
    formData.append('group_id', this.selectedContact.id);
    formData.append('group_description', this.selectedContact.description.trim());

    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/update_group_description.php',
      formData
    ).subscribe(
      (response) => {
       
        if (response.status === 'success') {
          this.toastr.success('Group description updated successfully!', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
          this.isEditingDescription = false;
        } else {
          this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        }
      },
      (error) => {
        console.error('Update failed:', error);
        this.toastr.error(error || 'Update failed:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }



  scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.getElementById('chatMessages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('expanded', this.isSidebarExpanded);
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


  openModal() {
    const modal = document.getElementById('addContactModal') as HTMLElement;
    modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('addContactModal') as HTMLElement;
    modal.style.display = 'none';
  }

  saveContact(event: Event) {
    event.preventDefault();
    if (this.contact.name && this.contact.email) {
      const contactData = { ...this.contact, user_email: this.user.email };

      this.http.post('http://localhost/angular-auth/save_contact.php', contactData)
        .subscribe(
          (response: any) => {
            if (response.status === 'success') {
              this.toastr.success('Contact Saved Successfully!', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
              this.contact = { name: '', email: '' };
              this.closeModal();
              this.loadContacts();
            } else {
              this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
            }
          },
          (error) => {
            this.toastr.error('An error occurred while saving the contact.', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
          }
        );
    } else {
      this.toastr.warning('Please fill all fields.', 'Warning', { timeOut: 3000, closeButton: true, progressBar: true });
    }
  }

  // Check if a user is logged in
  isLoggedIn(): boolean {
    const currentUserEmail = sessionStorage.getItem('current_user_email');
    return !!currentUserEmail && !!sessionStorage.getItem(`user_${currentUserEmail}`);
  }

  getUser() {
    try {
      const currentUserEmail = sessionStorage.getItem('current_user_email');
      if (!currentUserEmail) return null;

      const userData = sessionStorage.getItem(`user_${currentUserEmail}`);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error retrieving user data:", error);
      return null;
    }
  }


  // Filter contacts based on the search query
  filterContacts() {
    if (this.isChatsActive) {
      // If in Chats tab, filter contacts
      if (!this.searchQuery) {
        this.filteredContacts = [...this.contacts];
      } else {
        this.filteredContacts = this.contacts.filter(contact =>
          contact.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    } else {
      // If in Groups tab, filter groups
      if (!this.searchQuery) {
        this.filteredGroups = [...this.groups];
      } else {
        this.filteredGroups = this.groups.filter(group =>
          group.group_name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    }
  }



  isChatsActive: boolean = true;

  // Toggle between Chat and Group views
  toggleTab(tab: string) {
    if (tab === 'chats') {
      this.isChatsActive = true;
      this.selectedContact = null;
    } else if (tab === 'groups') {
      this.isChatsActive = false;
      this.selectedContact = null;
    }
  }



  isEditingGroupName: boolean = false;
  originalGroupName: string = '';


  toggleEditGroupName() {
    this.originalGroupName = this.selectedContact.name; // Store original name before editing
    this.isEditingGroupName = true;
  }

  cancelEditGroupName() {
    this.selectedContact.name = this.originalGroupName; // Revert to original name
    this.isEditingGroupName = false; // Exit edit mode
  }

  updateGroupName() {
    if (!this.selectedContact.id || !this.selectedContact.name.trim()) {
      this.toastr.warning('Invalid group name', 'Warning', { timeOut: 3000, closeButton: true, progressBar: true });
      return;
    }

    const formData = new FormData();
    formData.append('group_id', this.selectedContact.id);
    formData.append('group_name', this.selectedContact.name.trim());

    this.http.post<{ status: string, message?: string }>(
      'http://localhost/angular-auth/update_group_name.php',
      formData
    ).subscribe(
      (response) => {
        if (response.status === 'success') {
          // Update group name in the group list
          const groupIndex = this.groups.findIndex(group => group.id === this.selectedContact.id);
          if (groupIndex !== -1) {
            this.groups[groupIndex].group_name = this.selectedContact.name;
          }

          const filteredGroupIndex = this.filteredGroups.findIndex(group => group.id === this.selectedContact.id);
          if (filteredGroupIndex !== -1) {
            this.filteredGroups[filteredGroupIndex].group_name = this.selectedContact.name;
          }
          this.toastr.success('Group name updated successfully!', 'Success', { timeOut: 3000, closeButton: true, progressBar: true });
          this.isEditingGroupName = false; // Exit edit mode
        } else {
          this.toastr.error(response.message || 'Error:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
        }
      },
      (error) => {
        console.error('Update failed:', error);
        this.toastr.error(error || 'Update failed:', 'Error', { timeOut: 3000, closeButton: true, progressBar: true });
      }
    );
  }

}
