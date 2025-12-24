import React, { useState, useRef, useEffect } from 'react';
import { VideoCameraIcon, StopIcon } from '@heroicons/react/24/solid';

const RecordingControls = ({ videoRef, cameraName, isPlayerReady }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const streamRef = useRef(null);
    const hasStoppedRef = useRef(false); // ✅ Flag untuk prevent double stop
    const isRecordingRef = useRef(false); // ✅ Ref untuk track recording state

    const MAX_DURATION = 600;

    // Format waktu recording (MM:SS)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startRecording = async () => {
        if (!videoRef?.current || !isPlayerReady) {
            alert('Player belum siap. Tunggu stream terhubung.');
            return;
        }

        try {
            // Capture stream dari video element
            const video = videoRef.current;
            const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
            streamRef.current = stream;

            if (!stream) {
                throw new Error('Failed to capture stream');
            }

            // Setup MediaRecorder dengan quality tinggi
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000 // 2.5 Mbps = High Quality
            };

            // Fallback jika VP9 tidak support
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            recordedChunksRef.current = [];
            hasStoppedRef.current = false; // ✅ Reset flag

            // Event: ketika ada data chunk
            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Event: ketika recording berhenti
            mediaRecorder.onstop = () => {
                downloadRecording();
            };

            // Mulai recording
            mediaRecorder.start(1000); // Capture setiap 1 detik
            setIsRecording(true);
            isRecordingRef.current = true; // ✅ Set ref
            setRecordingTime(0);

            // Timer untuk durasi
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    const newTime = prev + 1;
                    
                    // ✅ Auto-stop setelah 10 menit dengan flag check
                    if (newTime >= MAX_DURATION && !hasStoppedRef.current) {
                        hasStoppedRef.current = true;
                        
                        // ✅ Stop recording dalam timeout untuk avoid race condition
                        setTimeout(() => {
                            stopRecording(true); // Pass flag bahwa ini auto-stop
                        }, 0);
                    }
                    
                    return newTime;
                });
            }, 1000);
        } catch (error) {
            console.error('❌ Error starting recording:', error);
            alert('Gagal memulai rekaman. Pastikan stream sedang berjalan.');
            cleanupRecording();
        }
    };

    const stopRecording = (isAutoStop = false) => {
        // ✅ Prevent double execution
        if (hasStoppedRef.current && !isAutoStop) {
            return;
        }
        
        if (!isAutoStop) {
            hasStoppedRef.current = true;
        }

        // ✅ Gunakan ref untuk check, bukan state
        if (mediaRecorderRef.current && isRecordingRef.current) {
            console.log('🛑 Stopping recording...', { isAutoStop, time: recordingTime });
            
            mediaRecorderRef.current.stop();
            
            // Stop timer
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
                recordingTimerRef.current = null;
            }

            // Stop stream tracks
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            setIsRecording(false);
            isRecordingRef.current = false; // ✅ Set ref
            setIsProcessing(true);

            // ✅ Show alert hanya untuk auto-stop, setelah processing mulai
            if (isAutoStop) {
                setTimeout(() => {
                    alert('Rekaman otomatis berhenti setelah mencapai durasi maksimum');
                }, 100);
            }
        } else {
            console.log('⚠️ Cannot stop - not recording', { 
                hasMediaRecorder: !!mediaRecorderRef.current, 
                isRecording: isRecordingRef.current 
            });
        }
    };

    const downloadRecording = () => {
        try {
            // Gabungkan semua chunks jadi satu blob
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // Generate filename
            const now = new Date();
            const timestamp = now.toISOString()
                .replace(/T/, '_')
                .replace(/\..+/, '')
                .replace(/:/g, '-');
            
            const sanitizedCameraName = (cameraName || 'Unknown')
                .replace(/[^a-z0-9]/gi, '-')
                .replace(/-+/g, '-');
            
            const filename = `CCTV_${sanitizedCameraName}_${timestamp}.webm`;

            // Trigger download
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();

            // Cleanup
            setTimeout(() => {
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);

            // Reset state
            cleanupRecording();

        } catch (error) {
            console.error('❌ Error downloading recording:', error);
            alert('Gagal menyimpan rekaman');
            cleanupRecording();
        }
    };

    const cleanupRecording = () => {
        mediaRecorderRef.current = null;
        recordedChunksRef.current = [];
        streamRef.current = null;
        hasStoppedRef.current = false; // ✅ Reset flag
        isRecordingRef.current = false; // ✅ Reset ref
        setIsRecording(false);
        setIsProcessing(false);
        setRecordingTime(0);
        
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    };

    // UI untuk button recording
    if (!isPlayerReady) {
        return null; // Jangan tampilkan kalau player belum ready
    }

    return (
        <div className="flex items-center">
            {!isRecording && !isProcessing && (
                <button
                    onClick={startRecording}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    title="Mulai Rekam"
                >
                    <VideoCameraIcon className="w-4 h-4" />
                    <span>Record</span>
                </button>
            )}

            {isRecording && (
                <button
                    onClick={() => stopRecording(false)}
                    className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                    title="Stop Rekam"
                >
                    <StopIcon className="w-4 h-4" />
                    <span>Stop</span>
                    <span className="ml-2 font-mono text-xs bg-red-600 px-2 py-0.5 rounded">
                        {formatTime(recordingTime)}
                    </span>
                </button>
            )}

            {isProcessing && (
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                </div>
            )}
        </div>
    );
};

export default RecordingControls;