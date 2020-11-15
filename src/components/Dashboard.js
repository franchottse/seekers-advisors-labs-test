import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import firebase from 'firebase/app';
import Story from './Story';

export default function Dashboard() {
	const [error, setError] = useState('');
	const { currentUser, logout } = useAuth();
	const history = useHistory();

	async function handleLogout() {
		setError('');
		try {
			await logout();
			const snapshot = await firebase
				.firestore()
				.collection('users')
				.get();
			let id = '';
			snapshot.forEach((doc) => {
				if (doc.data().email === currentUser.email) {
					id = doc.id;
				}
			});
			if (id !== '') {
				firebase
					.firestore()
					.collection('users')
					.doc(id)
					.delete()
					.then(function () {
						console.log('Successful to log out');
					})
					.catch(function (error) {
						console.error('Error removing document: ', error);
					});
			}

			history.push('/login');
		} catch {
			setError('Failed to log out');
		}
	}

	return (
		<>
			<Card>
				<Card.Body>
					<h2 className="text-center mb-4">Profile</h2>
					{error && <Alert variant="danger">{error}</Alert>}
					<strong>Email:</strong> {currentUser.email}
					<Link
						to="/update-profile"
						className="btn btn-primary w-100 mt-3"
					>
						Update Profile
					</Link>
				</Card.Body>
			</Card>
			<div className="w-100 text-center mt-2">
				<Button variant="link" onClick={handleLogout}>
					Log Out
				</Button>
			</div>
			<h2 className="text-left mb-4">Stories</h2>
			<Story />
		</>
	);
}
