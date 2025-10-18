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

    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<CandidateProfile>> GetByUserId(int userId)
    {
        try
        {
            Console.WriteLine($"Getting profile for user ID: {userId}");
            var profile = await _context.CandidateProfiles
                .FirstOrDefaultAsync(p => p.CandidateID == userId);

            if (profile == null)
            {
                Console.WriteLine($"No profile found for user ID: {userId}");
                return NotFound();
            }

            Console.WriteLine($"Found profile: {profile.FullName} (ID: {profile.CandidateID})");
            return profile;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error getting profile for user {userId}: {ex.Message}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<CandidateProfile>> Create(CandidateProfile profile)
    {
        try
        {
            Console.WriteLine($"Creating profile for CandidateID: {profile.CandidateID}");
            Console.WriteLine($"Profile data: {profile.FullName}, {profile.Email}");

            _context.CandidateProfiles.Add(profile);
            await _context.SaveChangesAsync();

            Console.WriteLine($"Profile created successfully with ID: {profile.CandidateID}");
            return CreatedAtAction(nameof(Get), new { id = profile.CandidateID }, profile);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating profile: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, CandidateProfile profile)
    {
        try
        {
            Console.WriteLine($"Updating profile with ID: {id}");
            Console.WriteLine($"Profile data: {profile.FullName}, {profile.Email}");

            if (id != profile.CandidateID)
            {
                Console.WriteLine($"ID mismatch: URL id {id} != profile id {profile.CandidateID}");
                return BadRequest();
            }

            _context.Entry(profile).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            Console.WriteLine($"Profile updated successfully for ID: {id}");
            return NoContent();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating profile {id}: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
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
