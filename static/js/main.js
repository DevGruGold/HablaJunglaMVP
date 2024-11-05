
    let mediaRecorder;
    let audioChunks = [];
    
    const recordButton = document.getElementById('recordButton');
    const stopButton = document.getElementById('stopButton');
    
    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
    
    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const formData = new FormData();
                formData.append('audio', audioBlob);
                
                try {
                    document.getElementById('recordingStatus').textContent = 'Processing...';
                    
                    const response = await fetch('/process_audio', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    document.getElementById('animalType').textContent = 
                        `🎯 Detected Animal: ${result.animal_type}`;
                    document.getElementById('dialogue').textContent = 
                        `💭 ${result.dialogue}`;
                    
                    document.getElementById('recordingStatus').textContent = '';
                    
                } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('recordingStatus').textContent = 
                        '❌ Error processing audio';
                }
                
                audioChunks = [];
            };
            
            mediaRecorder.start();
            document.getElementById('recordingStatus').textContent = '🎤 Recording...';
            recordButton.disabled = true;
            stopButton.disabled = false;
            
        } catch (err) {
            console.error('Error:', err);
            document.getElementById('recordingStatus').textContent = 
                '❌ Error accessing microphone';
        }
    }
    
    function stopRecording() {
        mediaRecorder.stop();
        recordButton.disabled = false;
        stopButton.disabled = true;
    }
    