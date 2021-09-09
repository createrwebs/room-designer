// import axios from 'axios'

export function getJson(name) {

	const path = window.minet3d_reqs_object && window.minet3d_reqs_object.templates_url ?
		window.minet3d_reqs_object.templates_url : "./"

	return fetch(`${path}/${name}.json`, {
		method: "GET",
		// mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		cache: 'default'
	})
		.then(res => res.json())
		.catch(e => {
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