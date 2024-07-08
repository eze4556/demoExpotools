import { DocumentReference } from '@angular/fire/firestore';

export interface Productoferta {
  id: string;
  nombre: string;
 descripcion: string;
  precio: number;
  descuento?:number;
  precioFinal?: number;
  codigo: string;
  etiqueta: string;
  categoria: DocumentReference; // Referencia a la categoría
  marca: DocumentReference;    // Referencia a la marca
  imagen: string;              // URL de la imagen
}
