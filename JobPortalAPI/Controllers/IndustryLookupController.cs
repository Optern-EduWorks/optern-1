using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class IndustryLookupController : ControllerBase
{
    private readonly JobPortalContext _context;
    public IndustryLookupController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IndustryLookup>>> Get() =>
        await _context.IndustryLookups.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<IndustryLookup>> Get(int id)
    {
        var item = await _context.IndustryLookups.FindAsync(id);
        return item == null ? NotFound() : item;
    }

    [HttpPost]
    public async Task<ActionResult<IndustryLookup>> Create(IndustryLookup industryLookup)
    {
        _context.IndustryLookups.Add(industryLookup);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = industryLookup.IndustryID }, industryLookup);
    }
}
