const apiUrl = '/api/users';
const form = document.getElementById('user-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const tableBody = document.getElementById('users-table-body');
const message = document.getElementById('message');

let editingId = null;

function setMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? 'message error' : 'message';
}

function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = 'Salvar';
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorMessage =
      data.message instanceof Array
        ? data.message.join(', ')
        : data.message || 'Erro ao processar a requisicao.';
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function createActionButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.className = className;
  button.addEventListener('click', onClick);
  return button;
}

function renderUsers(users) {
  tableBody.innerHTML = '';

  if (!users.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'Nenhum usuario cadastrado.';
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');

    const idCell = document.createElement('td');
    idCell.textContent = user.idUser;

    const nameCell = document.createElement('td');
    nameCell.textContent = user.name;

    const emailCell = document.createElement('td');
    emailCell.textContent = user.email || '-';

    const actionsCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'actions';

    actions.appendChild(
      createActionButton('Editar', 'secondary', () => {
        editingId = user.idUser;
        nameInput.value = user.name;
        emailInput.value = user.email || '';
        submitButton.textContent = 'Atualizar';
        setMessage(`Editando o usuario ${user.idUser}.`);
      }),
    );

    actions.appendChild(
      createActionButton('Excluir', 'danger', async () => {
        const confirmed = window.confirm(
          `Deseja excluir o usuario ${user.name}?`,
        );

        if (!confirmed) {
          return;
        }

        try {
          await request(`${apiUrl}/${user.idUser}`, {
            method: 'DELETE',
          });
          setMessage('Usuario removido com sucesso.');
          if (editingId === user.idUser) {
            resetForm();
          }
          await loadUsers();
        } catch (error) {
          setMessage(error.message, true);
        }
      }),
    );

    actionsCell.appendChild(actions);
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(actionsCell);
    tableBody.appendChild(row);
  });
}

async function loadUsers() {
  try {
    const users = await request(apiUrl);
    renderUsers(users);
  } catch (error) {
    setMessage(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim() || null,
  };

  try {
    if (editingId) {
      await request(`${apiUrl}/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      setMessage('Usuario atualizado com sucesso.');
    } else {
      await request(apiUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMessage('Usuario cadastrado com sucesso.');
    }

    resetForm();
    await loadUsers();
  } catch (error) {
    setMessage(error.message, true);
  }
});

cancelButton.addEventListener('click', () => {
  resetForm();
  setMessage('');
});

loadUsers();
