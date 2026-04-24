using MediaMTX_Gui.Server.DTOs;
using MediaMTX_Gui.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MediaMTX_Gui.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        // get all projects for the current user
        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _projectService.GetProjectsForCurrentUserAsync(User);
            return Ok(projects);
        }


        // get specific project by id for the current user
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetProjectById(int id)
        {
            var project = await _projectService.GetProjectByIdForCurrentUserAsync(id, User);

            if (project is null)
            {
                return NotFound();
            }

            return Ok(project);
        }


        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var project = await _projectService.CreateProjectAsync(request, User);
            return CreatedAtAction(nameof(GetProjectById), new { id = project.Id }, project);
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var deleted = await _projectService.DeleteProjectForCurrentUserAsync(id, User);

            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpDelete("{id:int}/leave")]
        public async Task<IActionResult> LeaveProject(int id)
        {
            var left = await _projectService.LeaveProjectAsync(id, User);

            if (!left)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}   
