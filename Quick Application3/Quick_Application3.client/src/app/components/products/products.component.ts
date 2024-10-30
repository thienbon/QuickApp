import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
@Component({
  selector: 'app-product',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  searchedProduct: Product | null = null;
  searchId: number = 0;


  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  searchProductById(): void {
    if (this.searchId) {
      this.productService.getProductById(this.searchId).subscribe(
        (product) => {
          this.searchedProduct = product;
        },
        (error) => {
          console.error('Product not found:', error);
          this.searchedProduct = null; // Reset if product not found
        }
      );
    }
  }
}
