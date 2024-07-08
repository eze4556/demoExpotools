import { Productoferta } from './../../../common/models/productofree.model';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {  LoadingController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FirestoreService } from '../../../common/services/firestore.service';
// import { Productoferta } from 'src/app/common/models/productofree.model';
import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Marca } from 'src/app/common/models/marca.model';
import { Categoria } from 'src/app/common/models/categoria.model';
import {  DocumentData } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';
import {
  IonItem,
  IonIcon,
  IonButton,
  IonLabel,
  IonInput,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonFooter,
  IonCardTitle,
  IonList,
  IonCardContent,
IonModal,
  IonToolbar,
  IonTitle,
  IonHeader, IonBackButton, IonButtons, IonSpinner, IonSelectOption, IonSelect, IonSearchbar, IonAvatar } from '@ionic/angular/standalone';


@Component({
   standalone: true,
  imports: [ CommonModule, FormsModule, ReactiveFormsModule,IonAvatar, IonSearchbar, IonSpinner, IonButtons, IonBackButton,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonIcon,
    IonInput,
    IonLabel,
    IonContent,
    IonGrid,
    IonFooter,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonModal,
    IonCardTitle,
    IonList,
    IonCardContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonSelectOption,
    IonSelect,
    IonSearchbar,
    IonButton],
  selector: 'app-oferta-product',
  templateUrl: './oferta-product.component.html',
  styleUrls: ['./oferta-product.component.scss'],
})
export class OfertaProductComponent  implements OnInit {
  productos: Productoferta[] = [];
  categorias: Categoria[] = [];
  marcas: Marca[] = [];
  productoOfertaForm: FormGroup;
  isModalOpen: boolean = false;
  editMode: boolean = false;
  productoAEditar: Productoferta | null = null;
  imagenProducto: File | null = null;
  selectedFile: File | null = null;
  searchTerm: string = '';




    @ViewChild(IonModal) modal!: IonModal;


constructor(
    private firestoreService: FirestoreService,
    private alertController: AlertController,
    private fb: FormBuilder,
    private loadingController: LoadingController,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.productoOfertaForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, Validators.required],
      descuento: [0],
      precioFinal: [{ value: 0, disabled: true }],
      codigo: [''],
      etiqueta: [''],
      categoria: [null, Validators.required],
      marca: [null, Validators.required],
      imagen: ['']
    });



    this.productoOfertaForm.get('precio')!.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });
    this.productoOfertaForm.get('descuento')!.valueChanges.subscribe(() => {
      this.calcularPrecioFinal();
    });
  }

   async ngOnInit() {
    this.cargarProductos();
    this.cargarMarcas();
    this.cargarCategorias();
  }

  calcularPrecioFinal() {
    const precio = this.productoOfertaForm.get('precio')!.value;
    const descuento = this.productoOfertaForm.get('descuento')!.value;
    const precioFinal = precio - (precio * descuento / 100);
    this.productoOfertaForm.get('precioFinal')!.setValue(precioFinal);
  }

paginatedProductos: Productoferta[] = [];
currentPage: number = 1;
  pageSize: number = 6;

// getProductosPaginados(): Producto[] {
//     const startIndex = (this.currentPage - 1) * this.pageSize;
//     return this.productos.slice(startIndex, startIndex + this.pageSize);
//   }

getProductosPaginados(): Productoferta[] {
    const filteredProductos = this.productos.filter(producto =>
      (producto.nombre && producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
      (producto.codigo && producto.codigo.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filteredProductos.slice(startIndex, startIndex + this.pageSize);
  }


  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginatedProductos = this.getProductosPaginados();
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.productos.length / this.pageSize);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.paginatedProductos = this.getProductosPaginados();
    }
  }


  async cargarProductos() {
    this.productos = await this.firestoreService.getProductofertas();
    this.paginatedProductos = this.getProductosPaginados();
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
    this.productoOfertaForm.reset();
  }

  closeModal() {
    this.isModalOpen = false;
    this.productoAEditar = null;
    this.imagenProducto = null;
  }

  // async agregarOEditarProducto() {
  //   if (this.productoOfertaForm.invalid) {
  //     return;
  //   }

  //   const productoData = this.productoOfertaForm.value;



  //   console.log('Descripción del producto:', this.productoOfertaForm.get('descripcion')!.value);

  //   productoData.precioFinal = this.productoOfertaForm.get('precioFinal')!.value;

  //   const loading = await this.loadingController.create({
  //     message: 'Guardando...',
  //   });
  //   await loading.present();

  //   try {
  //     if (this.editMode && this.productoAEditar) {
  //       productoData.id = this.productoAEditar.id;
  //       await this.firestoreService.updateProducto(productoData, this.imagenProducto);
  //     } else {
  //       await this.firestoreService.addProducto(productoData, this.imagenProducto);
  //     }
  //     this.showSuccessAlert('Producto guardado con éxito.');
  //   } catch (error) {
  //     console.error('Error al guardar el producto:', error);
  //     this.showErrorAlert('Error al guardar el producto. Por favor, inténtalo de nuevo.');
  //   } finally {
  //     await loading.dismiss();
  //     this.closeModal();
  //     this.cargarProductos();
  //   }
  // }


async agregarProducto() {
    if (this.productoOfertaForm.invalid) {
      this.showErrorAlert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const productoData = this.productoOfertaForm.value;

    console.log('Descripción del producto:', this.productoOfertaForm.get('descripcion')!.value);

    productoData.precioFinal = this.productoOfertaForm.get('precioFinal')!.value;

    const loading = await this.loadingController.create({
      message: 'Guardando...',
    });
    await loading.present();

    try {
      await this.firestoreService.addProductoferta(productoData, this.imagenProducto);
      this.showSuccessAlert('Producto guardado con éxito.');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      this.showErrorAlert('Error al guardar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      await loading.dismiss();
      this.closeModal();
      this.cargarProductos();
    }
  }



  // async eliminarProducto(producto: Productoferta) {
  //   if (!producto) {
  //     console.error('El producto es null o undefined.');
  //     return;
  //   }

  //   console.log('Producto a eliminar:', producto);

  //   if (!producto.id) {
  //     console.error('El id del producto es null o undefined.');
  //     return;
  //   }

  //   const alert = await this.alertController.create({
  //     header: 'Confirmar Eliminación',
  //     message: `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Eliminar',
  //         handler: async () => {
  //           const loading = await this.loadingController.create({
  //             message: 'Eliminando...',
  //           });
  //           await loading.present();

  //           try {
  //             await this.firestoreService.deleteProducto(producto);
  //             this.productos = this.productos.filter(p => p.id !== producto.id);
  //             console.log(`Producto eliminado: ${producto.id}`);
  //             this.showSuccessAlert('El producto se ha eliminado con éxito.');
  //             this.cargarProductos();
  //           } catch (error) {
  //             console.error('Error eliminando el producto:', error);
  //             this.showErrorAlert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
  //           } finally {
  //             await loading.dismiss();
  //             this.changeDetectorRef.detectChanges();
  //           }
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }




  cancelarEdicion() {
    this.productoAEditar = null;
    this.editMode = false;
    this.closeModal();
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.agregarProducto();
    }
  }

  async showSuccessAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Éxito',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

filtrarProductos(event: any) {
  const value = event.target.value;
  if (value) {
    this.searchTerm = value.toLowerCase();
  } else {
    this.searchTerm = '';
  }
  this.currentPage = 1;  // Reset the current page to 1 after filtering
  this.paginatedProductos = this.getProductosPaginados();
}


async editarProducto(producto: Productoferta) {
  this.productoAEditar = producto;
  this.editMode = true;
  this.isModalOpen = true;

  this.productoOfertaForm.patchValue({
    id: producto.id,
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: producto.precio,
    descuento: producto.descuento,
    precioFinal: producto.precioFinal,
    codigo: producto.codigo,
    etiqueta: producto.etiqueta,
    categoria: producto.categoria,
    marca: producto.marca,
    imagen: producto.imagen
  });
}

async actualizarProducto() {
  if (this.productoOfertaForm.invalid) {
    this.showErrorAlert('Por favor, completa todos los campos requeridos.');
    return;
  }

  const productoData = this.productoOfertaForm.value;

  console.log('Descripción del producto:', this.productoOfertaForm.get('descripcion')!.value);

  productoData.precioFinal = this.productoOfertaForm.get('precioFinal')!.value;

  const loading = await this.loadingController.create({
    message: 'Actualizando...',
  });
  await loading.present();

  try {
    await this.firestoreService.updateProductoferta(productoData, this.imagenProducto);
    this.showSuccessAlert('Producto actualizado con éxito.');
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    this.showErrorAlert('Error al actualizar el producto. Por favor, inténtalo de nuevo.');
  } finally {
    await loading.dismiss();
    this.closeModal();
    this.cargarProductos();
  }
}

async eliminarProducto(producto: Productoferta) {
  if (!producto) {
    console.error('El producto es null o undefined.');
    return;
  }

  console.log('Producto a eliminar:', producto);

  if (!producto.id) {
    console.error('El id del producto es null o undefined.');
    return;
  }

  const alert = await this.alertController.create({
    header: 'Confirmar Eliminación',
    message: `¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
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
            await this.firestoreService.deleteProductoferta(producto.id);
            this.productos = this.productos.filter(p => p.id !== producto.id);
            console.log(`Producto eliminado: ${producto.id}`);
            this.showSuccessAlert('El producto se ha eliminado con éxito.');
            this.cargarProductos();
          } catch (error) {
            console.error('Error eliminando el producto:', error);
            this.showErrorAlert('Error al eliminar el producto. Por favor, inténtalo de nuevo.');
          } finally {
            await loading.dismiss();
            this.changeDetectorRef.detectChanges();
          }
        },
      },
    ],
  });

  await alert.present();
}


}
