/**
 * CLASE PRINCIPAL DEL REPRODUCTOR DE MÚSICA
 * Esta clase maneja toda la funcionalidad del reproductor
 */
class MusicPlayer {
    constructor() {
        // Elemento de audio HTML5
        this.audio = new Audio();
        
        // Estado del reproductor
        this.currentSong = null;      // Canción actual
        this.isPlaying = false;       // ¿Está reproduciendo?
        this.volume = 0.5;           // Volumen (0 a 1)
        
        // Configurar volumen inicial
        this.audio.volume = this.volume;
        
        // Inicializar componentes
        this.initializeEventListeners();  // Configurar eventos
        this.loadInitialData();           // Cargar datos iniciales
        this.renderSongsTable();          // Mostrar canciones en tabla
        this.setupAudioEvents();          // Configurar eventos de audio
    }

    /**
     * CONFIGURAR EVENTOS DE LOS BOTONES Y CONTROLES
     */
    initializeEventListeners() {
        // Botones de control principal
        document.getElementById('btnPlay').addEventListener('click', () => this.play());
        document.getElementById('btnPause').addEventListener('click', () => this.pause());
        document.getElementById('btnStop').addEventListener('click', () => this.stop());
        
        // Controles de volumen
        document.getElementById('btnVolumeUp').addEventListener('click', () => this.volumeUp());
        document.getElementById('btnVolumeDown').addEventListener('click', () => this.volumeDown());
        document.getElementById('btnMute').addEventListener('click', () => this.toggleMute());
        
        // Barra de progreso (para saltar en la canción)
        document.getElementById('progressBar').addEventListener('input', (e) => this.seek(e.target.value));
        
        // Formulario para agregar canciones
        document.getElementById('songForm').addEventListener('submit', (e) => this.addSong(e));
        
        // Detectar cuando se selecciona un archivo de audio
        document.getElementById('audioFile').addEventListener('change', (e) => this.onFileSelect(e));
    }

    /**
     * CONFIGURAR EVENTOS DEL ELEMENTO DE AUDIO
     */
    setupAudioEvents() {
        // Actualizar barra de progreso cuando avanza el tiempo
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        
        // Cuando se carga la metadata (duración, etc.)
        this.audio.addEventListener('loadedmetadata', () => this.updateSongInfo());
        
        // Cuando termina la canción
        this.audio.addEventListener('ended', () => this.onSongEnd());
    }

    /**
     * MANEJADOR CUANDO SE SELECCIONA UN ARCHIVO DE AUDIO
     * @param {Event} event - Evento del selector de archivos
     */
    onFileSelect(event) {
        const file = event.target.files[0];
        const fileInfo = document.getElementById('fileInfo');
        
        if (!file) {
            fileInfo.innerHTML = '';
            return;
        }
        
        // Mostrar información del archivo
        fileInfo.innerHTML = `
            <strong>Archivo seleccionado:</strong> ${file.name}<br>
            <strong>Tamaño:</strong> ${this.formatFileSize(file.size)}<br>
            <strong>Tipo:</strong> ${file.type}
        `;
        
        // Crear URL temporal para pre-cargar y detectar duración
        const audioURL = URL.createObjectURL(file);
        const tempAudio = new Audio();
        
        tempAudio.src = audioURL;
        tempAudio.addEventListener('loadedmetadata', () => {
            // Detectar duración automáticamente
            const duration = tempAudio.duration;
            const formattedDuration = this.formatDuration(duration);
            
            // Llenar campo de duración automáticamente
            document.getElementById('duracion').value = formattedDuration;
            
            // Detectar discográfica basada en el nombre del archivo o artista
            this.autoDetectDiscografia();
            
            // Limpiar URL temporal
            URL.revokeObjectURL(audioURL);
        });
        
        tempAudio.addEventListener('error', () => {
            fileInfo.innerHTML += '<br><span style="color: red;">Error al cargar el archivo de audio</span>';
        });
    }

    /**
     * DETECTAR DISCOGRÁFICA AUTOMÁTICAMENTE BASADA EN EL CANTANTE
     */
    autoDetectDiscografia() {
        const cantante = document.getElementById('cantante').value.toLowerCase();
        const discografiaInput = document.getElementById('discografica');
        
        // Base de datos simple de discográficas por artista
        const discograficas = {
            'thousand foot krutch': 'TFK Music',
            'starset': 'Razor & Tie',
            'becko': 'Electronic Records',
            'linkin park': 'Warner Bros Records',
            'coldplay': 'Parlophone',
            'ed sheeran': 'Atlantic Records',
            'taylor swift': 'Republic Records',
            'bad bunny': 'Rimas Entertainment',
            'shakira': 'Sony Music'
        };
        
        // Buscar discográfica del artista
        for (const [artista, discografia] of Object.entries(discograficas)) {
            if (cantante.includes(artista)) {
                discografiaInput.value = discografia;
                return;
            }
        }
        
        // Si no se encuentra, usar discográfica por defecto
        discografiaInput.value = 'Discográfica Independiente';
    }

    /**
     * FORMATEAR TAMAÑO DE ARCHIVO
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * FORMATEAR DURACIÓN DE SEGUNDOS A TEXTO LEGIBLE
     * @param {number} seconds - Duración en segundos
     * @returns {string} Duración formateada
     */
    formatDuration(seconds) {
        if (isNaN(seconds) || seconds === 0) return 'Duración no disponible';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        
        if (mins === 0) {
            return `${secs} segundos`;
        } else if (mins < 60) {
            return `${mins} minuto${mins > 1 ? 's' : ''} ${secs} segundo${secs !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hours} hora${hours > 1 ? 's' : ''} ${remainingMins} minuto${remainingMins > 1 ? 's' : ''}`;
        }
    }

    /**
     * CARGAR DATOS INICIALES EN LOCALSTORAGE Y SESSIONSTORAGE
     */
    loadInitialData() {
        // REQUISITO 1: Guardar una canción en LOCALSTORAGE
        const cancionPrincipal = {
            'Cancion': 'Courtesy Call',
            'Cantante': 'Thousand Foot Krutch',
            'Discografica': 'TFK Music',
            'Duracion': '3 minutos 45 segundos',
            'URL': 'assets/audio/CourtesyCall.mp3',
            'Pais': 'Canadiense',
            'id': 1,
            'storage': 'local'
        };

        // Convertir objeto a JSON y guardar en localStorage
        const cancionJSON = JSON.stringify(cancionPrincipal);
        localStorage.setItem('miCancion', cancionJSON);
        console.log('✅ Canción guardada en localStorage:', cancionPrincipal.Cancion);

        // REQUISITO 2: Guardar otras canciones en SESSIONSTORAGE
        const otrasCanciones = [
            {
                'Cancion': 'Crossfaded',
                'Cantante': 'Becko',
                'Discografica': 'Electronic Records',
                'Duracion': '4 minutos 20 segundos',
                'URL': 'assets/audio/Crossfaded.mp3',
                'Pais': 'Americana',
                'id': 2,
                'storage': 'session'
            },
            {
                'Cancion': 'My Demons',
                'Cantante': 'Starset',
                'Discografica': 'Razor & Tie',
                'Duracion': '4 minutos 5 segundos',
                'URL': 'assets/audio/MyDemons.mp3',
                'Pais': 'Americana',
                'id': 3,
                'storage': 'session'
            }
        ];

        // Guardar cada canción en sessionStorage
        otrasCanciones.forEach((cancion, index) => {
            sessionStorage.setItem(`cancion_${index + 2}`, JSON.stringify(cancion));
            console.log('✅ Canción guardada en sessionStorage:', cancion.Cancion);
        });
    }

    /**
     * OBTENER TODAS LAS CANCIONES ALMACENADAS
     * @returns {Array} Lista de todas las canciones
     */
    getStoredSongs() {
        const songs = [];

        // 1. Obtener canción de LOCALSTORAGE
        const localSongJSON = localStorage.getItem('miCancion');
        if (localSongJSON) {
            const localSong = JSON.parse(localSongJSON);
            songs.push(localSong);
        }

        // 2. Obtener canciones de SESSIONSTORAGE
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key.startsWith('cancion_')) {
                const sessionSongJSON = sessionStorage.getItem(key);
                const sessionSong = JSON.parse(sessionSongJSON);
                songs.push(sessionSong);
            }
        }

        console.log('📀 Canciones cargadas:', songs.length);
        return songs;
    }

    /**
     * MOSTRAR CANCIONES EN LA TABLA HTML
     */
    renderSongsTable() {
        const tbody = document.getElementById('songsTableBody');
        const songs = this.getStoredSongs();

        // Limpiar tabla antes de agregar nuevas filas
        tbody.innerHTML = '';

        // Crear una fila por cada canción
        songs.forEach(song => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${song.id}</td>
                <td>${song.Cancion}</td>
                <td>${song.Cantante}</td>
                <td>${song.Discografica}</td>
                <td>${song.Duracion}</td>
                <td>${song.Pais}</td>
                <td>
                    <button class="btn-play" onclick="musicPlayer.playSong('${song.URL}', '${song.Cancion}')">
                        ▶ Reproducir
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    /**
     * REPRODUCIR UNA CANCIÓN ESPECÍFICA
     * @param {string} url - Ruta del archivo de audio
     * @param {string} songName - Nombre de la canción
     */
    playSong(url, songName) {
        this.currentSong = url;
        
        // Actualizar interfaz con información de la canción
        document.getElementById('currentSong').textContent = songName;
        
        // Configurar y reproducir el audio
        this.audio.src = url;
        this.play();
        
        console.log('🎵 Reproduciendo:', songName);
    }

    /**
     * INICIAR REPRODUCCIÓN
     */
    play() {
        if (this.currentSong) {
            this.audio.play();
            this.isPlaying = true;
            document.getElementById('btnPlay').textContent = '▶ Reproduciendo...';
        } else {
            alert('⚠️ Primero selecciona una canción de la tabla');
        }
    }

    /**
     * PAUSAR REPRODUCCIÓN
     */
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        document.getElementById('btnPlay').textContent = '▶ Play';
    }

    /**
     * DETENER REPRODUCCIÓN
     */
    stop() {
        this.audio.pause();
        this.audio.currentTime = 0;  // Reiniciar al inicio
        this.isPlaying = false;
        document.getElementById('btnPlay').textContent = '▶ Play';
        this.updateProgress();  // Actualizar barra
    }

    /**
     * AUMENTAR VOLUMEN
     */
    volumeUp() {
        if (this.volume < 1) {
            this.volume = Math.min(1, this.volume + 0.1);  // Máximo 1
            this.audio.volume = this.volume;
            this.updateVolumeDisplay();
        }
    }

    /**
     * DISMINUIR VOLUMEN
     */
    volumeDown() {
        if (this.volume > 0) {
            this.volume = Math.max(0, this.volume - 0.1);  // Mínimo 0
            this.audio.volume = this.volume;
            this.updateVolumeDisplay();
        }
    }

    /**
     * ACTIVAR/DESACTIVAR SILENCIO
     */
    toggleMute() {
        this.audio.muted = !this.audio.muted;
        const muteButton = document.getElementById('btnMute');
        muteButton.textContent = this.audio.muted ? '🔊 Activar' : '🔇 Silenciar';
    }

    /**
     * ACTUALIZAR INDICADOR DE VOLUMEN EN LA INTERFAZ
     */
    updateVolumeDisplay() {
        const volumePercent = Math.round(this.volume * 100);
        document.getElementById('volumeLevel').textContent = `${volumePercent}%`;
    }

    /**
     * SALTAR A UNA POSICIÓN ESPECÍFICA EN LA CANCIÓN
     * @param {number} value - Porcentaje de progreso (0-100)
     */
    seek(value) {
        if (this.audio.duration) {
            // Calcular tiempo basado en porcentaje
            const newTime = (value / 100) * this.audio.duration;
            this.audio.currentTime = newTime;
        }
    }

    /**
     * ACTUALIZAR BARRA DE PROGRESO Y TIEMPO
     */
    updateProgress() {
        if (this.audio.duration) {
            // Calcular porcentaje de progreso
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progressBar').value = progress;
            
            // Formatear y mostrar tiempo actual
            const currentTime = this.formatTime(this.audio.currentTime);
            const duration = this.formatTime(this.audio.duration);
            document.getElementById('currentTime').textContent = `${currentTime} / ${duration}`;
        }
    }

    /**
     * ACTUALIZAR INFORMACIÓN CUANDO SE CARGA UNA CANCIÓN
     */
    updateSongInfo() {
        if (this.audio.duration) {
            const duration = this.formatTime(this.audio.duration);
            document.getElementById('currentTime').textContent = `00:00 / ${duration}`;
        }
    }

    /**
     * FORMATEAR TIEMPO DE SEGUNDOS A MM:SS
     * @param {number} seconds - Tiempo en segundos
     * @returns {string} Tiempo formateado
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * MANEJADOR CUANDO TERMINA LA CANCIÓN
     */
    onSongEnd() {
        this.isPlaying = false;
        document.getElementById('btnPlay').textContent = '▶ Play';
        this.audio.currentTime = 0;
        this.updateProgress();
    }

    /**
     * AGREGAR NUEVA CANCIÓN DESDE EL FORMULARIO CON SELECTOR DE ARCHIVOS
     * @param {Event} event - Evento del formulario
     */
    addSong(event) {
        event.preventDefault();  // Prevenir envío normal del formulario
        
        // Obtener datos del formulario
        const formData = new FormData(event.target);
        const audioFile = document.getElementById('audioFile').files[0];
        
        // Validar que se haya seleccionado un archivo
        if (!audioFile) {
            alert('⚠️ Por favor selecciona un archivo de audio');
            return;
        }
        
        // Validar tipo de archivo
        const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
        if (!validTypes.includes(audioFile.type)) {
            alert('❌ Formato de archivo no válido. Usa MP3, WAV u OGG.');
            return;
        }
        
        // Validar tamaño (máximo 10MB)
        if (audioFile.size > 10 * 1024 * 1024) {
            alert('❌ Archivo muy grande. Máximo 10MB permitido.');
            return;
        }
        
        // Crear URL temporal para el archivo subido
        const audioURL = URL.createObjectURL(audioFile);
        
        // Obtener valores automáticos del formulario
        const duracion = document.getElementById('duracion').value;
        const discografia = document.getElementById('discografica').value;
        
        // Crear objeto de canción
        const newSong = {
            'Cancion': formData.get('cancion'),
            'Cantante': formData.get('cantante'),
            'Discografica': discografia,
            'Duracion': duracion,
            'Pais': formData.get('nacionalidad'),
            'URL': audioURL,  // Usar la URL temporal del archivo
            'fileName': audioFile.name,  // Guardar nombre del archivo
            'fileType': audioFile.type,  // Tipo MIME del archivo
            'id': Date.now(),  // ID único basado en timestamp
            'storage': 'session'  // Guardar en sessionStorage
        };

        // REQUISITO 2: Guardar en SESSIONSTORAGE
        sessionStorage.setItem(`cancion_${newSong.id}`, JSON.stringify(newSong));
        
        // Actualizar tabla para mostrar la nueva canción
        this.renderSongsTable();
        
        // Limpiar formulario
        event.target.reset();
        document.getElementById('fileInfo').innerHTML = '';
        
        // Mostrar mensaje de éxito
        alert(`✅ Canción "${newSong.Cancion}" agregada exitosamente!`);
        console.log('Nueva canción agregada:', newSong);
    }
}

// VARIABLE GLOBAL del reproductor
let musicPlayer;

/**
 * INICIALIZAR LA APLICACIÓN CUANDO SE CARGA LA PÁGINA
 */
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
    console.log('🎵 Reproductor de música inicializado correctamente');
});
