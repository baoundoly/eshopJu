using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;
    public RolesController(IRoleService roleService) => _roleService = roleService;

    [HttpGet]
    public async Task<IActionResult> GetRoles() => Ok(await _roleService.GetRolesAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetRole(int id)
    {
        var role = await _roleService.GetRoleByIdAsync(id);
        return role == null ? NotFound() : Ok(role);
    }

    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions() => Ok(await _roleService.GetPermissionsAsync());

    [HttpPost]
    [Authorize(Policy = "ManageRoles")]
    public async Task<IActionResult> CreateRole([FromBody] CreateRoleDto dto)
    {
        var role = await _roleService.CreateRoleAsync(dto);
        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, role);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "ManageRoles")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        var role = await _roleService.UpdateRoleAsync(id, dto);
        return role == null ? NotFound() : Ok(role);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "ManageRoles")]
    public async Task<IActionResult> DeleteRole(int id)
    {
        var deleted = await _roleService.DeleteRoleAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
