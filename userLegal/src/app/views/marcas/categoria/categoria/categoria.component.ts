import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../../common/services/firestore.service';
import { Categoria } from '../../../../common/models/categoria.model';
import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-categorias',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
})
export class CategoriasPage implements OnInit {
  categorias: Categoria[] = [];
  categoriaForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  categoriaAEditar: Categoria | null = null;
  imagenCategoria: File | null = null;

  constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController
  ) {}

  async ngOnInit() {
    // this.cargarCategorias();
     this.categorias = await this.firestoreService.getCategorias();
    console.log('Categorías obtenidas en ngOnInit:', this.categorias);
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
    this.changeDetectorRef.detectChanges();
  }

  onFileSelected(event: any) {
    this.imagenCategoria = event.target.files[0];
  }

  // async agregarCategoria() {
  //   await this.firestoreService.addCategoria(this.nuevaCategoria, this.imagenCategoria);
  //   this.nuevaCategoria = { nombre: '', imagen: '' };
  //   this.imagenCategoria = null;
  //   this.cargarCategorias();
  //   this.modal.dismiss();
  // }

   async agregarCategoria(nombre: string, imagen: File) {
    const nuevaCategoria: Categoria = { nombre, imagen: '' };
    try {
      const categoriaAgregada = await this.firestoreService.addCategoria(nuevaCategoria, imagen);
      this.categorias.push(categoriaAgregada); // Asegurarse de que la categoría agregada tenga el id correcto
      console.log('Categoría agregada:', categoriaAgregada);
    } catch (error) {
      console.error('Error agregando la categoría:', error);
    }
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
      // this.agregarCategoria();
    }
  }

  // async eliminarCategoria(categoria: Categoria) {
  //   const alert = await this.alertController.create({
  //     header: 'Confirmar Eliminación',
  //     message: `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`,
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Eliminar',
  //         handler: async () => {
  //           await this.firestoreService.deleteCategoria(categoria);
  //           this.cargarCategorias();
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }


 async eliminarCategoria(categoria: Categoria) {
    if (!categoria) {
      console.error('La categoría es null o undefined.');
      return;
    }

    console.log('Categoría a eliminar:', categoria);

    if (!categoria.id) {
      console.error('El id de la categoría es null o undefined.');
      return;
    }

    console.log(`Eliminando categoría con id: ${categoria.id}`);
    try {
      await this.firestoreService.deleteCategoria(categoria);
      this.categorias = this.categorias.filter(c => c.id !== categoria.id);
      console.log(`Categoría eliminada: ${categoria.id}`);
    } catch (error) {
      console.error('Error eliminando la categoría:', error);
    }
  }



}
