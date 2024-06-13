import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { FirestoreService } from '../../common/services/firestore.service';
import { Marca } from '../../common/models/marca.model';
import { AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule,FormsModule],
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
})
export class MarcasPage implements OnInit {
    marcas: Marca[] = [];
  nuevaMarca: Marca = { nombre: '', imagen: '' };
  imagenMarca: File | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private FirestoreService: FirestoreService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarMarcas();
  }

   cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.nuevaMarca, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarMarca();
    }
  }

  async cargarMarcas() {
    this.marcas = await this.FirestoreService.getMarcas();
  }

  onFileSelected(event: any) {
    this.imagenMarca = event.target.files[0];
  }

  async agregarMarca() {
    await this.FirestoreService.addMarca(this.nuevaMarca, this.imagenMarca);
    this.nuevaMarca = { nombre: '', imagen: '' };
    this.imagenMarca = null;
    this.cargarMarcas();

    this.modal.dismiss(); 
  }

  async eliminarMarca(marca: Marca) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la marca "${marca.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.FirestoreService.deleteMarca(marca);
            this.cargarMarcas();
          },
        },
      ],
    });

    await alert.present();
  }
}
