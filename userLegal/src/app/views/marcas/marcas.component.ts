import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule,FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Component, OnInit, ViewChild,ChangeDetectorRef } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { FirestoreService } from '../../common/services/firestore.service';
import { Marca } from '../../common/models/marca.model';
import { AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';


@Component({
 standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-marcas',
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.scss'],
})
export class MarcasPage implements OnInit {
    marcas: Marca[] = [];
  nuevaMarca: Marca = { nombre: '', imagen: '' };
  imagenMarca: File | null = null;
   isModalOpen: boolean = false;
  editMode: boolean = false;
  marcaForm: FormGroup;

marcaAEditar: Marca | null = null;

  @ViewChild(IonModal) modal!: IonModal;


  constructor(
    private FirestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.marcaForm = this.fb.group({
  id: [''],
  nombre: ['', Validators.required],
  imagen: ['']
});       }

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


 async agregarOEditarProducto() {
    if (this.marcaForm.invalid) {
      return;
    }

    const marcaData = this.marcaForm.value;
    if (this.editMode && this.marcaAEditar) {
      marcaData.id = this.marcaAEditar.id;
      await this.FirestoreService.updateMarca(marcaData, this.imagenMarca);
    } else {
      await this.FirestoreService.addMarca(marcaData, this.imagenMarca);
    }

    this.closeModal();
    this.cargarMarcas();
  }



   openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.marcaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;

    this.imagenMarca = null;
  }

  //   editarProducto(producto: Producto) {
  //   this.productoAEditar = producto;
  //   this.editMode = true;
  //   this.productoForm.patchValue(producto);
  //   this.isModalOpen = true;
  // }


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
            this.changeDetectorRef.detectChanges();
          },
        },
      ],
    });

    await alert.present();
  }
}
