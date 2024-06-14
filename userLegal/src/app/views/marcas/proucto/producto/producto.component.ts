import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../../common/services/firestore.service';
import { Producto } from '../../../../common/models/producto.model';
import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Marca } from '../../../../common/models/marca.model';
import { Categoria } from '../../../../common/models/categoria.model';
import {  DocumentData } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-productos',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
})
export class ProductosPage implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  productoForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  productoAEditar: Producto | null = null;
  imagenProducto: File | null = null;
  selectedFile: File | null = null;

    @ViewChild(IonModal) modal!: IonModal;


 constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.productoForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      descripcion: [''],
      precio: [0, Validators.required],
      descuento: [0],
      precioFinal: [{ value: 0, disabled: true }],
      precioDistribuidor: [null],
      etiqueta: [''],
      categoria: [null, Validators.required],
      marca: [null, Validators.required],
      imagen: ['']
    });

    this.productoForm.get('precio')!.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });
    this.productoForm.get('descuento')!.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });
  }

  async ngOnInit() {
    this.cargarProductos();
    this.cargarMarcas();
    this.cargarCategorias();
  }

  calcularPrecioFinal() {
    const precio = this.productoForm.get('precio')!.value;
    const descuento = this.productoForm.get('descuento')!.value;
    const precioFinal = precio - (precio * descuento / 100);
    this.productoForm.get('precioFinal')!.setValue(precioFinal);
  }

  async cargarProductos() {
    this.productos = await this.firestoreService.getProductos();
    console.log('Productos obtenidos:', this.productos);
    this.changeDetectorRef.detectChanges();
  }

  async cargarMarcas() {
    this.marcas = await this.firestoreService.getMarcas();
  }

  async cargarCategorias() {
    this.categorias = await this.firestoreService.getCategorias();
  }

  getCategoriaNombre(categoriaRef: DocumentReference<DocumentData>): string {
    if (categoriaRef) {
      const categoria = this.categorias.find(cat => cat.id === categoriaRef.id);
      return categoria ? categoria.nombre : 'Sin categoría';
    }
    return 'Sin categoría';
  }

  getMarcaNombre(marcaRef: DocumentReference<DocumentData>): string {
    if (marcaRef) {
      const marca = this.marcas.find(mar => mar.id === marcaRef.id);
      return marca ? marca.nombre : 'Sin marca';
    }
    return 'Sin marca';
  }

  onFileSelected(event: any) {
    this.imagenProducto = event.target.files[0];
  }

  openModal() {
    this.isModalOpen = true;
    this.editMode = false;
    this.productoForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.productoAEditar = null;
    this.imagenProducto = null;
  }

  async agregarOEditarProducto() {
    if (this.productoForm.invalid) {
      return;
    }

    const productoData = this.productoForm.value;
    productoData.precioFinal = this.productoForm.get('precioFinal')!.value;
    if (this.editMode && this.productoAEditar) {
      productoData.id = this.productoAEditar.id;
      await this.firestoreService.updateProducto(productoData, this.imagenProducto);
    } else {
      await this.firestoreService.addProducto(productoData, this.imagenProducto);
    }

    this.closeModal();
    this.cargarProductos();
  }

  async eliminarProducto(producto: Producto) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            await this.firestoreService.deleteProducto(producto);
            this.cargarProductos();
            this.changeDetectorRef.detectChanges();
          },
        },
      ],
    });

    await alert.present();
  }

  editarProducto(producto: Producto) {
    this.productoAEditar = producto;
    this.editMode = true;
    this.productoForm.patchValue(producto);
    this.isModalOpen = true;
  }

  cancelarEdicion() {
    this.productoAEditar = null;
    this.editMode = false;
    this.closeModal();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarOEditarProducto();
    }
  }
}
