import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../../common/services/firestore.service';
import { Categoria } from '../../../../common/models/categoria.model';
import { AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  selector: 'app-categorias',
  templateUrl: './categoria.component.html',
   styleUrls: ['./categoria.component.scss'],

})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  nuevaCategoria: Categoria = { nombre: '', imagen: '' };
  imagenCategoria: File | null = null;

  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
  }

  onFileSelected(event: any) {
    this.imagenCategoria = event.target.files[0];
  }

  async agregarCategoria() {
    await this.firestoreService.addCategoria(this.nuevaCategoria, this.imagenCategoria);
    this.nuevaCategoria = { nombre: '', imagen: '' };
    this.imagenCategoria = null;
    this.cargarCategorias();
    this.modal.dismiss();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.nuevaCategoria, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarCategoria();
    }
  }

  async eliminarCategoria(categoria: Categoria) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.firestoreService.deleteCategoria(categoria);
            this.cargarCategorias();
          },
        },
      ],
    });

    await alert.present();
  }
}
