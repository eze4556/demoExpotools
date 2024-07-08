import { UserService } from './../../../common/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

 import { FirestoreService } from '../../../common/services/firestore.service';

import { UserI } from 'src/app/common/models/users.models';
import { OverlayEventDetail } from '@ionic/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  imports: [
CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosPage implements OnInit {

 usuarios: UserI[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private UserService: UserService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

    ngOnInit(): void {
    this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      this.usuarios = await this.UserService.getAllUsers();
      console.log('Usuarios cargados:', this.usuarios);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  }

  async eliminarUsuario(usuario: UserI) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Eliminando...',
            });
            await loading.present();

            try {
              await this.firestoreService.deleteUser(usuario);
              this.usuarios = this.usuarios.filter((u) => u.id !== usuario.id);
              console.log(`Usuario eliminado: ${usuario.id}`);
            } catch (error) {
              console.error('Error eliminando el usuario:', error);
            } finally {
              await loading.dismiss();
            }
          },
        },
      ],
    });

    await alert.present();
  }
}
