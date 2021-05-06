// import axios from 'axios'
// import { domainURL } from './Config'

/* 
{
	"ajaxurl": "https://preprod.kinoki.fr/minet3d/wp-admin/admin-ajax.php",
		"templates_url": "https://preprod.kinoki.fr/minet3d/wp-content/themes/minet3d_2021",
			"uploads_url": {
		"path": "/srv/data/web/vhosts/preprod.kinoki.fr/htdocs/minet3d/wp-content/uploads/2021/04",
			"url": "https://preprod.kinoki.fr/minet3d/wp-content/uploads/2021/04",
				"subdir": "/2021/04",
					"basedir": "/srv/data/web/vhosts/preprod.kinoki.fr/htdocs/minet3d/wp-content/uploads",
						"baseurl": "https://preprod.kinoki.fr/minet3d/wp-content/uploads",
							"error": false
	}
} */


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