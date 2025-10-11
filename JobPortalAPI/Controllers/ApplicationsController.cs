using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class ApplicationsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public ApplicationsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Application>>> GetAll() =>
        await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Application>> Get(int id)
    {
        var app = await _context.Applications
            .Include(a => a.Job)
            .Include(a => a.Candidate)
            .FirstOrDefaultAsync(a => a.ApplicationID == id);
        return app == null ? NotFound() : app;
    }

    [HttpPost]
    public async Task<ActionResult<Application>> Create(Application app)
    {
        _context.Applications.Add(app);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = app.ApplicationID }, app);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Application app)
    {
        if (id != app.ApplicationID) return BadRequest();
        _context.Entry(app).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var app = await _context.Applications.FindAsync(id);
        if (app == null) return NotFound();
        _context.Applications.Remove(app);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
