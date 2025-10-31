/**
 * CLASE PRINCIPAL PARA EL CRUD DE USUARIOS
 * Gestiona todas las operaciones con la API REST
 */
class UserCRUD {
    constructor() {
        // URL de tu API en MockAPI - ACTUALIZADA CON TU URL
        this.API_URL = 'https://6903bedfd0f10a340b2589a4.mockapi.io/users';
        
        // Estado de la aplicación
        this.currentUser = null;  // Usuario actual para editar
        this.users = [];          // Lista de usuarios
        this.userToDelete = null; // Usuario a eliminar
        
        // Inicializar la aplicación
        this.initializeEventListeners();
        this.loadUsers();
    }

    /**
     * CONFIGURAR TODOS LOS EVENTOS DE LA APLICACIÓN
     */
    initializeEventListeners() {
        // Formulario de usuario
        document.getElementById('userForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Botón de cancelar
        document.getElementById('cancelBtn').addEventListener('click', () => this.cancelEdit());
        
        // Modal de eliminación
        document.getElementById('confirmDelete').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDelete').addEventListener('click', () => this.closeModal());
        
        // Cerrar modal haciendo clic fuera
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') this.closeModal();
        });
    }

    /**
     * CARGAR TODOS LOS USUARIOS DESDE LA API
     */
    async loadUsers() {
        try {
            this.showLoading(true);
            
            const response = await fetch(this.API_URL);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            this.users = await response.json();
            this.renderUsersTable();
            this.updateUsersCount();
            
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.showError('Error al cargar los usuarios. Verifica la conexión.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * MOSTRAR/OCULTAR ESTADO DE CARGA
     */
    showLoading(loading) {
        const tbody = document.getElementById('usersTableBody');
        if (loading) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">🔄 Cargando usuarios...</td></tr>';
        }
    }

    /**
     * MOSTRAR MENSAJE DE ERROR
     */
    showError(message) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = `<tr><td colspan="8" class="error-message">❌ ${message}</td></tr>`;
    }

    /**
     * ACTUALIZAR CONTADOR DE USUARIOS
     */
    updateUsersCount() {
        const countElement = document.getElementById('usersCount');
        countElement.textContent = `Total de usuarios: ${this.users.length}`;
    }

    /**
     * RENDERIZAR LA TABLA DE USUARIOS
     */
    renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        
        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">📭 No hay usuarios registrados</td></tr>';
            return;
        }

        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.address.street}, ${user.address.city}, ${user.address.zipcode}</td>
                <td>${user.phone}</td>
                <td>
                    <a href="http://${user.website}" target="_blank" class="website-link">
                        ${user.website}
                    </a>
                </td>
                <td>
                    <button class="btn-edit" onclick="userCRUD.editUser('${user.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-delete" onclick="userCRUD.deleteUserPrompt('${user.id}')">
                        🗑️ Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * MANEJAR ENVÍO DEL FORMULARIO (CREAR/ACTUALIZAR)
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            username: formData.get('username'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            website: formData.get('website'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                zipcode: formData.get('zipcode')
            }
        };

        try {
            if (this.currentUser) {
                // Actualizar usuario existente
                await this.updateUser(this.currentUser.id, userData);
                this.showMessage('✅ Usuario actualizado exitosamente', 'success');
            } else {
                // Crear nuevo usuario
                await this.createUser(userData);
                this.showMessage('✅ Usuario creado exitosamente', 'success');
            }
            
            this.resetForm();
            this.loadUsers(); // Recargar la lista
            
        } catch (error) {
            console.error('Error guardando usuario:', error);
            this.showMessage('❌ Error al guardar el usuario', 'error');
        }
    }

    /**
     * CREAR NUEVO USUARIO EN LA API
     */
    async createUser(userData) {
        const response = await fetch(this.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * ACTUALIZAR USUARIO EXISTENTE EN LA API
     */
    async updateUser(userId, userData) {
        const response = await fetch(`${this.API_URL}/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * ELIMINAR USUARIO DE LA API
     */
    async deleteUser(userId) {
        const response = await fetch(`${this.API_URL}/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * CARGAR DATOS DE USUARIO PARA EDITAR
     */
    async editUser(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            
            if (user) {
                this.currentUser = user;
                
                // Llenar formulario con datos del usuario
                document.getElementById('name').value = user.name;
                document.getElementById('username').value = user.username;
                document.getElementById('email').value = user.email;
                document.getElementById('phone').value = user.phone;
                document.getElementById('street').value = user.address.street;
                document.getElementById('city').value = user.address.city;
                document.getElementById('zipcode').value = user.address.zipcode;
                document.getElementById('website').value = user.website;
                
                // Cambiar interfaz a modo edición
                document.getElementById('formTitle').textContent = '✏️ Actualizar Usuario';
                document.getElementById('submitBtn').textContent = '💾 Actualizar Usuario';
                document.getElementById('cancelBtn').style.display = 'inline-block';
                
                // Scroll al formulario
                document.querySelector('.form-section').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
            
        } catch (error) {
            console.error('Error cargando usuario para editar:', error);
            this.showMessage('❌ Error al cargar usuario para editar', 'error');
        }
    }

    /**
     * CANCELAR MODO EDICIÓN
     */
    cancelEdit() {
        this.currentUser = null;
        this.resetForm();
    }

    /**
     * RESTABLECER FORMULARIO A ESTADO INICIAL
     */
    resetForm() {
        document.getElementById('userForm').reset();
        document.getElementById('formTitle').textContent = '➕ Crear Nuevo Usuario';
        document.getElementById('submitBtn').textContent = '💾 Crear Usuario';
        document.getElementById('cancelBtn').style.display = 'none';
        this.currentUser = null;
    }

    /**
     * SOLICITAR CONFIRMACIÓN PARA ELIMINAR USUARIO
     */
    deleteUserPrompt(userId) {
        this.userToDelete = userId;
        this.openModal();
    }

    /**
     * ABRIR MODAL DE CONFIRMACIÓN
     */
    openModal() {
        document.getElementById('deleteModal').style.display = 'block';
    }

    /**
     * CERRAR MODAL DE CONFIRMACIÓN
     */
    closeModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.userToDelete = null;
    }

    /**
     * CONFIRMAR ELIMINACIÓN DE USUARIO
     */
    async confirmDelete() {
        if (this.userToDelete) {
            try {
                await this.deleteUser(this.userToDelete);
                this.showMessage('✅ Usuario eliminado exitosamente', 'success');
                this.loadUsers(); // Recargar lista
            } catch (error) {
                console.error('Error eliminando usuario:', error);
                this.showMessage('❌ Error al eliminar el usuario', 'error');
            }
        }
        
        this.closeModal();
    }

    /**
     * MOSTRAR MENSAJE TEMPORAL
     */
    showMessage(message, type) {
        // Crear elemento de mensaje
        const messageElement = document.createElement('div');
        messageElement.className = type === 'success' ? 'success-message' : 'error-message';
        messageElement.textContent = message;
        
        // Insertar antes del formulario
        const formSection = document.querySelector('.form-section');
        formSection.insertBefore(messageElement, formSection.firstChild);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
}

// INICIALIZAR LA APLICACIÓN CUANDO SE CARGA LA PÁGINA
let userCRUD;

document.addEventListener('DOMContentLoaded', () => {
    userCRUD = new UserCRUD();
    console.log('📊 CRUD de Usuarios inicializado correctamente');
});
