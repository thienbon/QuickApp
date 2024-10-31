// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using Quick_Application3.Core.Models.Shop;

namespace Quick_Application3.Core.Services.Shop
{
    public interface IOrdersService
    {
        Task<Order?> GetOrderByIdAsync(int orderId);
        Task<List<Order>> GetAllOrdersAsync();
        Task<Order> CreateOrderAsync(Order order);
        Task DeleteOrderAsync(int id);
        Task<Order?> UpdateOrderAsync(int id, Order order);

    }
}
