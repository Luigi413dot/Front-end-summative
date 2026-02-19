def calculator():
    print("=== Simple Python Calculator (Milestone 4) ===")
    try:
        num1 = float(input("Enter first number: "))
        op = input("Enter operator (+, -, *, /): ").strip()
        num2 = float(input("Enter second number: "))

        if op == '+':
            print(f"Result: {num1 + num2}")
        elif op == '-':
            print(f"Result: {num1 - num2}")
        elif op == '*':
            print(f"Result: {num1 * num2}")
        elif op == '/':
            if num2 == 0:
                print("Error: Division by zero.")
            else:
                print(f"Result: {num1 / num2}")
        else:
            print("Invalid operator.")
    except ValueError:
        print("Invalid input. Please enter numbers.")

if __name__ == "__main__":
    calculator()
