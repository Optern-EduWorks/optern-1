using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CompaniesController : ControllerBase
{
    private readonly JobPortalContext _context;
    public CompaniesController(JobPortalContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Company>>> GetAll() =>
        await _context.Companies.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Company>> Get(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        return company == null ? NotFound() : company;
    }

    [HttpPost]
    public async Task<ActionResult<Company>> Create(Company company)
    {
        _context.Companies.Add(company);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = company.CompanyID }, company);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Company company)
    {
        if (id != company.CompanyID) return BadRequest();
        _context.Entry(company).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var company = await _context.Companies.FindAsync(id);
        if (company == null) return NotFound();
        _context.Companies.Remove(company);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
