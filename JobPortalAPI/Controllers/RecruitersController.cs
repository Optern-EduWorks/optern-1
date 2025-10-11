using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class RecruitersController : ControllerBase
{
    private readonly JobPortalContext _context;
    public RecruitersController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Recruiter>>> GetAll() =>
        await _context.Recruiters.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Recruiter>> Get(int id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);
        return recruiter == null ? NotFound() : recruiter;
    }

    [HttpPost]
    public async Task<ActionResult<Recruiter>> Create(Recruiter recruiter)
    {
        _context.Recruiters.Add(recruiter);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = recruiter.RecruiterID }, recruiter);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Recruiter recruiter)
    {
        if (id != recruiter.RecruiterID) return BadRequest();
        _context.Entry(recruiter).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var recruiter = await _context.Recruiters.FindAsync(id);
        if (recruiter == null) return NotFound();
        _context.Recruiters.Remove(recruiter);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
