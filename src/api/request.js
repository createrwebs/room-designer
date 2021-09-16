export function getJson(name) {

	const path = window.minet3d_reqs_object && window.minet3d_reqs_object.templates_url ?
		window.minet3d_reqs_object.templates_url : "./"

	return fetch(`${path}/${name}.json`, {
		method: "GET",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		cache: 'default'
	})
		.then(res => res.json())
		.catch(e => {
		});
}