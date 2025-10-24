using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using Microsoft.AspNetCore.Authorization;

[Route("api/[controller]")]
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
    public async Task<ActionResult<Company>> Create(CompanyCreateDto companyDto)
    {
        // Ensure Industry exists
        var industry = await _context.IndustryLookups.FindAsync(companyDto.IndustryID);
        if (industry == null)
        {
            return BadRequest("Invalid IndustryID");
        }

        var company = new Company
        {
            Name = companyDto.Name,
            Website = companyDto.Website,
            Size = companyDto.Size,
            Address = companyDto.Address,
            Phone = companyDto.Phone,
            CreatedDate = companyDto.CreatedDate,
            IndustryID = companyDto.IndustryID
        };

        _context.Companies.Add(company);
        await _context.SaveChangesAsync();

        // Load the company with Industry for response
        var createdCompany = await _context.Companies
            .Include(c => c.Industry)
            .FirstOrDefaultAsync(c => c.CompanyID == company.CompanyID);

        return CreatedAtAction(nameof(Get), new { id = company.CompanyID }, createdCompany);
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] CompanyUpdateDto companyDto)
    {
        Console.WriteLine($"CompaniesController - Update called for ID: {id}");
        Console.WriteLine($"Request path: {HttpContext.Request.Path}");
        Console.WriteLine($"Request method: {HttpContext.Request.Method}");
        Console.WriteLine($"Request headers: {string.Join(", ", HttpContext.Request.Headers.Select(h => $"{h.Key}={h.Value}").ToList())}");
        Console.WriteLine($"Incoming company data: CompanyID={companyDto?.CompanyID}, Name={companyDto?.Name}, Website={companyDto?.Website}, Size={companyDto?.Size}, Address={companyDto?.Address}, Phone={companyDto?.Phone}");

        if (id != companyDto.CompanyID) return BadRequest();

        var existingCompany = await _context.Companies.FindAsync(id);
        if (existingCompany == null)
        {
            return NotFound(new { message = "Company not found" });
        }

        // Verify the recruiter belongs to this company
        var emailClaim = User.FindFirst("Email");
        if (emailClaim == null)
        {
            return Unauthorized(new { message = "Invalid authentication token" });
        }

        var recruiter = await _context.Recruiters.FirstOrDefaultAsync(r => r.Email == emailClaim.Value);
        if (recruiter == null || recruiter.CompanyID != id)
        {
            return Forbid();
        }

        // Update only the fields that are provided and exist in the model
        existingCompany.Name = companyDto.Name ?? existingCompany.Name;
        existingCompany.Website = companyDto.Website ?? existingCompany.Website;
        existingCompany.Size = companyDto.Size ?? existingCompany.Size;
        existingCompany.Address = companyDto.Address ?? existingCompany.Address;
        existingCompany.Phone = companyDto.Phone ?? existingCompany.Phone;
        // Note: CreatedDate and IndustryID should not be updated

        await _context.SaveChangesAsync();
        return Ok(existingCompany);
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
