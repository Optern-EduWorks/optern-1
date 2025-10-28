using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class JobTypeLookupController : ControllerBase
{
    private readonly JobPortalContext _context;
    public JobTypeLookupController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobTypeLookup>>> Get() =>
        await _context.JobTypeLookups.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<JobTypeLookup>> Get(int id)
    {
        var item = await _context.JobTypeLookups.FindAsync(id);
        return item == null ? NotFound() : item;
    }
}
