using System.Data;

namespace notace
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("zdravim! jakym zpusobem chcete pocitat? pre/post/konec");
            string fce = Console.ReadLine();
            Console.WriteLine("prosim napiste priklad");
            while (fce != "konec")
            {
                string[] priklad = Console.ReadLine().Split(" ");
                if (fce == "pre")
                {Console.WriteLine(PrefixCount(priklad));}
                else if (fce == "post")
                { Console.WriteLine(PostfixCount(priklad));}
                Console.WriteLine(" jakym zpusobem chcete dale pocitat? pre/post/konec");
                fce = Console.ReadLine();
                Console.WriteLine("prosim napiste priklad");
            }

        }

        static double PostfixCount(string[] opers)
        {
            Stack<double> stack = new Stack<double>();
            foreach (string op in opers)
            {
                if (stack.Count >= 2)
                {
                    if (op == "+")
                    {
                        double cislo1 = stack.Pop();
                        double cislo2 = stack.Pop();
                        stack.Push(cislo1 + cislo2);
                    }
                    else if (op == "-")
                    {
                        double cislo1 = stack.Pop();
                        double cislo2 = stack.Pop();
                        stack.Push(cislo2 - cislo1);
                    }
                    else if (op == "*")
                    {
                        double cislo1 = stack.Pop();
                        double cislo2 = stack.Pop();
                        stack.Push(cislo2 * cislo1);
                    }
                    else if (op == "/")
                    {
                        double cislo1 = stack.Pop();
                        double cislo2 = stack.Pop();
                        if(cislo1 == 0)
                            throw new Exception("deleni nulou neni definovano!"); 
                        else
                            stack.Push(cislo2 / cislo1);
                    }
                    else
                    {
                        if (double.TryParse(op, out double cislo))
                            stack.Push(cislo);
                        else
                            throw new Exception("hej! to nepatri v normalnim prikladu >:(");
                    }
                }
                else
                {
                    if (op == "*" || op == "/" || op == "+" || op == "-")
                         throw new Exception("špatný vstup: máte příliš hodně operátorů/je to spatne poskladane"); 
                    else
                    {
                        if (double.TryParse(op, out double cislo))
                            stack.Push(cislo);
                        else
                            throw new Exception("hej! to nepatri v normalnim prikladu >:(");
                    }
                }
            }

            if (stack.Count == 1)
            { return stack.Pop(); }
            else { throw new Exception("neco tady nevychazi.."); }
        }

        // UDELATTTTTT PREFIX !!!! DOCELA JINA LOGIKA
        static double PrefixCount(string[] opers)
        {
            Stack<string> stack = new Stack<string>();
            string[] operators = ["+", "-", "*", "/"];
            foreach (string op in opers)
            {
                if (operators.Contains(op))
                { stack.Push(op); }
                else if (!double.TryParse(stack.Peek(), out double cislo))
                { stack.Push(op); }
                else
                {
                    stack.Pop(); // cislo
                    string operatorHeh = stack.Pop();
                    double opCislo = Convert.ToDouble(op);

                    if (operatorHeh == "+")
                    { 
                        double vysledek = (cislo + opCislo); 
                        stack.Push(vysledek.ToString());
                    }
                    else if (operatorHeh == "-")
                    {
                        double vysledek = (cislo - opCislo);
                        stack.Push(vysledek.ToString());
                    }
                    else if (operatorHeh == "*")
                    {
                        double vysledek = (cislo * opCislo);
                        stack.Push(vysledek.ToString());
                    }
                    else if (operatorHeh == "/")
                    {
                        if (opCislo == 0)
                            throw new Exception("deleni nulou neni definovano!");
                        else
                        {
                            double vysledek = (cislo / opCislo);
                            stack.Push(vysledek.ToString());
                        }
                    }
                    else
                        throw new Exception("hej! to nepatri v normalnim prikladu >:(");
                }
            }

            if (stack.Count == 1)
            { return Convert.ToDouble(stack.Pop()); }
            else { throw new Exception("neco tady nevychazi.."); }
        }
    }
}
