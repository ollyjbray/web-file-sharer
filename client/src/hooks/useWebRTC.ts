import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export type ConnectionStatus = 'Disconnected' | 'Connecting' | 'Connected' | 'Transferring' | 'Complete';

interface FileMetadata {
  type: 'meta';
  name: string;
  size: number;
  fileType: string;
}

const CHUNK_SIZE = 16 * 1024; // 16KB
const MAX_BUFFER = 1024 * 1024; // 1MB

export function useWebRTC() {
  const [status, setStatus] = useState<ConnectionStatus>('Disconnected');
  const [progress, setProgress] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // Receiving state
  const receiveBufferRef = useRef<ArrayBuffer[]>([]);
  const receivedSizeRef = useRef(0);
  const expectedMetaRef = useRef<FileMetadata | null>(null);

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && roomIdRef.current) {
        console.log('Sending ICE candidate:', event.candidate.candidate);
        socketRef.current.emit('ice-candidate', {
          target: roomIdRef.current, 
          candidate: event.candidate,
        });
      } else if (!event.candidate) {
        console.log('ICE candidate gathering complete');
      }
    };

    peer.onconnectionstatechange = () => {
      console.log('connectionState changed:', peer.connectionState);
      if (peer.connectionState === 'connected') {
        setStatus('Connected');
      } else if (peer.connectionState === 'failed') {
        console.log('Connection failed, attempting ICE restart...');
        peer.restartIce();
      } else if (peer.connectionState === 'disconnected') {
        // Give it a moment to recover before declaring disconnected
        setTimeout(() => {
          if (peer.connectionState === 'disconnected') {
            setStatus('Disconnected');
          }
        }, 3000);
      }
    };

    peer.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', peer.iceGatheringState);
    };

    peer.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', peer.iceConnectionState);
    };

    // Handle receiving data channel
    peer.ondatachannel = (event) => {
      console.log('Data channel received!');
      const receiveChannel = event.channel;
      receiveChannel.binaryType = 'arraybuffer';
      channelRef.current = receiveChannel;
      setupChannelEvents(receiveChannel);
    };

    peerRef.current = peer;
    return peer;
  };

  const setupChannelEvents = (channel: RTCDataChannel) => {
    channel.onopen = () => setStatus('Connected');
    channel.onclose = () => setStatus('Disconnected');
    
    channel.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'meta') {
            expectedMetaRef.current = data;
            receiveBufferRef.current = [];
            receivedSizeRef.current = 0;
            setStatus('Transferring');
            setProgress(0);
          }
        } catch (e) {
          console.error("Failed to parse metadata", e);
        }
      } else if (event.data instanceof ArrayBuffer) {
        receiveBufferRef.current.push(event.data);
        receivedSizeRef.current += event.data.byteLength;
        
        const meta = expectedMetaRef.current;
        if (meta) {
          setProgress((receivedSizeRef.current / meta.size) * 100);
          if (receivedSizeRef.current === meta.size) {
            setStatus('Complete');
            const blob = new Blob(receiveBufferRef.current, { type: meta.fileType });
            downloadBlob(blob, meta.name);
            receiveBufferRef.current = [];
            expectedMetaRef.current = null;
          }
        }
      }
    };
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const connect = useCallback((targetRoomId?: string) => {
    setStatus('Connecting');
    // Connect to local signaling server
    const SIGNAL_URL = import.meta.env.DEV
      ? 'http://localhost:3001'
      : 'https://web-file-sharer-production.up.railway.app';
    const socket = io(SIGNAL_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', targetRoomId);
    });

    socket.on('room-joined', (id: string) => {
      setRoomId(id);
      roomIdRef.current = id;
    });

    socket.on('user-connected', async () => {
      console.log('Received user-connected, creating Peer A and Offer...');
      // Create offer when another user connects
      const peer = createPeer();
      
      const channel = peer.createDataChannel('fileTransfer');
      channel.binaryType = 'arraybuffer';
      channelRef.current = channel;
      setupChannelEvents(channel);

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      
      console.log('Sending offer to room:', roomIdRef.current);
      socket.emit('offer', { target: roomIdRef.current, offer });
    });

    socket.on('offer', async (payload: any) => {
      console.log('Received offer, creating Peer B inside room:', payload.target);
      if (!peerRef.current) {
         console.log('peerRef is null, creating new peer');
         createPeer();
      }
      const peer = peerRef.current!;
      
      await peer.setRemoteDescription(payload.offer);
      console.log('Set remote description from offer');
      
      try {
        // Process queued candidates
        while (pendingCandidatesRef.current.length > 0) {
          const candidate = pendingCandidatesRef.current.shift();
          if (candidate) await peer.addIceCandidate(candidate);
        }
        console.log('Processed queued candidates for Peer B');
      } catch (err) {
        console.error('Error processing queued candidates for Peer B:', err);
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      
      console.log('Sending answer to room:', payload.target);
      // Send answer back
      socket.emit('answer', { target: payload.target, answer });
    });

    socket.on('answer', async (payload: any) => {
      console.log('Received answer payload:', payload);
      if (peerRef.current && peerRef.current.signalingState !== 'stable') {
        console.log('Setting remote description from answer');
        await peerRef.current.setRemoteDescription(payload.answer);
        
        try {
          // Process queued candidates
          while (pendingCandidatesRef.current.length > 0) {
            const candidate = pendingCandidatesRef.current.shift();
            if (candidate) await peerRef.current.addIceCandidate(candidate);
          }
          console.log('Processed queued candidates for Peer A');
        } catch (err) {
          console.error('Error processing queued candidates for Peer A:', err);
        }
      } else {
        console.log('Ignored answer because state is:', peerRef.current?.signalingState);
      }
    });

    socket.on('ice-candidate', async (payload: any) => {
      console.log('Received ICE candidate from socket');
      try {
        if (peerRef.current && peerRef.current.remoteDescription) {
          console.log('Adding ICE candidate instantly');
          await peerRef.current.addIceCandidate(payload.candidate);
        } else {
          console.log('Queueing ICE candidate');
          pendingCandidatesRef.current.push(payload.candidate);
        }
      } catch (err) {
        console.error('Error in socket.on ice-candidate:', err);
      }
    });
  }, []);

  const sendFile = useCallback((file: File) => {
    const channel = channelRef.current;
    if (!channel || channel.readyState !== 'open') return;

    setStatus('Transferring');
    setProgress(0);

    // Send metadata
    const meta: FileMetadata = {
      type: 'meta',
      name: file.name,
      size: file.size,
      fileType: file.type
    };
    channel.send(JSON.stringify(meta));

    // File reading and chunking logic
    let offset = 0;
    const reader = new FileReader();

    channel.bufferedAmountLowThreshold = MAX_BUFFER / 2;

    const readNextChunk = () => {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    };

    const sendChunk = (e: ProgressEvent<FileReader>) => {
      if (e.target?.readyState !== FileReader.DONE) return;
      
      const chunk = e.target.result as ArrayBuffer;
      
      // If backpressure is high, pause until bufferedamountlow fires
      if (channel.bufferedAmount > MAX_BUFFER) {
        const onLow = () => {
          channel.removeEventListener('bufferedamountlow', onLow);
          sendActualChunk(chunk);
        };
        channel.addEventListener('bufferedamountlow', onLow);
      } else {
        sendActualChunk(chunk);
      }
    };

    const sendActualChunk = (chunk: ArrayBuffer) => {
      channel.send(chunk);
      offset += chunk.byteLength;
      setProgress((offset / file.size) * 100);

      if (offset < file.size) {
        readNextChunk();
      } else {
        setStatus('Complete');
      }
    };

    reader.onload = sendChunk;
    readNextChunk();
  }, []);

  const disconnect = useCallback(() => {
    channelRef.current?.close();
    peerRef.current?.close();
    socketRef.current?.disconnect();
    setStatus('Disconnected');
    setRoomId(null);
    roomIdRef.current = null;
    setProgress(0);
    pendingCandidatesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { status, progress, roomId, connect, sendFile, disconnect };
}
