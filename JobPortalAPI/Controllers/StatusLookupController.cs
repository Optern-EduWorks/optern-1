using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class StatusLookupController : ControllerBase
{
    private readonly JobPortalContext _context;
    public StatusLookupController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StatusLookup>>> Get() =>
        await _context.StatusLookups.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<StatusLookup>> Get(int id)
    {
        var item = await _context.StatusLookups.FindAsync(id);
        return item == null ? NotFound() : item;
    }
}
