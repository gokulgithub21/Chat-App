import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket = io('http://localhost:3000');


  // Notify the server that the user is online
  setUserOnline(email: string): void {
    this.socket.emit('userOnline', email);
  }


  getOnlineUsers(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('updateOnlineUsers', (users) => {
        console.log('Online users update received:', users); // Debug log
        observer.next(users);
      });
    });
  }
  

  

  sendMessage(message: any) {
    this.socket.emit('sendMessage', message);
  }

  getMessages(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receiveMessage', message => {
        observer.next(message);
      });
    });
  }

  disconnect(): void {
    this.socket.disconnect();
  }
  
  handleDisconnect(): Observable<void> {
    return new Observable(observer => {
      this.socket.on('disconnect', () => {
        observer.next();
        observer.complete();
      });
    });
  }
  
}
