using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models; 

[Route("api/[controller]")]
[ApiController]
public class JobsController : ControllerBase
{
    private readonly JobPortalContext _context;

    public JobsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetAll() =>
        await _context.Jobs.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Job>> Get(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        return job == null ? NotFound() : job;
    }

    [HttpPost]
    public async Task<ActionResult<Job>> Create(Job job)
    {
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = job.JobID }, job);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Job job)
    {
        if (id != job.JobID) return BadRequest();

        _context.Entry(job).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var job = await _context.Jobs.FindAsync(id);
        if (job == null) return NotFound();

        _context.Jobs.Remove(job);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
