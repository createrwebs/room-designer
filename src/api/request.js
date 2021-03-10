// import axios from 'axios'
// import { domainURL } from './Config'

export function getConfig() {
	return fetch(`./config.json`, {
		method: "GET",
		// mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		cache: 'default'
	}).then(res => {
		return res.json();
	}
	).then(usr => {
		return usr
	}).catch(e => {
		console.log(e);
	});
}

/* export function getInfo(id) {
	return axios({
		url: `static-requests/${id}.json`,
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		onDownloadProgress: progressEvent => {
			// const total = parseFloat(progressEvent.currentTarget.responseHeaders['Content-Length'])
			// const current = progressEvent.currentTarget.response.length
			// let percentCompleted = Math.floor(current / total * 100)
			// console.log('completed: ', progressEvent)
		}
	})
		.then(usr => {
			return usr.data
		})
} */