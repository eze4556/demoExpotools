import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserI } from '../models/users.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection: AngularFirestoreCollection<UserI>;


 constructor(private afs: AngularFirestore) {
    this.usersCollection = this.afs.collection<UserI>('users');
  }



  deleteUser(userId: string): Promise<void> {
    return this.usersCollection.doc(userId).delete();
  }


     async getAllUsers(): Promise<UserI[]> {
    try {
      const userRecords = await this.afs.collection('users').get().toPromise();
      const users = userRecords.docs.map((doc: { id: any; data: () => any; }) => ({
        id: doc.id,
        ...doc.data()
      })) as UserI[];
      console.log('Usuarios obtenidos:', users); // Agregar console.log aquí
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

 

}
