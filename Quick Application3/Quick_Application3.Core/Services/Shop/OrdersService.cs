// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.ebenmonney.com/templates
// (c) 2024 www.ebenmonney.com/mit-license
// ---------------------------------------

using Microsoft.EntityFrameworkCore;
using Quick_Application3.Core.Infrastructure;
using Quick_Application3.Core.Models.Shop;

namespace Quick_Application3.Core.Services.Shop
{
    public class OrdersService : IOrdersService
    {
        private readonly ApplicationDbContext _dbContext;
        public OrdersService(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        }
        public async Task<List<Order>> GetAllOrdersAsync()
        {
            return await _dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ToListAsync();
        }
        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _dbContext.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            _dbContext.Orders.Add(order);
            await _dbContext.SaveChangesAsync();
            return order;
        }

        public async Task DeleteOrderAsync(int id)
        {
            var order = await _dbContext.Orders.FindAsync(id);
            if (order != null)
            {
                _dbContext.Orders.Remove(order);
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task<Order?> UpdateOrderAsync(int id, Order order)
        {
            var existingOrder = await _dbContext.Orders.FindAsync(id);
            if (existingOrder == null) return null;

            // Update properties
            existingOrder.Discount = order.Discount;
            existingOrder.Comments = order.Comments;
            existingOrder.CashierId = order.CashierId;
            existingOrder.CustomerId = order.CustomerId;

            await _dbContext.SaveChangesAsync();
            return existingOrder;
        }



    }
}
