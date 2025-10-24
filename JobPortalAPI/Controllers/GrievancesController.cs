using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobPortalAPI.Data;
using JobPortalAPI.Models;
using System.IO;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class GrievancesController : ControllerBase
{
    private readonly JobPortalContext _context;
    private readonly IWebHostEnvironment _environment;

    public GrievancesController(JobPortalContext context, IWebHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Grievance>>> GetAll() =>
        await _context.Grievances.ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Grievance>> Get(int id)
    {
        var g = await _context.Grievances.FindAsync(id);
        return g == null ? NotFound() : g;
    }

    [HttpPost]
    public async Task<ActionResult<Grievance>> Create(Grievance g)
    {
        _context.Grievances.Add(g);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = g.GreivanceID }, g);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        // Validate file size (10MB limit)
        if (file.Length > 10 * 1024 * 1024)
        {
            return BadRequest("File size cannot exceed 10MB.");
        }

        // Validate file type
        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest("Invalid file type. Allowed types: PNG, JPG, PDF, DOC, DOCX.");
        }

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "grievances");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file to disk
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Return file information
            return Ok(new
            {
                fileName = file.FileName,
                uniqueFileName = uniqueFileName,
                filePath = $"/uploads/grievances/{uniqueFileName}",
                fileSize = file.Length
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("create-with-attachment")]
    public async Task<ActionResult<Grievance>> CreateWithAttachment([FromForm] GrievanceFormData formData)
    {
        try
        {
            var grievance = new Grievance
            {
                SubmittedBy = formData.SubmittedBy,
                Title = formData.Title,
                Description = formData.Description,
                Priority = formData.Priority,
                Status = "Submitted",
                CreatedDate = DateTime.UtcNow
            };

            // Handle file upload if provided
            if (formData.Attachment != null && formData.Attachment.Length > 0)
            {
                var uploadResult = await UploadFileInternal(formData.Attachment);
                if (uploadResult != null)
                {
                    grievance.AttachmentFileName = formData.Attachment.FileName;
                    grievance.AttachmentFilePath = uploadResult.filePath;
                    grievance.AttachmentFileSize = formData.Attachment.Length;
                }
            }

            _context.Grievances.Add(grievance);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = grievance.GreivanceID }, grievance);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error creating grievance: {ex.Message}");
        }
    }

    private async Task<dynamic?> UploadFileInternal(IFormFile file)
    {
        if (file == null || file.Length == 0) return null;

        // Validate file size (10MB limit)
        if (file.Length > 10 * 1024 * 1024) return null;

        // Validate file type
        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".pdf", ".doc", ".docx" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(fileExtension)) return null;

        try
        {
            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? _environment.ContentRootPath, "uploads", "grievances");
            Directory.CreateDirectory(uploadsFolder);

            // Generate unique filename
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save file to disk
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return new
            {
                fileName = file.FileName,
                uniqueFileName = uniqueFileName,
                filePath = $"/uploads/grievances/{uniqueFileName}",
                fileSize = file.Length
            };
        }
        catch
        {
            return null;
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Grievance g)
    {
        if (id != g.GreivanceID) return BadRequest();
        _context.Entry(g).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var g = await _context.Grievances.FindAsync(id);
        if (g == null) return NotFound();
        _context.Grievances.Remove(g);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

// Helper class for form data with file upload
public class GrievanceFormData
{
    public int SubmittedBy { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public IFormFile? Attachment { get; set; }
}
