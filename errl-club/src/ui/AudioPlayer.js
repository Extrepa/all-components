// Audio player UI for loading, selecting, and managing audio tracks
export class AudioPlayer {
    constructor(audioContext, onTrackChange = null) {
        this.audioContext = audioContext;
        this.onTrackChange = onTrackChange;
        this.currentTrack = null;
        this.tracks = [];
        this.currentTrackIndex = -1;
        this.playlist = [];
        this.shuffleMode = false;
        this.isPlaying = false;

        this.createUI();
    }

    // Step 251: Implement a UI to load/select audio tracks
    createUI() {
        // Create audio player container - HIDDEN by default (ErrlPhone has music tab)
        const container = document.createElement('div');
        container.id = 'audio-player';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            padding: 15px;
            border-radius: 10px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 1000;
            min-width: 300px;
            display: none;
        `;

        // Track name display (Step 252)
        const trackNameDiv = document.createElement('div');
        trackNameDiv.id = 'track-name';
        trackNameDiv.textContent = 'No track loaded';
        trackNameDiv.style.cssText = `
            margin-bottom: 10px;
            font-weight: bold;
            font-size: 14px;
        `;
        container.appendChild(trackNameDiv);

        // File input for loading tracks (Step 251)
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'audio/*';
        fileInput.multiple = true;
        fileInput.style.cssText = `
            margin-bottom: 10px;
            width: 100%;
        `;
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        container.appendChild(fileInput);

        // URL input for streaming (Step 283)
        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.placeholder = 'Enter audio URL';
        urlInput.style.cssText = `
            margin-bottom: 10px;
            width: 100%;
            padding: 5px;
            box-sizing: border-box;
        `;
        container.appendChild(urlInput);

        const loadUrlButton = document.createElement('button');
        loadUrlButton.textContent = 'Load URL';
        loadUrlButton.style.cssText = `
            margin-bottom: 10px;
            width: 100%;
            padding: 5px;
        `;
        loadUrlButton.addEventListener('click', () => {
            if (urlInput.value) {
                this.loadTrackFromURL(urlInput.value);
            }
        });
        container.appendChild(loadUrlButton);

        // Playback controls
        const controlsDiv = document.createElement('div');
        controlsDiv.style.cssText = `
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
        `;

        const playButton = document.createElement('button');
        playButton.textContent = 'Play';
        playButton.addEventListener('click', () => this.togglePlayback());
        controlsDiv.appendChild(playButton);

        const prevButton = document.createElement('button');
        prevButton.textContent = '◀';
        prevButton.addEventListener('click', () => this.previousTrack());
        controlsDiv.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.textContent = '▶';
        nextButton.addEventListener('click', () => this.nextTrack());
        controlsDiv.appendChild(nextButton);

        container.appendChild(controlsDiv);

        // Playlist display (Step 255)
        const playlistDiv = document.createElement('div');
        playlistDiv.id = 'playlist';
        playlistDiv.style.cssText = `
            max-height: 150px;
            overflow-y: auto;
            margin-bottom: 10px;
        `;
        container.appendChild(playlistDiv);

        // Shuffle toggle (Step 255)
        const shuffleButton = document.createElement('button');
        shuffleButton.textContent = 'Shuffle: OFF';
        shuffleButton.addEventListener('click', () => {
            this.shuffleMode = !this.shuffleMode;
            shuffleButton.textContent = `Shuffle: ${this.shuffleMode ? 'ON' : 'OFF'}`;
        });
        container.appendChild(shuffleButton);

        // Waveform/Spectrum preview canvas (Step 253)
        const canvas = document.createElement('canvas');
        canvas.id = 'audio-preview';
        canvas.width = 280;
        canvas.height = 80;
        canvas.style.cssText = `
            width: 100%;
            margin-top: 10px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
        `;
        container.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.trackNameDiv = trackNameDiv;
        this.playlistDiv = playlistDiv;
        this.playButton = playButton;

        document.body.appendChild(container);
    }

    // Handle file selection
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            this.loadTrackFromURL(url, file.name);
        });
    }

    // Load track from URL
    async loadTrackFromURL(url, name = null) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

            const track = {
                name: name || url.split('/').pop(),
                url: url,
                buffer: audioBuffer,
                source: null,
            };

            this.tracks.push(track);
            this.playlist.push(track);

            if (this.currentTrackIndex === -1) {
                this.currentTrackIndex = 0;
                this.currentTrack = track;
                this.updateTrackDisplay();
            }

            this.updatePlaylist();

            if (this.onTrackChange) {
                this.onTrackChange(track);
            }
        } catch (error) {
            console.error('Error loading track:', error);
            alert('Failed to load audio track');
        }
    }

    // Step 252: Display current track name
    updateTrackDisplay() {
        if (this.currentTrack) {
            this.trackNameDiv.textContent = this.currentTrack.name;
        } else {
            this.trackNameDiv.textContent = 'No track loaded';
        }
    }

    // Step 253: Render waveform/spectrum preview
    updatePreview(analyser, dataArray) {
        if (!this.ctx || !analyser) {
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, width, height);

        // Draw waveform
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.beginPath();

        const sliceWidth = width / dataArray.length;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 255.0;
            const y = v * height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();
    }

    // Step 254: Switch between tracks
    switchTrack(index) {
        if (index >= 0 && index < this.tracks.length) {
            this.stop();
            this.currentTrackIndex = index;
            this.currentTrack = this.tracks[index];
            this.updateTrackDisplay();

            if (this.onTrackChange) {
                this.onTrackChange(this.currentTrack);
            }
        }
    }

    // Step 255: Playlist management
    previousTrack() {
        if (this.shuffleMode) {
            this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            this.currentTrackIndex =
                (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
        }
        this.switchTrack(this.currentTrackIndex);
    }

    nextTrack() {
        if (this.shuffleMode) {
            this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
        } else {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
        }
        this.switchTrack(this.currentTrackIndex);
    }

    updatePlaylist() {
        this.playlistDiv.innerHTML = '';
        this.tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.textContent = `${index + 1}. ${track.name}`;
            item.style.cssText = `
                padding: 5px;
                cursor: pointer;
                background: ${index === this.currentTrackIndex ? 'rgba(0, 255, 255, 0.3)' : 'transparent'};
            `;
            item.addEventListener('click', () => this.switchTrack(index));
            this.playlistDiv.appendChild(item);
        });
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }

    play() {
        if (!this.currentTrack) {
            return;
        }

        if (this.currentTrack.source) {
            this.currentTrack.source.stop();
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = this.currentTrack.buffer;
        source.connect(this.audioContext.destination);
        source.start();

        this.currentTrack.source = source;
        this.isPlaying = true;
        this.playButton.textContent = 'Pause';

        source.onended = () => {
            this.isPlaying = false;
            this.playButton.textContent = 'Play';
            // Auto-play next track
            this.nextTrack();
            if (this.isPlaying) {
                this.play();
            }
        };
    }

    stop() {
        if (this.currentTrack && this.currentTrack.source) {
            this.currentTrack.source.stop();
            this.currentTrack.source = null;
        }
        this.isPlaying = false;
        this.playButton.textContent = 'Play';
    }

    getCurrentTrack() {
        return this.currentTrack;
    }
}
