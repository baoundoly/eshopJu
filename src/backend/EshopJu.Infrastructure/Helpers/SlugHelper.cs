using System.Text;
using System.Text.RegularExpressions;

namespace EshopJu.Infrastructure.Helpers;

public static partial class SlugHelper
{
    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleHyphensRegex();

    [GeneratedRegex(@"[^a-z0-9\-]")]
    private static partial Regex NonSlugCharRegex();

    /// <summary>
    /// Converts a string to a URL-safe slug (lowercase, hyphens, alphanumeric only).
    /// </summary>
    public static string GenerateSlug(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        // Normalize unicode (e.g. accented chars → base char)
        var normalized = value.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
        {
            var category = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != System.Globalization.UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }

        var slug = sb.ToString()
            .Normalize(NormalizationForm.FormC)
            .ToLowerInvariant();

        // Replace common separators and symbols with a hyphen
        slug = slug
            .Replace("&", "-and-")
            .Replace("@", "-at-")
            .Replace(" ", "-")
            .Replace("_", "-")
            .Replace("/", "-")
            .Replace("\\", "-");

        // Remove all remaining non-alphanumeric chars (except hyphens)
        slug = NonSlugCharRegex().Replace(slug, string.Empty);

        // Collapse multiple consecutive hyphens
        slug = MultipleHyphensRegex().Replace(slug, "-");

        return slug.Trim('-');
    }
}
