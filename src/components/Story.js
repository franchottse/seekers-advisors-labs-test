import React, { useState, useEffect } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import firebase from 'firebase/app';
import StoryPoint from './StoryPoint';

export default function Story({ user }) {
	const [stories, setStories] = useState([]);
	const [isOneActive, setActive] = useState(false);
	const [activeId, setActiveId] = useState('');
	const [allSubmited, setSubmited] = useState(false);
	const [allSubmitedOnlineUsers, setSubmitedOnlineUsers] = useState([]);

	useEffect(() => {
		if (stories.length === 0) {
			initStories();
		}
		findActiveStory();
		allSubmitedLoggedinUsers();
	}, [stories, isOneActive, activeId, allSubmited]);

	async function allSubmitedLoggedinUsers() {
		if (activeId === '') return;
		let users_in_story = [];
		let online_users = [];
		let users_in_story_with_points = [];

		// Cannot fetch data from users
		await firebase
			.firestore()
			.collection('stories')
			.doc(activeId)
			.get()
			.then((doc) => {
				console.log('doc.data().users: ' + doc.data().users);
				Object.keys(doc.data().users).map((key, value) => {
					users_in_story.push(key.replaceAll(',', '.'));
					users_in_story_with_points.push([key, value]);
				});
			});

		const snapshot_online_users = await firebase
			.firestore()
			.collection('users')
			.get();
		console.log('activeId: ' + activeId);
		// console.log('snapshot_users_in_story: ' + snapshot_users_in_story);
		// console.log(
		// 	'snapshot_users_in_story.data(): ' + snapshot_users_in_story.data()
		// );

		snapshot_online_users.docs.forEach((usr) =>
			online_users.push(usr.data().email)
		);

		console.log('Users in a story: ' + users_in_story);
		console.log('Online Users: ' + online_users);
		console.log(
			'Users in story with points: ' + users_in_story_with_points
		);

		let checker = (arr, target) => target.every((v) => arr.includes(v));
		console.log(
			'checker(users_in_story, online_users): ' +
				checker(users_in_story, online_users)
		);
		setSubmited(checker(users_in_story, online_users));
		console.log('allSubmited: ' + allSubmited);
		if (allSubmited) {
			setSubmitedOnlineUsers(users_in_story_with_points);
			firebase.firestore().collection('stories').doc(activeId).update({
				users: firebase.firestore.FieldValue.delete(),
			});
			firebase.firestore().collection('stories').doc(activeId).update({
				users: [],
			});
			setSubmited(false);
			setActive(false);
		}
	}

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
							{allSubmited && (
								<div>
									{allSubmitedOnlineUsers.map((usr) => {
										return (
											<p>
												{usr.email} gave {usr.point}{' '}
											</p>
										);
									})}
								</div>
							)}
							{!allSubmited &&
								isOneActive &&
								activeId === item.id && (
									<StoryPoint story={item} user={user} />
								)}
							{!allSubmited && activeId === item.id && (
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
