using Microsoft.AspNetCore.Authentication;
using System.Text.Json;

namespace MDC.Api.Services.Authentication
{
    /// <summary>
    /// Provides functionality to transform a <see cref="ClaimsPrincipal"/> by adding role claims based on the
    /// "realm_access" claim in the principal's identity.
    /// </summary>
    /// <remarks>This class parses the "realm_access" claim, which is expected to contain a JSON object with a
    /// "roles" property. Any roles found in the "roles" array are added as claims to the principal's identity using the
    /// identity's <see cref="ClaimsIdentity.RoleClaimType"/>.</remarks>
    public sealed class KeycloakRoles : IClaimsTransformation
    {
        /// <summary>
        /// Transforms the specified <see cref="ClaimsPrincipal"/> by adding role claims based on the "realm_access"
        /// claim.
        /// </summary>
        /// <remarks>If the "realm_access" claim is present and contains a "roles" property, each role is
        /// added as a claim to the <see cref="ClaimsIdentity"/> of the provided <see cref="ClaimsPrincipal"/>. The
        /// roles are added using the <see cref="ClaimsIdentity.RoleClaimType"/>.</remarks>
        /// <param name="p">The <see cref="ClaimsPrincipal"/> to transform. Must not be <c>null</c>.</param>
        /// <returns>A <see cref="Task{TResult}"/> representing the asynchronous operation. The result is the transformed <see
        /// cref="ClaimsPrincipal"/>.</returns>
        public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal p)
        {
            var id = (ClaimsIdentity)p.Identity!;
            var realm = p.FindFirst("realm_access")?.Value;
            if (!string.IsNullOrEmpty(realm))
            {
                var doc = JsonDocument.Parse(realm);
                if (doc.RootElement.TryGetProperty("roles", out var roles))
                    foreach (var r in roles.EnumerateArray())
                        id.AddClaim(new Claim(id.RoleClaimType, r.GetString()!));
            }
            return Task.FromResult(p);
        }
    }
}
