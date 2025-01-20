'use client'

import { contractAddresses, abi } from '@/constants/index';

const NewProject = () => {

	const createProject = () => {
		return;
	}

	return (
		<div className="new-project">
			<h1>Create Your New Project</h1>

			<div className="fields">
				<div className="field field-name">
					<label htmlFor="name">Name</label>
					<input type="text" id="name" name="name" />
				</div>

				<div className="field field-description">
					<label htmlFor="description">Description</label>
					<textarea id="description" name="description" rows="3" cols="35" />
				</div>

				<div className="field field-expiration">
					<label htmlFor="expiration">Expiration Time(specify days)</label>
					<input type="number" id="expiration" name="expiration" step="1" min="1" />
				</div>

				<div className="field field-goal">
					<label htmlFor="goal">Goal (specify USDT)</label>
					<input type="number" id="goal" name="goal" step="1" min="1" />
				</div>

				<div className="field field-min-capital">
					<label htmlFor="min-capital">Minimum Capital to Invest(specify USDT)</label>
					<input type="number" id="min-capital" name="min-capital" step="1" min="1" />
				</div>
			</div>

			<button onClick={createProject}>Create Project</button>
		</div>
	);
}

export default NewProject;
