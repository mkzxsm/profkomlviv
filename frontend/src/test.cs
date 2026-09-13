using System;
using System.Text.RegularExpressions;

class Program
{
    static void Main()
    {
        string pattern = @"^[^\s@]+@[^\s@]+\.[^\s@]+$";
        Console.WriteLine(Regex.IsMatch("admin@gmail", pattern));
    }
}
