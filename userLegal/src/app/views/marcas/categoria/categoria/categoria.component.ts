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
    private alertController: AlertController,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.categoriaForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      imagen: ['']
    });
  }

  ngOnInit() {
    this.cargarCategorias();
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
    this.changeDetectorRef.detectChanges();
  }

  onFileSelected(event: any) {
    this.imagenCategoria = event.target.files[0];
  }

  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.categoriaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.categoriaAEditar = null;
    this.imagenCategoria = null;
  }

  async agregarOEditarCategoria() {
    if (this.categoriaForm.invalid) {
      return;
    }

    const categoriaData = this.categoriaForm.value;
    if (this.editMode && this.categoriaAEditar) {
      categoriaData.id = this.categoriaAEditar.id;
      await this.firestoreService.updateCategoria(categoriaData, this.imagenCategoria);
    } else {
      await this.firestoreService.addCategoria(categoriaData, this.imagenCategoria);
      this.showSuccessAlert();
    }

    this.closeModal();
    this.cargarCategorias();
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
            this.changeDetectorRef.detectChanges();
          },
        },
      ],
    });

    await alert.present();
  }

  editarCategoria(categoria: Categoria) {
    this.categoriaAEditar = categoria;
    this.editMode = true;
    this.categoriaForm.patchValue(categoria);
    this.isModalOpen = true;
  }

  cancelarEdicion() {
    this.categoriaAEditar = null;
    this.editMode = false;
    this.closeModal();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarOEditarCategoria();
    }
  }

  async showSuccessAlert() {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message: 'La categoría se ha creado con éxito.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
