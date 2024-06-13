import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from '@angular/fire/firestore';
import { Marca } from '../models/marca.model';
import { Categoria } from '../models/categoria.model';
import { Producto } from '../models/producto.model';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(private firestore: Firestore, private storage: Storage) {}

  // Marcas
  async getMarcas(): Promise<Marca[]> {
    const marcasSnapshot = await getDocs(
      query(collection(this.firestore, 'marcas'), orderBy('nombre'))
    );
    return marcasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Marca[];
  }

  async addMarca(marca: Marca, imagen: File): Promise<void> {
    if (imagen) {
      const storageRef = ref(this.storage, `marcas/${imagen.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagen);
      await uploadTask;
      marca.imagen = await getDownloadURL(storageRef);
    }
    await addDoc(collection(this.firestore, 'marcas'), marca);
  }

  async updateMarca(marca: Marca, imagen?: File): Promise<void> {
    if (imagen) {
      // Eliminar la imagen anterior si existe
      if (marca.imagen) {
        const storageRef = ref(this.storage, marca.imagen);
        await deleteObject(storageRef);
      }

      // Subir la nueva imagen
      const newStorageRef = ref(this.storage, `marcas/${imagen.name}`);
      const uploadTask = uploadBytesResumable(newStorageRef, imagen);
      await uploadTask;
      marca.imagen = await getDownloadURL(newStorageRef);
    }

    const marcaRef = doc(this.firestore, 'marcas', marca.id);
    await updateDoc(marcaRef, { ...marca });
  }

  async deleteMarca(marca: Marca): Promise<void> {
    // Eliminar la imagen asociada si existe
    if (marca.imagen) {
      const storageRef = ref(this.storage, marca.imagen);
      await deleteObject(storageRef);
    }

    // Eliminar el documento de la marca
    const marcaRef = doc(this.firestore, 'marcas', marca.id);
    await deleteDoc(marcaRef);
  }

  // Categorías
  async getCategorias(): Promise<Categoria[]> {
    const categoriasSnapshot = await getDocs(
      query(collection(this.firestore, 'categorias'), orderBy('nombre'))
    );
    return categoriasSnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Categoria
    );
  }

  async addCategoria(categoria: Categoria, imagen: File): Promise<void> {
    if (imagen) {
      const storageRef = ref(this.storage, `categorias/${imagen.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagen);
      await uploadTask;
      categoria.imagen = await getDownloadURL(storageRef);
    }
    await addDoc(collection(this.firestore, 'categorias'), categoria);
  }

  async updateCategoria(
    categoria: Categoria,
    imagen?: File
  ): Promise<void> {
    if (imagen) {
      // Eliminar la imagen anterior si existe
      if (categoria.imagen) {
        const storageRef = ref(this.storage, categoria.imagen);
        await deleteObject(storageRef);
      }

      // Subir la nueva imagen
      const newStorageRef = ref(this.storage, `categorias/${imagen.name}`);
      const uploadTask = uploadBytesResumable(newStorageRef, imagen);
      await uploadTask;
      categoria.imagen = await getDownloadURL(newStorageRef);
    }

    const categoriaRef = doc(this.firestore, 'categorias', categoria.id);
    await updateDoc(categoriaRef, { ...categoria });
  }

  async deleteCategoria(categoria: Categoria): Promise<void> {
    // Eliminar la imagen asociada si existe
    if (categoria.imagen) {
      const storageRef = ref(this.storage, categoria.imagen);
      await deleteObject(storageRef);
      }

      // Eliminar el documento de la categoría
      const categoriaRef = doc(this.firestore, 'categorias', categoria.id);
      await deleteDoc(categoriaRef);

  }

  // Productos
  async getProductos(): Promise<Producto[]> {
    const productosSnapshot = await getDocs(
      query(collection(this.firestore, 'productos'), orderBy('nombre'))
    );
    return productosSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data['nombre'],
        descripcion: data['descripcion'],
        precio: data['precio'],
        precioFinal: data['precioFinal'] || null,
        precioDistribuidor: data['precioDistribuidor'] || null,
        etiqueta: data['etiqueta'],
        categoria: data['categoria'],
        marca: data['marca'],
        imagen: data['imagen'] || null, // Manejar imagen opcional
      } as Producto;
    });
  }

  async addProducto(producto: Producto, imagen: File | null = null): Promise<void> {
    if (imagen) {
      const storageRef = ref(this.storage, `productos/${imagen.name}`);
      const uploadTask = uploadBytesResumable(storageRef, imagen);
      await uploadTask;
      producto.imagen = await getDownloadURL(storageRef);
    }
    await addDoc(collection(this.firestore, 'productos'), producto);
  }

   async updateProducto(producto: Producto, imagen?: File): Promise<void> {
    if (imagen) {
      // Eliminar la imagen anterior si existe
      if (producto.imagen) {
        const storageRef = ref(this.storage, producto.imagen);
        await deleteObject(storageRef);
      }

      // Subir la nueva imagen
      const newStorageRef = ref(this.storage, `productos/${imagen.name}`);
      const uploadTask = uploadBytesResumable(newStorageRef, imagen);
      await uploadTask;
      producto.imagen = await getDownloadURL(newStorageRef);
    }

    const productoRef = doc(this.firestore, 'productos', producto.id);
    await updateDoc(productoRef, { ...producto });
  }

  async deleteProducto(producto: Producto): Promise<void> {
    // Eliminar la imagen asociada si existe
    if (producto.imagen) {
      const storageRef = ref(this.storage, producto.imagen);
      await deleteObject(storageRef);
    }

    // Eliminar el documento del producto
    const productoRef = doc(this.firestore, 'productos', producto.id);
    await deleteDoc(productoRef);
  }

async getEtiquetas(): Promise<string[]> {
    const productosRef = collection(this.firestore, 'productos');
    const snapshot = await getDocs(productosRef);
    const etiquetas = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data() as Producto;
      if (data.etiqueta) {
        etiquetas.add(data.etiqueta);
      }
    });
    return Array.from(etiquetas);
  }

  async actualizarPreciosPorEtiqueta(etiqueta: string, nuevoPrecio: number): Promise<void> {
    const productosRef = collection(this.firestore, 'productos');
    const q = query(productosRef, where('etiqueta', '==', etiqueta));
    const snapshot = await getDocs(q);
    const batch = writeBatch(this.firestore);
    snapshot.forEach(docSnap => {
      const docRef = doc(this.firestore, 'productos', docSnap.id);
      batch.update(docRef, { precioFinal: nuevoPrecio , precio:nuevoPrecio });
    });
    await batch.commit();
  }

}
