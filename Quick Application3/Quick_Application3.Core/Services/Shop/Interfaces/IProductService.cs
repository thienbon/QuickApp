// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using Quick_Application3.Core.Models.Shop;

namespace Quick_Application3.Core.Services.Shop
{
    public interface IProductService
    {

            Task<Product?> GetProductByIdAsync(int productId);
            Task<List<Product>> GetAllProductsAsync();
        Task<Product> CreateProductAsync(Product product);
        Task DeleteProductAsync(int id);
        Task<Product> UpdateProductAsync(int id, Product product);




    }
}
