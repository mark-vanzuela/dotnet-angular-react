using CustomerApi.Api.Contracts;
using CustomerApi.Application.Customers;
using CustomerApi.Application.Features.Customers.CreateCustomer;
using CustomerApi.Application.Features.Customers.DeleteCustomer;
using CustomerApi.Application.Features.Customers.GetCustomerById;
using CustomerApi.Application.Features.Customers.GetCustomers;
using CustomerApi.Application.Features.Customers.UpdateCustomer;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CustomerApi.Api.Controllers;

/// <summary>
/// The HTTP entry point. Notice how THIN it is: the controller's only job is to
/// translate HTTP into a MediatR message and translate the result back into an
/// HTTP response. All business logic lives in the Application handlers.
///
/// [ApiController] enables conveniences like automatic model binding and 400s for
/// malformed requests. The route "api/[controller]" becomes "api/customers".
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    // ISender is MediatR's send-a-request interface. The controller does not
    // know which handler will run — MediatR routes each message for us.
    private readonly ISender _sender;

    public CustomersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>GET /api/customers — list all non-deleted customers.</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerDto>>> GetAll(CancellationToken ct)
    {
        var customers = await _sender.Send(new GetCustomersQuery(), ct);
        return Ok(customers);
    }

    /// <summary>GET /api/customers/{id} — one customer.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> GetById(Guid id, CancellationToken ct)
    {
        var customer = await _sender.Send(new GetCustomerByIdQuery(id), ct);
        return Ok(customer);
    }

    /// <summary>POST /api/customers — create.</summary>
    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create([FromBody] CreateCustomerRequest request, CancellationToken ct)
    {
        var command = new CreateCustomerCommand(request.FirstName, request.LastName, request.Email, request.Phone);
        var created = await _sender.Send(command, ct);

        // 201 Created, with a Location header pointing at the new resource.
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>PUT /api/customers/{id} — update.</summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CustomerDto>> Update(Guid id, [FromBody] UpdateCustomerRequest request, CancellationToken ct)
    {
        var command = new UpdateCustomerCommand(id, request.FirstName, request.LastName, request.Email, request.Phone);
        var updated = await _sender.Send(command, ct);
        return Ok(updated);
    }

    /// <summary>DELETE /api/customers/{id} — soft delete.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _sender.Send(new DeleteCustomerCommand(id), ct);

        // 204 No Content is the conventional success response for a delete.
        return NoContent();
    }
}
