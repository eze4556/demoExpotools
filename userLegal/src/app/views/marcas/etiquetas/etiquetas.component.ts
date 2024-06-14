import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../../common/services/firestore.service';

import { ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { IonModal, IonicModule } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import { AlertController } from '@ionic/angular';
import { FormsModule, FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {  DocumentData } from '@angular/fire/compat/firestore';
import { DocumentReference } from '@angular/fire/firestore';

@Component({
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-etiquetas',
  templateUrl: './etiquetas.component.html',
  styleUrls: ['./etiquetas.component.scss']
})
export class GestionEtiquetasPage implements OnInit {
  etiquetas: string[] = [];
   selectedEtiqueta: string = '';
  porcentajeAumento: number | null = null;

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.cargarEtiquetas();
  }

  async cargarEtiquetas() {
    this.etiquetas = await this.firestoreService.getEtiquetas();
  }

  async actualizarPrecios() {
    if (this.selectedEtiqueta && this.porcentajeAumento > 0) {
      await this.firestoreService.actualizarPreciosPorEtiqueta(this.selectedEtiqueta, this.porcentajeAumento);
      alert('Precios actualizados con éxito');
    }
  }
}
