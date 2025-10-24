using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateExperienceController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateExperienceController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateExperience>>> GetAll() =>
        await _context.CandidateExperiences.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateExperience>> Get(int id)
    {
        var exp = await _context.CandidateExperiences.FindAsync(id);
        return exp == null ? NotFound() : exp;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateExperience>> Create(CandidateExperience exp)
    {
        _context.CandidateExperiences.Add(exp);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = exp.ExperienceID }, exp);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateExperience exp)
    {
        if (id != exp.ExperienceID) return BadRequest();
        _context.Entry(exp).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var exp = await _context.CandidateExperiences.FindAsync(id);
        if (exp == null) return NotFound();
        _context.CandidateExperiences.Remove(exp);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
