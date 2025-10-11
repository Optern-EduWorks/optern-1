using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateEducationController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateEducationController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateEducation>>> GetEducations() =>
        await _context.CandidateEducations.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateEducation>> GetEducation(int id)
    {
        var edu = await _context.CandidateEducations.FindAsync(id);
        return edu == null ? NotFound() : edu;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateEducation>> CreateEducation(CandidateEducation edu)
    {
        _context.CandidateEducations.Add(edu);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetEducation), new { id = edu.EducationID }, edu);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEducation(int id, CandidateEducation edu)
    {
        if (id != edu.EducationID) return BadRequest();
        _context.Entry(edu).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEducation(int id)
    {
        var edu = await _context.CandidateEducations.FindAsync(id);
        if (edu == null) return NotFound();
        _context.CandidateEducations.Remove(edu);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
