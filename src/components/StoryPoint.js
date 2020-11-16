import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import firebase from 'firebase/app';

export default function StoryPoint({ story, user }) {
	const [option, setOption] = useState('1');
	const [isSubmited, setSubmited] = useState(false);

	function handleSubmit(e) {
		e.preventDefault();
		setSubmited(true);
		let em = user.email.replaceAll('.', ',');
		firebase
			.firestore()
			.collection('stories')
			.doc(story.id)
			.update({
				[`users.${em}`]: option,
			});
		console.log('selected story point: ' + option);
	}

	return isSubmited ? (
		''
	) : (
		<div>
			<form
				onSubmit={handleSubmit}
				style={{
					listStyleType: 'none',
					display: 'flex',
					flexDirection: 'row',
				}}
			>
				<strong>Select Story Point:</strong>

				<ul
					style={{
						listStyleType: 'none',
						display: 'flex',
						flexDirection: 'row',
						paddingLeft: '10px',
					}}
				>
					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="1"
								checked={option === '1'}
								onChange={() => setOption('1')}
							/>
							<span>1</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="2"
								checked={option === '2'}
								onChange={() => setOption('2')}
							/>
							<span>2</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="3"
								checked={option === '3'}
								onChange={() => setOption('3')}
							/>
							<span>3</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="5"
								checked={option === '5'}
								onChange={() => setOption('5')}
							/>
							<span>5</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="8"
								checked={option === '8'}
								onChange={() => setOption('8')}
							/>
							<span>8</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="13"
								checked={option === '13'}
								onChange={() => setOption('13')}
							/>
							<span>13</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="21"
								checked={option === '21'}
								onChange={() => setOption('21')}
							/>
							<span>21</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="no_idea"
								checked={option === 'no_idea'}
								onChange={() => setOption('no_idea')}
							/>
							<span>no_idea</span>
						</label>
					</li>

					<li style={{ marginRight: '15px' }}>
						<label>
							<input
								type="radio"
								value="resign"
								checked={option === 'resign'}
								onChange={() => setOption('resign')}
							/>
							<span>resign</span>
						</label>
					</li>
				</ul>

				<Button className="w-10" type="submit">
					Submit
				</Button>
			</form>
		</div>
	);
}
