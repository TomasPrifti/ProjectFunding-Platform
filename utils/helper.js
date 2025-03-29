export const performValidationNewProject = (args) => {
	let inputField;
	let validation = true;

	// Check Name.
	inputField = document.getElementById('name');
	if (!args.name || args.name.trim().length === 0) {
		inputField.className = "error";
		validation = false;
	} else {
		inputField.className = "valid";
		inputField.value = args.name;
	}

	// Check Description.
	inputField = document.getElementById('description');
	inputField.className = "valid";
	if (!args.description || args.description.trim().length === 0) {
		inputField.className = "error";
		validation = false;
	}

	// Check Minimum Capital.
	inputField = document.getElementById('min-capital');
	inputField.className = "valid";
	if (!args.minCapital || args.minCapital < 1) {
		inputField.className = "error";
		validation = false;
	}

	if (!validation) {
		return false;
	}

	// Manipulations.
	args.name = args.name.trim();
	args.description = args.description.trim();
	args.minCapital = args.minCapital * 10 ** 6; // Conversion in USDT.

	return true;
}

export const performValidationCreateTransaction = (args) => {
	let inputField;
	let validation = true;

	// Check Destination.
	inputField = document.getElementById('destination');
	inputField.className = "valid";
	if (!args.destination || args.destination.trim().length === 0 || args.destination.trim().length !== 42 || args.destination.charAt(0) !== "0" || args.destination.charAt(1) !== "x") {
		inputField.className = "error";
		validation = false;
	}

	// Check Amount.
	inputField = document.getElementById('amount');
	inputField.className = "valid";
	if (!args.amount || args.amount < 1 || !args.capitalAvailable) {
		inputField.className = "error";
		validation = false;
	}
	const capitalAvailable = parseInt(args.capitalAvailable) / 10 ** 6;
	if (args.amount > capitalAvailable) {
		inputField.className = "error";
		validation = false;
	}

	if (!validation) {
		return false;
	}

	// Manipulations.
	args.destination = args.destination.trim();
	args.amount = args.amount * 10 ** 6; // Conversion in USDT.

	return true;
}

export const validateField = (event, data = "") => {
	const target = event.target;
	const inputID = target.id;
	let inputValue = target.value;
	target.className = "error";

	switch (inputID) {
		case "name":
		case "description":
			target.className = "valid";
			if (!inputValue || inputValue.trim().length === 0) {
				target.className = "error";
			}
			break;
		case "destination":
			target.className = "valid";
			if (!inputValue || inputValue.trim().length === 0 || inputValue.trim().length !== 42 || inputValue.charAt(0) !== "0" || inputValue.charAt(1) !== "x") {
				target.className = "error";
			}
			break;
		case "min-capital":
			inputValue = parseInt(inputValue);
			target.className = "valid";
			if (!inputValue || inputValue < 1) {
				target.className = "error";
			}
			break;
		case "amount":
			inputValue = parseInt(inputValue);
			target.className = "valid";
			const capitalAvailable = parseInt(data) / 10 ** 6;
			if (!inputValue || inputValue < 1 || inputValue > capitalAvailable) {
				target.className = "error";
			}
			break;
		default:
			break;
	}
};

export const resetClasses = () => {
	const inputNode = [
		'name',
		'description',
		'min-capital',
		'destination',
		'amount',
	];

	inputNode.forEach(element => {
		const node = document.getElementById(element);
		if (node) {
			node.className = "";
		}
	});
}
