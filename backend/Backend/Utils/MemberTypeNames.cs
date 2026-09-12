using ProfkomBackend.Models;

namespace ProfkomBackend.Utils
{
    public static class MemberTypeNames
    {
        public static readonly Dictionary<MemberType, string> Map = new()
        {
            [MemberType.Aparat] = "Член Президії",
            [MemberType.Profburo] = "Голова Профбюро Студентів",
            [MemberType.Viddil] = "Голова Відділу",
        };

        public static string Get(MemberType type) =>
            Map.TryGetValue(type, out var name) ? name : type.ToString();
    }
}
