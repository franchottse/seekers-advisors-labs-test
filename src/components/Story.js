import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import firebase from 'firebase/app';
import StoryPoint from './StoryPoint';

export default function Story({ user }) {
	const [stories, setStories] = useState([]);
	const [scoredStories, setScoredStories] = useState([]);
	const [isOneActive, setActive] = useState(false);
	const [activeId, setActiveId] = useState('');

	useEffect(() => {
		initStories();
	}, []);

	async function allSubmitedLoggedinUsers() {
		if (activeId === '') return;
		let users_in_story = [];
		let online_users = [];
		let users_in_story_with_points = [];
		let usrs;

		await firebase
			.firestore()
			.collection('stories')
			.doc(activeId)
			.get()
			.then((doc) => {
				if (doc.exists) {
					Object.keys(doc.data().users).map((key, value) => {
						users_in_story.push(key.replaceAll(',', '.'));
						users_in_story_with_points.push({
							email: key.replaceAll(',', '.'),
							point: value,
						});
					});
					usrs = doc.data().users;
				} else {
					console.log('doc does not exist');
				}
			});

		const snapshot_online_users = await firebase
			.firestore()
			.collection('users')
			.get();
		console.log('activeId: ' + activeId);

		snapshot_online_users.docs.forEach((usr) =>
			online_users.push(usr.data().email)
		);

		let checker = (arr, target) => target.every((v) => arr.includes(v));
		console.log(
			'checker(users_in_story, online_users): ' +
				checker(users_in_story, online_users)
		);
		console.log('users_in_story: ' + users_in_story);
		console.log('online_users: ' + online_users);
		if (checker(users_in_story, online_users)) {
			setActive(false);
			firebase.firestore().collection('stories').doc(activeId).update({
				isScored: true,
				isActive: false,
			});
			let isExist = scoredStories.includes(activeId);
			if (!isExist) {
				setScoredStories([...scoredStories, activeId]);
			}

			let newArr = [...stories];
			let index = newArr.findIndex((x) => x.id === activeId);
			newArr[index].isScored = true;
			newArr[index].isActive = false;
			newArr[index].users = usrs;
			setStories(newArr);
			console.log('Changed isScored for the activeId ' + activeId);
			setActiveId('');
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
						isScored: doc.data().isScored,
						isActive: doc.data().isActive,
						users: doc.data().users,
					},
				]);
				if (doc.data().isActive) {
					setActive(true);
					setActiveId(doc.id);
				}
				if (doc.data().isScored) {
					let isExist = scoredStories.includes(doc.id);
					if (!isExist) {
						setScoredStories([...scoredStories, doc.id]);
					}
				}
				console.log('doc.data().users: ' + doc.data().users);
				console.log('doc.data().isActive: ' + doc.data().isActive);
				console.log('id: ' + doc.id);
				console.log('isScored: ' + doc.data().isScored);
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
			let id = '';
			snapshot.forEach((doc) => {
				if (doc.id === storyId) {
					id = doc.id;
					setActiveId(doc.id);
					setActive(true);
					let newArr = [...stories];
					let index = newArr.findIndex((x) => x.id === doc.id);
					newArr[index].isActive = true;
					setStories(newArr);
					console.log('doc.id: ' + doc.id);
				}
			});

			await firebase
				.firestore()
				.collection('stories')
				.doc(id)
				.update({
					isActive: true,
				})
				.then(function () {
					console.log('Successful to get stories');
				})
				.catch(function (error) {
					console.error('Error getting stories documents: ', error);
				});
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
							{!item.isScored && !isOneActive && (
								<Button
									variant="primary"
									onClick={() => setActiveStory(item.id)}
								>
									Set as active story?
								</Button>
							)}
							{item.isScored && (
								<div>
									{Object.keys(item.users).map((em, po) => {
										return (
											<p>
												{em.replaceAll(',', '.')} gave{' '}
												{po}{' '}
											</p>
										);
									})}
								</div>
							)}
							{!item.isScored && activeId === item.id && (
								<StoryPoint
									story={item}
									user={user}
									func={allSubmitedLoggedinUsers}
								/>
							)}
							{!item.isScored && activeId === item.id && (
								<Alert
									variant="info"
									style={{
										fontWeight: 'bold',
										fontSize: '20px',
									}}
								>
									Active Story
								</Alert>
							)}
						</Card.Body>
					</Card>
				);
			})}
		</>
	);
}
