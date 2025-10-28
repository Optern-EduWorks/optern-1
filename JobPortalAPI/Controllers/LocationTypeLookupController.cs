using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class LocationTypeLookupController : ControllerBase
{
    private readonly JobPortalContext _context;
    public LocationTypeLookupController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LocationTypeLookup>>> Get() =>
        await _context.LocationTypeLookups.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<LocationTypeLookup>> Get(int id)
    {
        var item = await _context.LocationTypeLookups.FindAsync(id);
        return item == null ? NotFound() : item;
    }
}
