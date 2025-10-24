using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CandidateCertificationsController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CandidateCertificationsController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CandidateCertification>>> GetAll() =>
        await _context.CandidateCertifications.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateCertification>> Get(int id)
    {
        var cert = await _context.CandidateCertifications.FindAsync(id);
        return cert == null ? NotFound() : cert;
    }

    [HttpPost]
    public async Task<ActionResult<CandidateCertification>> Create(CandidateCertification cert)
    {
        _context.CandidateCertifications.Add(cert);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = cert.CandidateCertificationID }, cert);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateCertification cert)
    {
        if (id != cert.CandidateCertificationID) return BadRequest();
        _context.Entry(cert).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cert = await _context.CandidateCertifications.FindAsync(id);
        if (cert == null) return NotFound();
        _context.CandidateCertifications.Remove(cert);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
