using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class GreivancesController : ControllerBase
{
    private readonly JobPortalContext _context;
    public GreivancesController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Greivance>>> GetAll() =>
        await _context.Greivances.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Greivance>> Get(int id)
    {
        var g = await _context.Greivances.FindAsync(id);
        return g == null ? NotFound() : g;
    }

    [HttpPost]
    public async Task<ActionResult<Greivance>> Create(Greivance g)
    {
        _context.Greivances.Add(g);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = g.GreivanceID }, g);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Greivance g)
    {
        if (id != g.GreivanceID) return BadRequest();
        _context.Entry(g).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var g = await _context.Greivances.FindAsync(id);
        if (g == null) return NotFound();
        _context.Greivances.Remove(g);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
