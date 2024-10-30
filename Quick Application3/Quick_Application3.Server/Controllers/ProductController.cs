using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.JsonPatch;
using Quick_Application3.Core.Models.Shop;
using Quick_Application3.Core.Services.Shop;
using Quick_Application3.Server.Authorization;
using Quick_Application3.Server.Controllers;
using Quick_Application3.Server.ViewModels.Shop;
using System.Data;

namespace Quick_Application3.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : BaseApiController
    {
        private readonly IProductService _productService;
        private readonly IAuthorizationService _authorizationService;

        public ProductController(ILogger<ProductController> logger, IMapper mapper,
            IProductService productService, IAuthorizationService authorizationService): base(logger, mapper)
        {
            _productService = productService;
            _authorizationService = authorizationService;
        }

        [HttpGet]
        [ProducesResponseType(200, Type = typeof(List<ProductVM>))]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productService.GetAllProductsAsync();
            var productVMs = _mapper.Map<List<ProductVM>>(products);
            return Ok(productVMs);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(200, Type = typeof(ProductVM))]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(id);

            var productVM = _mapper.Map<ProductVM>(product);
            return Ok(productVM);
        }


    }
    
}
