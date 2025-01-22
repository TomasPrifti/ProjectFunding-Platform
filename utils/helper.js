export const performValidation = (args) => {
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

	// Check Expiration.
	inputField = document.getElementById('expiration');
	inputField.className = "valid";
	if (!args.expiration || args.expiration < 1) {
		inputField.className = "error";
		validation = false;
	}

	// Check Goal.
	inputField = document.getElementById('goal');
	inputField.className = "valid";
	if (!args.goal || args.goal < 1) {
		inputField.className = "error";
		validation = false;
	}

	// Check Minimum Capital.
	inputField = document.getElementById('min-capital');
	inputField.className = "valid";
	if (!args.minCapital || args.minCapital < 1 || args.minCapital > args.goal) {
		inputField.className = "error";
		validation = false;
	}

	if (!validation) {
		return false;
	}

	// Manipulations.
	args.name = args.name.trim();
	args.description = args.description.trim();
	args.expiration = args.expiration * 24 * 60 * 60; // Conversion in seconds.
	args.goal = args.goal * 10 ** 6; // Conversion in USDT.
	args.minCapital = args.minCapital * 10 ** 6; // Conversion in USDT.

	return true;
}

export const validateField = (event) => {
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
		case "expiration":
			inputValue = parseInt(inputValue);
			target.className = "valid";
			if (!inputValue || inputValue < 1) {
				target.className = "error";
			}
			break;
		case "goal":
			inputValue = parseInt(inputValue);
			target.className = "valid";
			if (!inputValue || inputValue < 1) {
				target.className = "error";
				break;
			}
			const inputMinCapital = document.getElementById('min-capital');
			const inputMinCapitalValue = parseInt(inputMinCapital.value);
			inputMinCapital.className = "valid";
			if (!inputMinCapitalValue || inputMinCapitalValue < 1 || inputMinCapitalValue > inputValue) {
				inputMinCapital.className = "error";
			}
			break;
		case "min-capital":
			inputValue = parseInt(inputValue);
			const inputGoal = document.getElementById('goal');
			target.className = "valid";
			if (!inputValue || inputValue < 1 || !inputGoal.value || inputValue > parseInt(inputGoal.value)) {
				target.className = "error";
			}
			break;
		default:
			break;
	}
};
