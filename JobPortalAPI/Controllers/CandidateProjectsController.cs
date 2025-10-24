using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateProjectsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateProjectsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateProject>>> GetAll() =>
        await _context.CandidateProjects.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateProject>> Get(int id)
    {
        var project = await _context.CandidateProjects.FindAsync(id);
        return project == null ? NotFound() : project;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateProject>> Create(CandidateProject project)
    {
        _context.CandidateProjects.Add(project);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = project.ProjectID }, project);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateProject project)
    {
        if (id != project.ProjectID) return BadRequest();
        _context.Entry(project).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var project = await _context.CandidateProjects.FindAsync(id);
        if (project == null) return NotFound();
        _context.CandidateProjects.Remove(project);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
