using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateProfilesController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateProfilesController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateProfile>>> GetAll() =>
        await _context.CandidateProfiles.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateProfile>> Get(int id)
    {
        var profile = await _context.CandidateProfiles.FindAsync(id);
        return profile == null ? NotFound() : profile;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateProfile>> Create(CandidateProfile profile)
    {
        _context.CandidateProfiles.Add(profile);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = profile.CandidateID }, profile);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateProfile profile)
    {
        if (id != profile.CandidateID) return BadRequest();
        _context.Entry(profile).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var profile = await _context.CandidateProfiles.FindAsync(id);
        if (profile == null) return NotFound();
        _context.CandidateProfiles.Remove(profile);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
