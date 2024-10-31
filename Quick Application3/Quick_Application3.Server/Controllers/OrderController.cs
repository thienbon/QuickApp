using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Quick_Application3.Core.Models.Shop;
using Quick_Application3.Core.Services.Shop;
using Quick_Application3.Server.ViewModels.Shop;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Quick_Application3.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : BaseApiController
    {
        private readonly IOrdersService _orderService;
        private readonly IAuthorizationService _authorizationService;

        public OrderController(ILogger<OrderController> logger, IMapper mapper,
            IOrdersService orderService, IAuthorizationService authorizationService)
            : base(logger, mapper)
        {
            _orderService = orderService;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        [ProducesResponseType(200, Type = typeof(List<OrderVM>))]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            var orderVMs = _mapper.Map<List<OrderVM>>(orders);
            return Ok(orderVMs);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(200, Type = typeof(OrderVM))]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
                return NotFound(id);

            var orderVM = _mapper.Map<OrderVM>(order);
            return Ok(orderVM);
        }

        [HttpPost]
        [ProducesResponseType(201, Type = typeof(OrderVM))]
        [ProducesResponseType(400)]
        public async Task<IActionResult> CreateOrder([FromBody] OrderVM orderVM)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var order = _mapper.Map<Order>(orderVM);
            var createdOrder = await _orderService.CreateOrderAsync(order);
            var createdOrderVM = _mapper.Map<OrderVM>(createdOrder);
            return CreatedAtAction(nameof(GetOrderById), new { id = createdOrderVM.Id }, createdOrderVM);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderVM orderVM)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var order = _mapper.Map<Order>(orderVM);
            var updatedOrder = await _orderService.UpdateOrderAsync(id, order);
            if (updatedOrder == null)
                return NotFound(id);

            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null)
                return NotFound(id);

            await _orderService.DeleteOrderAsync(id);
            return NoContent();
        }
    }
}
