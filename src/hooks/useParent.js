import { getCurrentInstance } from 'vue';

export function useParent(name, r) {
	const d = getCurrentInstance();

	if (d) {
		let parent = d.proxy?.$.parent;

		if (parent) {
			while (parent && parent.type?.name != name) {
				parent = parent?.parent;
			}

			if (parent) {
				if (parent.type.name == name) {
					r.value = parent.exposed;
				}
			}
		}
	}

	return r;
}