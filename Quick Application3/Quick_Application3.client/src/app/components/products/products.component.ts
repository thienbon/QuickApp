import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  productForm: FormGroup;
  updateProductForm: FormGroup;
  searchTerm: string = '';
  searchType: 'name' | 'id' = 'name';
  showCreateProductForm = false;
  searchById: number | null = null;
  productToUpdate: Product | null = null;
  showUpdateProductForm = false;
  productToUpdateId: number | null = null;
  

  constructor(
    private productService: ProductService,
    private formBuilder: FormBuilder
  ) {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      buyingPrice: [0, Validators.required],
      sellingPrice: [0, Validators.required],
      unitsInStock: [0, Validators.required],
      isActive: [true],
      isDiscontinued: [false],
      productCategoryName: ['']

    });
    this.updateProductForm = this.formBuilder.group({ // Initialize the update form
      name: ['', Validators.required],
      description: [''],
      buyingPrice: [0, Validators.required],
      sellingPrice: [0, Validators.required],
      unitsInStock: [0, Validators.required],
      isActive: [true],
      isDiscontinued: [false],
      productCategoryName: ['']
    });
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productService.getAllProducts().subscribe(
      (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );
  }
  search(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredProducts = this.products;
      return;
    }

    if (this.searchType === 'name') {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      const id = parseInt(this.searchTerm);
      if (isNaN(id)) {
        this.filteredProducts = [];
        return;
      }

      this.productService.getProductById(id).subscribe(
        (product) => {
          if (product) {
            this.filteredProducts = [product];
          } else {
            this.filteredProducts = [];
          }
        },
        (error) => {
          console.error('Error fetching product by ID:', error);
          this.filteredProducts = [];
        }
      );
    }
  }
  openUpdateProductForm(product: Product): void {
    this.productToUpdateId = product.id;
    this.updateProductForm.patchValue(product); // Fill the update form with selected product's details
    this.showUpdateProductForm = true; // Show the update form
  }

  openCreateProductForm(): void {
    this.showCreateProductForm = true;
  }

  closeCreateProductForm(): void {
    this.showCreateProductForm = false;
    this.productForm.reset();
  }
  updateProduct(): void {
    if (this.updateProductForm.valid && this.productToUpdateId !== null) {
      this.productService.updateProduct(this.productToUpdateId, this.updateProductForm.value).subscribe(() => {
        this.fetchProducts(); // Refresh the product list after update
        this.productToUpdateId = null; // Reset the ID
        this.showUpdateProductForm = false; // Hide the update form
        this.updateProductForm.reset(); // Reset update form
      });
    }
  }
  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(
        () => {
          this.fetchProducts();
        },
        (error) => {
          console.error('Error deleting product:', error);
        }
      );
    }
  }

  addProduct(): void {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value;
      this.productService.createProduct(newProduct).subscribe(
        () => {
          this.fetchProducts();
          this.productForm.reset({
            isActive: true,
            isDiscontinued: false,
            buyingPrice: 0,
            sellingPrice: 0,
            unitsInStock: 0
          });
        },
        (error) => {
          console.error('Error creating product:', error);
        }
      );
    }
  }
}
