import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import firebase from 'firebase/app';

export default function Story() {
	const [stories, setStories] = useState([]);
	const [isOneActive, setActive] = useState(false);
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		if (stories.length === 0) {
			initStories();
		}
		findActiveStory();
	}, [stories, isOneActive, activeId]);

	async function findActiveStory() {
		try {
			const snapshot = await firebase
				.firestore()
				.collection('stories')
				.get();
			snapshot.forEach((doc) => {
				if (doc.data().isActive === true) {
					setActive(true);
					setActiveId(doc.id);
				}
			});
			console.log('Stories accessed for active story');
		} catch {
			console.error('Failed to find an active story');
		}
	}

	async function initStories() {
		try {
			const snapshot = await firebase
				.firestore()
				.collection('stories')
				.get();
			snapshot.forEach((doc) => {
				setStories((oldStories) => [
					...oldStories,
					{
						id: doc.id,
						title: doc.data().title,
						content: doc.data().content,
					},
				]);
			});
			console.log('Stories accessed');
		} catch {
			console.error('Access Failed');
		}
	}

	async function setActiveStory(storyId) {
		try {
			const snapshot = await firebase
				.firestore()
				.collection('stories')
				.get();
			let document = '';
			let id = '';
			snapshot.forEach((doc) => {
				if (doc.id === storyId) {
					document = doc.data();
					id = doc.id;
					setActiveId(doc.id);
					console.log('doc.id' + doc.id);
				}
			});
			firebase
				.firestore()
				.collection('stories')
				.doc(id)
				.set({
					content: document.content,
					isActive: true,
					title: document.title,
				})
				.then(function () {
					console.log('Successful to get stories');
				})
				.catch(function (error) {
					console.error('Error getting stories documents: ', error);
				});
			setActive(true);
			console.log('isOneActive: ' + isOneActive);
		} catch {
			console.error('Access Failed');
		}
	}

	return (
		<>
			{stories.map((item) => {
				return (
					<Card style={{ maxWidth: '800px', marginBottom: '1.8rem' }}>
						<Card.Body>
							<Card.Title>{item.title}</Card.Title>
							<Card.Text>{item.content}</Card.Text>
							{!isOneActive && (
								<Button
									variant="primary"
									onClick={() => setActiveStory(item.id)}
								>
									Set as active story?
								</Button>
							)}
							{activeId === item.id && (
								<Card.Text
									style={{
										fontWeight: 'bold',
										fontSize: '20px',
									}}
								>
									Active Story
								</Card.Text>
							)}
						</Card.Body>
					</Card>
				);
			})}
		</>
	);
}
