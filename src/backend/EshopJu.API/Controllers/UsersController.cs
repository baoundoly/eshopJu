using EshopJu.Application.DTOs;
using EshopJu.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EshopJu.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IUserManagementService _userService;
    public UsersController(IUserManagementService userService) => _userService = userService;

    [HttpGet]
    [Authorize(Policy = "ManageCustomer")]
    public async Task<IActionResult> GetUsers() => Ok(await _userService.GetUsersAsync());

    [HttpGet("{id:int}")]
    [Authorize(Policy = "ManageCustomer")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = "ManageCustomer")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userService.UpdateUserAsync(id, dto);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpPut("{id:int}/roles")]
    [Authorize(Policy = "ManageRoles")]
    public async Task<IActionResult> AssignRoles(int id, [FromBody] AssignRolesDto dto)
    {
        var user = await _userService.AssignRolesAsync(id, dto);
        return user == null ? NotFound() : Ok(user);
    }

    [HttpGet("{id:int}/permissions")]
    [Authorize(Policy = "ManageCustomer")]
    public async Task<IActionResult> GetUserPermissions(int id) =>
        Ok(await _userService.GetUserPermissionsAsync(id));
}
