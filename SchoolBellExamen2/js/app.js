async function init() {
	try {
		const resp = await fetch('./data/data.json');
		if (resp.ok) {
			const data = await resp.json();
			if (!localStorage.getItem('schoolData')) {
				localStorage.setItem('schoolData', JSON.stringify(data));
			}
		}
	} catch (err) {
		if (!localStorage.getItem('schoolData')) {
			const fallback = { schedules: [{ id: 1, name: 'Horario', times: [] }], playlists: [{ id: 1, name: 'Default', songs: [] }] };
			localStorage.setItem('schoolData', JSON.stringify(fallback));
		}
	}
	const data = getData();
	populateSongSelect(data);
	populateSongSelect(data, 'addTimeSongSelect');
	renderAll();
	const form = document.getElementById('timeForm');
	form.addEventListener('submit', validar);
	const addForm = document.getElementById('addTimeForm');
	if (addForm) {
		addForm.addEventListener('submit', (e) => {
			e.preventDefault();
			if (validarModal()) {
				guardarNuevoFromModal();
				addForm.reset();
				const em = document.getElementById('errorMensajeAdd');
				if (em) em.textContent = '';
				const addModalEl = document.getElementById('addTimeModal');
				const modal = bootstrap.Modal.getInstance(addModalEl);
				if (modal) modal.hide();
			}
		});
	}
}

function getData() {
	const data = localStorage.getItem('schoolData');
	if (!data) {
		const fallback = { schedules: [{ id: 1, name: 'Horario', times: [] }], playlists: [{ id: 1, name: 'Default', songs: [] }] };
		localStorage.setItem('schoolData', JSON.stringify(fallback));
		return fallback;
	}
	return JSON.parse(data);
}

function saveData(d) {
	localStorage.setItem('schoolData', JSON.stringify(d));
}

function renderAll() {
	const data = getData();
	renderTimesTable(data);
}

function renderTimesTable(data) {
	const container = document.getElementById('timesContainer');
	while (container.firstChild) container.removeChild(container.firstChild);
	const table = document.createElement('table');
	table.classList.add('table','table-striped');
	const thead = document.createElement('thead');
	const trh = document.createElement('tr');
	['Nombre','Hora','Segs','Canción','Acciones'].forEach(h => {
		const th = document.createElement('th');
		th.scope = 'col';
		th.textContent = h;
		trh.appendChild(th);
	});
	thead.appendChild(trh);
	table.appendChild(thead);
	const tbody = document.createElement('tbody');
	const schedule = data && data.schedules && data.schedules[0] ? data.schedules[0] : {times:[]};
	for (const t of schedule.times) {
		const tr = document.createElement('tr');
		const tdName = document.createElement('td');
		tdName.textContent = t.name;
		tr.appendChild(tdName);
		const tdHour = document.createElement('td');
		tdHour.textContent = t.hour;
		tr.appendChild(tdHour);
		const tdDur = document.createElement('td');
		tdDur.textContent = t.duration;
		tr.appendChild(tdDur);
		const tdSong = document.createElement('td');
		tdSong.textContent = resolveSongName(data, t.songId);
		tr.appendChild(tdSong);
		const tdActions = document.createElement('td');
		const btnEdit = document.createElement('button');
		btnEdit.type = 'button';
		btnEdit.classList.add('btn','btn-sm','btn-primary','me-2');
		btnEdit.textContent = 'Editar';
		btnEdit.addEventListener('click', () => loadIntoForm(t.id));
		const btnDel = document.createElement('button');
		btnDel.type = 'button';
		btnDel.classList.add('btn','btn-sm','btn-danger');
		btnDel.textContent = 'Borrar';
		btnDel.addEventListener('click', () => removeTime(t.id));
		tdActions.appendChild(btnEdit);
		tdActions.appendChild(btnDel);
		tr.appendChild(tdActions);
		tbody.appendChild(tr);
	}
	table.appendChild(tbody);
	container.appendChild(table);
}

function resolveSongName(data, songId) {
	if (!data || !data.playlists) return '';
	for (const p of data.playlists) {
		for (const s of p.songs) {
			if (s.id == songId) return p.name + ' - ' + s.name;
		}
	}
	return '';
}

function populateSongSelect(data, selectId = 'timeSongSelect') {
	const select = document.getElementById(selectId);
	if (!select) return;
	while (select.firstChild) select.removeChild(select.firstChild);
	const opt = document.createElement('option');
	opt.value = '';
	opt.textContent = '-- Seleccionar --';
	select.appendChild(opt);
	for (const p of data.playlists) {
		for (const s of p.songs) {
			const o = document.createElement('option');
			o.value = s.id;
			o.textContent = p.name + ' - ' + s.name;
			select.appendChild(o);
		}
	}
}

function loadIntoForm(id) {
	const data = getData();
	const schedule = data.schedules[0];
	const t = schedule.times.find(x => x.id == id);
	if (!t) return;
	populateSongSelect(data);
	document.getElementById('timeName').value = t.name;
	document.getElementById('timeHour').value = t.hour;
	document.getElementById('timeDuration').value = t.duration;
	document.getElementById('timeSongSelect').value = t.songId;
	document.getElementById('timeForm').dataset.editing = id;
}

function removeTime(id) {
	if (!confirm('Confirma si vols eliminar la hora')) return;
	const data = getData();
	const schedule = data.schedules[0];
	const idx = schedule.times.findIndex(t => t.id == id);
	if (idx === -1) return;
	schedule.times.splice(idx,1);
	saveData(data);
	renderAll();
}

function generarId() {
	return Date.now();
}

function validar(e) {
	esborrarError();
	const form = document.getElementById('timeForm');
	if (form.dataset.fromValidate === '1') {
		delete form.dataset.fromValidate;
		const editing = form.dataset.editing;
		if (editing) {
			aplicarEdicion(Number(editing));
			delete form.dataset.editing;
		} else {
			guardarNuevo();
		}
		form.reset();
		return true;
	}
	e.preventDefault();
	if (validarNombres() && validarHora() && validarSegs() && validarCancion() && confirm('Confirma si vols guardar el moment')) {
		form.dataset.fromValidate = '1';
		form.requestSubmit();
		return true;
	} else {
		return false;
	}
}

function aplicarEdicion(id) {
	const data = getData();
	const schedule = data.schedules[0];
	const t = schedule.times.find(x => x.id == id);
	if (!t) return;
	t.name = document.getElementById('timeName').value.trim();
	t.hour = document.getElementById('timeHour').value;
	t.duration = Number(document.getElementById('timeDuration').value);
	t.songId = Number(document.getElementById('timeSongSelect').value);
	saveData(data);
	renderAll();
}

function guardarNuevo() {
	const data = getData();
	const schedule = data.schedules[0];
	const nuevo = {
		id: generarId(),
		name: document.getElementById('timeName').value.trim(),
		hour: document.getElementById('timeHour').value,
		duration: Number(document.getElementById('timeDuration').value),
		songId: Number(document.getElementById('timeSongSelect').value)
	};
	schedule.times.push(nuevo);
	saveData(data);
	renderAll();
}

function guardarNuevoFromModal() {
	const data = getData();
	const schedule = data.schedules[0];
	const nuevo = {
		id: generarId(),
		name: document.getElementById('addTimeName').value.trim(),
		hour: document.getElementById('addTimeHour').value,
		duration: Number(document.getElementById('addTimeDuration').value),
		songId: Number(document.getElementById('addTimeSongSelect').value)
	};
	schedule.times.push(nuevo);
	saveData(data);
	renderAll();
}

function validarModal() {
	const em = document.getElementById('errorMensajeAdd');
	if (em) em.textContent = '';
	const name = document.getElementById('addTimeName');
	const hour = document.getElementById('addTimeHour');
	const dur = document.getElementById('addTimeDuration');
	const song = document.getElementById('addTimeSongSelect');
	if (name.value.trim().length < 2) {
		const miss = document.createTextNode('El nombre debe tener al menos 2 caracteres');
		document.getElementById('errorMensajeAdd').appendChild(miss);
		name.classList.add('text-danger');
		name.focus();
		return false;
	}
	if (!hour.value) {
		const miss = document.createTextNode('Debes seleccionar una hora');
		document.getElementById('errorMensajeAdd').appendChild(miss);
		hour.classList.add('text-danger');
		hour.focus();
		return false;
	}
	if (!Number(dur.value) || Number(dur.value) <= 0) {
		const miss = document.createTextNode('Segundos deben ser mayor que 0');
		document.getElementById('errorMensajeAdd').appendChild(miss);
		dur.classList.add('text-danger');
		dur.focus();
		return false;
	}
	if (!song.value) {
		const miss = document.createTextNode('Selecciona una canción');
		document.getElementById('errorMensajeAdd').appendChild(miss);
		song.classList.add('text-danger');
		song.focus();
		return false;
	}
	return confirm('Confirma si vols guardar el moment');
}

function error(element, missatge) {
	const miss = document.createTextNode(missatge);
	document.getElementById('errorMensaje').appendChild(miss);
	element.classList.add('text-danger');
	element.focus();
}

function esborrarError() {
	document.getElementById('errorMensaje').textContent = '';
	let formulari = document.forms[0];
	for (let i = 0; i < formulari.elements.length; i++) {
		formulari.elements[i].classList.remove('text-danger');
	}
}

function validarNombres() {
	const el = document.getElementById('timeName');
	const v = el.value.trim();
	if (v.length < 2) {
		error(el,'El nombre debe tener al menos 2 caracteres');
		return false;
	}
	return true;
}

function validarHora() {
	const el = document.getElementById('timeHour');
	if (!el.value) {
		error(el,'Debes seleccionar una hora');
		return false;
	}
	return true;
}

function validarSegs() {
	const el = document.getElementById('timeDuration');
	const v = Number(el.value);
	if (!v || v <= 0) {
		error(el,'Segundos deben ser mayor que 0');
		return false;
	}
	return true;
}

function validarCancion() {
	const el = document.getElementById('timeSongSelect');
	if (!el.value) {
		error(el,'Selecciona una canción');
		return false;
	}
	return true;
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

