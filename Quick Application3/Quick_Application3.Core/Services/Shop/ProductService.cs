using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Quick_Application3.Core.Infrastructure;
using Quick_Application3.Core.Models.Shop;

namespace Quick_Application3.Core.Services.Shop
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _dbContext;

        // Constructor
        public ProductService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext)); 
        }

        public async Task<List<Product>> GetAllProductsAsync()
        {
            return await _dbContext.Products.ToListAsync();
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            return await _dbContext.Products.FindAsync(id);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();
            return product;
        }
        public async Task DeleteProductAsync(int id)
        {
            var product = await _dbContext.Products.FindAsync(id);
            if (product != null)
            {
                _dbContext.Products.Remove(product);
                await _dbContext.SaveChangesAsync();
            }
        }
        public async Task<Product?> UpdateProductAsync(int id, Product product)
        {
            var existingProduct = await _dbContext.Products.FindAsync(id);
            if (existingProduct == null) return null;

            // Update properties
            existingProduct.Name = product.Name;
            existingProduct.Description = product.Description;
            existingProduct.BuyingPrice = product.BuyingPrice;
            existingProduct.SellingPrice = product.SellingPrice;
            existingProduct.UnitsInStock = product.UnitsInStock;
            existingProduct.IsActive = product.IsActive;
            existingProduct.IsDiscontinued = product.IsDiscontinued;

            await _dbContext.SaveChangesAsync();
            return existingProduct;
        }

    }
}
