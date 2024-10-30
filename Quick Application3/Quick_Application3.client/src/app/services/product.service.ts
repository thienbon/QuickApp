import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';
import { ConfigurationService } from './configuration.service';


@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${this.configurations.baseUrl}/api/product`;
  constructor(private http: HttpClient,
    private configurations: ConfigurationService) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}