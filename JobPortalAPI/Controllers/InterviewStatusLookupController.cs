using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class InterviewStatusLookupController : ControllerBase
{
    private readonly JobPortalContext _context;
    public InterviewStatusLookupController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InterviewStatusLookup>>> Get() =>
        await _context.InterviewStatusLookups.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<InterviewStatusLookup>> Get(int id)
    {
        var item = await _context.InterviewStatusLookups.FindAsync(id);
        return item == null ? NotFound() : item;
    }
}
