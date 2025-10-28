using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateSkillsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateSkillsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateSkill>>> GetAll() =>
        await _context.CandidateSkills.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateSkill>> Get(int id)
    {
        var skill = await _context.CandidateSkills.FindAsync(id);
        return skill == null ? NotFound() : skill;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateSkill>> Create(CandidateSkill skill)
    {
        _context.CandidateSkills.Add(skill);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = skill.SkillID }, skill);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateSkill skill)
    {
        if (id != skill.SkillID) return BadRequest();
        _context.Entry(skill).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var skill = await _context.CandidateSkills.FindAsync(id);
        if (skill == null) return NotFound();
        _context.CandidateSkills.Remove(skill);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
