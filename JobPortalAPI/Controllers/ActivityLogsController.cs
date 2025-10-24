using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class ActivityLogsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public ActivityLogsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ActivityLog>>> GetAll() =>
        await _context.ActivityLogs.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityLog>> Get(int id)
    {
        var log = await _context.ActivityLogs.FindAsync(id);
        return log == null ? NotFound() : log;
    }

    [HttpPost]
    public async Task<ActionResult<ActivityLog>> Create(ActivityLog log)
    {
        _context.ActivityLogs.Add(log);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = log.ActivityID }, log);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ActivityLog log)
    {
        if (id != log.ActivityID) return BadRequest();
        _context.Entry(log).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _context.ActivityLogs.FindAsync(id);
        if (log == null) return NotFound();
        _context.ActivityLogs.Remove(log);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
