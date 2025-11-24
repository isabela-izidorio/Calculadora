
const btns = document.querySelectorAll('.btn'); /* Devolve array com todos os elementos com classe .btn */
const display_input = document.querySelector('.display .input');
const display_output = document.querySelector('.display .output');

let input = ""; /* string que altera a expressão a depender do input dado pelo usuário e retorna o novo valor para (display_input) */

for (let btn of btns) {
	const value = btn.dataset.key; /* pega o valor data-key do botão selecionado */

	btn.addEventListener('click', () => {
		if (value == "clear") {
			input = "";
			display_input.innerHTML = "";
			display_output.innerHTML = "";
		} else if (value == "backspace") {
			input = input.slice(0, -1);
			display_input.innerHTML = CleanInput(input);
		} else if (value == "=") {
			let result = eval(PerpareInput(input));

			display_output.innerHTML = CleanOutput(result);
		} else if (value == "brackets") {
			let last_input = input.slice(-1);
			let operators = ["+", "-", "*", "/"];

			if (
				input.indexOf("(") == -1 ||
				(input.indexOf("(") !== -1 && input.indexOf(")") !== -1 && input.lastIndexOf("(") < input.lastIndexOf(")"))
			) {
				input += "(";
			} else if (
				(input.indexOf("(") !== -1 && input.indexOf(")") === -1) ||
				(input.indexOf("(") !== -1 && input.indexOf(")") !== -1 && input.lastIndexOf("(") > input.lastIndexOf(")"))
			) {
				// Só fecha parênteses se o último caractere NÃO for um operador e NÃO for "("
				if (!operators.includes(last_input) && last_input !== "(") {
					input += ")";
				}
			}
			display_input.innerHTML = CleanInput(input);
		} else {
			if (ValidateInput(value)) {
				const last_input = input.slice(-1);
				const operators = ["+", "-", "*", "/"];

				// Impede operadores logo após "("
				if (operators.includes(value) && last_input === "(") {
					return;
				}

				input += value;
				display_input.innerHTML = CleanInput(input);
			}
		}


	})
}

function CleanInput(input) {
	let input_array = input.split("");  /* tranforma string em array */
	let input_array_length = input_array.length;

	for (let i = 0; i < input_array_length; i++) { /* percorre o array e substitui o digito por um span pra trocar a cor*/
		if (input_array[i] == "*") {
			input_array[i] = ` <span class="operator">x</span> `;
		} else if (input_array[i] == "/") {
			input_array[i] = ` <span class="operator">÷</span> `;
		} else if (input_array[i] == "+") {
			input_array[i] = ` <span class="operator">+</span> `;
		} else if (input_array[i] == "-") {
			input_array[i] = ` <span class="operator">-</span> `;
		} else if (input_array[i] == "(") {
			input_array[i] = `<span class="brackets">(</span>`;
		} else if (input_array[i] == ")") {
			input_array[i] = `<span class="brackets">)</span>`;
		} else if (input_array[i] == "%") {
			input_array[i] = `<span class="percent">%</span>`;
		}
	}

	return input_array.join("");
}

function CleanOutput(output) {
	let output_string = output.toString();/* assegura que a variável é string mesmo que só tenha números*/
	let decimal = output_string.split(".")[1];  /* retorna só a posição 1 da string após o split - parte decimal */
	output_string = output_string.split(".")[0]; /* retorna só a posição 0 da string após o split - parte inteira */
	let output_array = output_string.split("");

	/* pontua o numero a depender se ele é positivo ou negativo */
	if (output_string.length <= 11) {
		if (output_array.length > 3) {
			if (parseFloat(output) > 0) {
				for (let i = output_array.length - 3; i > 0; i -= 3) { /* insere a ponto "." de frente pra trás -> array= 1234567; array.length - 3 = 7-3  = 4 -> posição do i */
					output_array.splice(i, 0, ".");
				}
			} else {
				output_array = output_array.slice(1);
				for (let i = output_array.length - 3; i > 0; i -= 3) {
					output_array.splice(i, 0, ".");
				}
				output_array.unshift("-");
			}
		}

		if (decimal) {
			output_array.push(",");
			output_array.push(decimal);
		}

		let final_output = output_array.join("");

		// Se ultrapassar 14 caracteres, converte para notação científica
		if (final_output.length > 14) {
			return FormatScientific(output);
		}

		return final_output;
	}

	return FormatScientific(output);
}

function FormatScientific(value) {
	let exp = value.toExponential(); // ex: "1.23456789e+10"

	if (exp.length <= 14) return exp;

	// Tenta reduzir casas decimais até caber
	for (let i = 7; i >= 0; i--) {
		let shortExp = value.toExponential(i);
		if (shortExp.length <= 14) {
			return shortExp;
		}
	}

	return value.toExponential(0).slice(0, 14);
}

function ValidateInput(value) {
	let last_input = input.slice(-1);
	let operators = ["+", "-", "*", "/"];

	// Impede operadores e % como primeiro caractere
	if (input.length === 0 && (operators.includes(value) || value === "%" || value === ")")) {
		return false;
	}

	// Impede ponto duplo
	if (value === "." && last_input === ".") {
		return false;
	}

	// Impede operadores duplicados
	if (operators.includes(value)) {
		if (operators.includes(last_input)) {
			return false;
		} else {
			return true;
		}
	}

	// Impede % após operador, parêntese ou outro %
	if (
		value === "%" &&
		(operators.includes(last_input) ||
			last_input === "(" ||
			last_input === ")" ||
			last_input === "%")
	) {
		return false;
	}

	// Impede fechar parênteses logo após abrir
	if (value === ")" && last_input === "(") {
		return false;
	}

	return true;
}


function PerpareInput(input) {
	// Substitui a multiplicação entre números e parênteses
	let preparedInput = input.replace(/([0-9)])\(/g, '$1*('); // Adiciona '*' entre números e '('
	preparedInput = preparedInput.replace(/\)([0-9])/g, ')*$1'); // Adiciona '*' entre ')' e números

	// Substitui % por (/100)
	preparedInput = preparedInput.replace(/(\d+(\.\d+)?)%/g, '($1 / 100)');

	return preparedInput;
}

