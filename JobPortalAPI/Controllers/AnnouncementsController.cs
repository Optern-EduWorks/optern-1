using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class AnnouncementsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public AnnouncementsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Announcement>>> GetAll() =>
        await _context.Announcements.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Announcement>> Get(int id)
    {
        var ann = await _context.Announcements.FindAsync(id);
        return ann == null ? NotFound() : ann;
    }

    [HttpPost]
    public async Task<ActionResult<Announcement>> Create(Announcement ann)
    {
        _context.Announcements.Add(ann);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = ann.AnnouncementID }, ann);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Announcement ann)
    {
        if (id != ann.AnnouncementID) return BadRequest();
        _context.Entry(ann).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ann = await _context.Announcements.FindAsync(id);
        if (ann == null) return NotFound();
        _context.Announcements.Remove(ann);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
