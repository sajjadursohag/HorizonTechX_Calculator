
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function formatResult(value) {
  if (!Number.isFinite(value)) {
    throw new Error("Invalid result");
  }

  // Avoid floating-point precision issues such as 0.1 + 0.2.
  const rounded = Number(value.toPrecision(12));
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

function evaluateExpression(input) {
  if (!input || !/^[0-9+\-*/%.()\s]+$/.test(input)) {
    throw new Error("Invalid expression");
  }

  // Only evaluate a strictly validated arithmetic expression.
  const result = Function(`"use strict"; return (${input});`)();

  if (typeof result !== "number" || !Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  return formatResult(result);
}

function updateDisplay() {
  expressionDisplay.textContent = expression
    ? expression.replace(/\*/g, "×").replace(/\//g, "÷")
    : "0";

  if (!expression) {
    resultDisplay.textContent = "0";
    return;
  }

  try {
    // Show a live result only when the expression is complete.
    const complete = /[0-9)%]$/.test(expression);

    if (!complete) {
      resultDisplay.textContent = "…";
      return;
    }

    resultDisplay.textContent = evaluateExpression(expression);
  } catch {
    resultDisplay.textContent = "…";
  }
}

function appendValue(value) {
  if (justCalculated) {
    if (/[0-9.]/.test(value)) {
      expression = "";
    }
    justCalculated = false;
  }

  const lastNumber = expression.match(/(\d*\.?\d+)$/)?.[0] ?? "";

  if (value === ".") {
    if (lastNumber.includes(".")) return;

    if (!lastNumber) {
      expression += "0";
    }
  }

  const lastChar = expression.slice(-1);

  if (/[+\-*/%]/.test(value) && /[+\-*/%]/.test(lastChar)) {
    // Permit a negative number after an operator.
    if (value === "-" && lastChar !== "-") {
      expression += value;
    } else {
      expression = expression.slice(0, -1) + value;
    }

    updateDisplay();
    return;
  }

  expression += value;
  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function toggleSign() {
  if (!expression) {
    expression = "-";
    updateDisplay();
    return;
  }

  if (justCalculated) {
    expression = `-(${expression})`;
    justCalculated = false;
    updateDisplay();
    return;
  }

  const match = expression.match(/(\d*\.?\d+)$/);

  if (match) {
    const number = match[0];
    const start = match.index;
    const before = expression.slice(0, start);

    // Toggle a unary minus immediately before this number.
    if (before.endsWith("-") &&
        (before.length === 1 || /[+\-*/%(]$/.test(before.slice(0, -1)))) {
      expression = before.slice(0, -1) + number;
    } else {
      expression = before + "-" + number;
    }
  } else if (/[+\-*/%]$/.test(expression)) {
    expression += "-";
  }

  updateDisplay();
}

function calculate() {
  if (!expression) return;

  try {
    const answer = evaluateExpression(expression);
    expression = answer;
    expressionDisplay.textContent = answer;
    resultDisplay.textContent = answer;
    justCalculated = true;
  } catch {
    resultDisplay.textContent = "Error";
    justCalculated = false;
  }
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { action, value } = button.dataset;

  if (action === "clear") clearCalculator();
  else if (action === "delete") deleteLast();
  else if (action === "sign") toggleSign();
  else if (action === "calculate") calculate();
  else if (value !== undefined) appendValue(value);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  } else if (key === "(" || key === ")") {
    appendValue(key);
  }
});

updateDisplay();
